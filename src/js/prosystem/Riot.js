// ----------------------------------------------------------------------------
//   ___  ___  ___  ___       ___  ____  ___  _  _
//  /__/ /__/ /  / /__  /__/ /__    /   /_   / |/ /
// /    / \  /__/ ___/ ___/ ___/   /   /__  /    /  emulator
//
// ----------------------------------------------------------------------------
// Copyright 2005 Greg Stanton
//
// This program is free software; you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation; either version 2 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program; if not, write to the Free Software
// Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
// ----------------------------------------------------------------------------
// Riot.cpp
// ----------------------------------------------------------------------------

import * as Memory from "./Memory.js"
import * as Events from "../events.js"

var memory_ram = null;
var memory_Write = null;

var INPT0       = 8;
var INPT1       = 9;
var INPT2       = 10;
var INPT3       = 11;
var INPT4       = 12;
var INPT5       = 13;
var SWCHA       = 640;
var CTLSWA      = 641;
var SWCHB       = 642;
var CTLSWB      = 643;
var INTIM       = 644;
var INTFLG      = 645;
var TIM1T       = 660;
var TIM8T       = 661;
var TIM64T      = 662;
var T1024T      = 663;

// RIOT interval timer. INTIM is computed from the CPU cycle count when it is
// read: after a write of N the first decrement comes 1 cycle later, then one
// every interval; after underflow the timer counts down once per cycle.
var riot_cycles = 0;             // CPU cycles since reset
var riot_timer_reg = 0;          // Value last written to TIMxT
var riot_cycles_when_set = 0;
var riot_interval_shift = 6;     // 1T: 0, 8T: 3, 64T: 6, 1024T: 10
var riot_read_after_int = false; // INTIM was read after underflow

//byte riot_dra = 0;
var riot_dra = 0;
//byte riot_drb = 0;
var riot_drb = 0;

// Debug, count the number of times a RIOT timer was used
//unsigned int riot_timer_count = 0;
var riot_timer_count = 0;

//void riot_Reset(void) {
function riot_Reset() {
  riot_SetDRA(0);
  riot_SetDRB(0);

  riot_cycles = 0;
  riot_timer_reg = 0;
  riot_cycles_when_set = 0;
  riot_interval_shift = 6;
  riot_read_after_int = false;

  riot_timer_count = 0; // debug
}

// ----------------------------------------------------------------------------
// SetInput
// +----------+--------------+-------------------------------------------------
// | Offset   | Controller   | Control
// +----------+--------------+-------------------------------------------------
// | 00       | Joystick 1   | Right
// | 01       | Joystick 1   | Left
// | 02       | Joystick 1   | Down
// | 03       | Joystick 1   | Up
// | 04       | Joystick 1   | Button 1
// | 05       | Joystick 1   | Button 2
// | 06       | Joystick 2   | Right
// | 07       | Joystick 2   | Left
// | 08       | Joystick 2   | Down
// | 09       | Joystick 2   | Up
// | 10       | Joystick 2   | Button 1
// | 11       | Joystick 2   | Button 2
// | 12       | Console      | Reset
// | 13       | Console      | Select
// | 14       | Console      | Pause
// | 15       | Console      | Left Difficulty
// | 16       | Console      | Right Difficulty
// +----------+--------------+-------------------------------------------------
//void riot_SetInput(const byte* input) {
function riot_SetInput(input) { // TODO JS: Input will be array

  /*gdement: 	Comments are messy, but wanted to document how this all works.
  Changed this routine to support 1 vs 2 button modes.
  Also added the interaction of CTLSWA and DRA on the SWCHA output, and same for SWCHB.
  SWCHA is directionals.  SWCHB is console switches and button mode.
  button signals are in high bits of INPT0-5.*/

  //memory_ram[SWCHA] = ((~memory_ram[CTLSWA]) | riot_dra);	/*SWCHA as driven by RIOT*/
  memory_ram[SWCHA] = (((~memory_ram[CTLSWA]) | riot_dra) & 0xFF);	/*SWCHA as driven by RIOT*/
  /*now console switches will force bits to ground:*/
  //if (input[0x00]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x80;
  if (input[0x00]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x80) & 0xFF;
  //if (input[0x01]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x40;
  if (input[0x01]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x40) & 0xFF;
  //if (input[0x02]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x20;
  if (input[0x02]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x20) & 0xFF;
  //if (input[0x03]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x10;
  if (input[0x03]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x10) & 0xFF;
  //if (input[0x06]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x08;
  if (input[0x06]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x08) & 0xFF;
  //if (input[0x07]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x04;
  if (input[0x07]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x04) & 0xFF;
  //if (input[0x08]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x02;
  if (input[0x08]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x02) & 0xFF;
  //if (input[0x09]) memory_ram[SWCHA] = memory_ram[SWCHA] & ~0x01;
  if (input[0x09]) memory_ram[SWCHA] = (memory_ram[SWCHA] & ~0x01) & 0xFF;

  /*Switches can always push the appropriate bit of SWCHA to ground, as in above code block.
  In addition, RIOT can be configured to drive ground even when switch is open.
  By doing this it's possible for real hardware to behave as if switches are permanently held (tested this).*/

  /*As with swcha, the value seen at SWCHB is derived from CTLSWB and DRB (an internal RIOT register)
  (Any write to SWCHB actually gets stored in DRB)
  If a given bit in CTLSWB is 0 (input mode), then RIOT puts a 1 on SWCHB.
  If bit in CTLSWB is 1 (output mode), then RIOT puts stored DRB value on SWCHB.
  The SWCHB outputs from RIOT can be overdriven to 0 by console switches.
  The CTLSWB/DRB interaction is important at bits 2 and 4, which control button mode for each player.
  Bit 5 appears unused, and other bits are the console switches.

  CTLSWB		DRB		SWCHB		result on button mode (for bits 2 and 4)
  -------		---		-----		-----------------------------------------
  0			0		1			1 button mode  - this is default state after boot
  0			1		1			1 button mode
  1			0		0			2 button mode
  1			1		1			1 button mode
  This chart was confirmed on hardware
  From the default state after boot, simply changing CTLSWB to 1 will result in 2 button mode.
  Some games rely on this, and don't actually store anything to SWCHB.*/

  //memory_ram[SWCHB] = ((~memory_ram[CTLSWB]) | riot_drb);	/*SWCHB as driven by RIOT*/
  memory_ram[SWCHB] = (((~memory_ram[CTLSWB]) | riot_drb) & 0xFF);	/*SWCHB as driven by RIOT*/

  //if (input != NULL) {
  if (input != null) {
    /*now the console switches can force certain bits to ground:*/
    //if (input[0x0c]) memory_ram[SWCHB] = memory_ram[SWCHB] & ~0x01;
    if (input[0x0c]) memory_ram[SWCHB] = (memory_ram[SWCHB] & ~0x01) & 0xFF;
    //if (input[0x0d]) memory_ram[SWCHB] = memory_ram[SWCHB] & ~0x02;
    if (input[0x0d]) memory_ram[SWCHB] = (memory_ram[SWCHB] & ~0x02) & 0xFF;
    //if (input[0x0e]) memory_ram[SWCHB] = memory_ram[SWCHB] & ~0x08;
    if (input[0x0e]) memory_ram[SWCHB] = (memory_ram[SWCHB] & ~0x08) & 0xFF;
    //if (input[0x0f]) memory_ram[SWCHB] = memory_ram[SWCHB] & ~0x40;
    if (input[0x0f]) memory_ram[SWCHB] = (memory_ram[SWCHB] & ~0x40) & 0xFF;
    //if (input[0x10]) memory_ram[SWCHB] = memory_ram[SWCHB] & ~0x80;
    if (input[0x10]) memory_ram[SWCHB] = (memory_ram[SWCHB] & ~0x80) & 0xFF;
  }

  /*When in 1 button mode, only the legacy 2600 button signal is active.  The others stay off.
  When in 2 button mode, only the new signals are active.  2600 button stays off.	(tested)
  see:  http://www.atariage.com/forums/index.php?showtopic=127162
  also see 7800 schematic and RIOT datasheet  */

  if (memory_ram[SWCHB] & 0x04)	//first player in 1 button mode
  {
    memory_ram[INPT0] &= 0x7f;		//new style buttons are always off in this mode
    memory_ram[INPT1] &= 0x7f;
    if (input[0x04] || input[0x05])	//in this mode, either button triggers only the legacy button signal
    {
      memory_ram[INPT4] &= 0x7f;	//this button signal activates by turning off the high bit
    }
    else {
      memory_ram[INPT4] |= 0x80;
    }
  }
  else			//first player in 2 button mode
  {
    memory_ram[INPT4] |= 0x80;		//2600 button is always off in this mode
    if (input[0x04])					//left button (button 1)
    {
      memory_ram[INPT1] |= 0x80;	//these buttons activate by turning on the high bit.
    }
    else {
      memory_ram[INPT1] &= 0x7f;
    }
    if (input[0x05])					//right button (button 2)
    {
      memory_ram[INPT0] |= 0x80;
    }
    else {
      memory_ram[INPT0] &= 0x7f;
    }
  }

  /*now repeat for 2nd player*/
  if (memory_ram[SWCHB] & 0x10) {
    memory_ram[INPT2] &= 0x7f;
    memory_ram[INPT3] &= 0x7f;
    if (input[0x0a] || input[0x0b]) {
      memory_ram[INPT5] &= 0x7f;
    }
    else {
      memory_ram[INPT5] |= 0x80;
    }
  }
  else {
    memory_ram[INPT5] |= 0x80;
    if (input[0x0a]) {
      memory_ram[INPT3] |= 0x80;
    }
    else {
      memory_ram[INPT3] &= 0x7f;
    }
    if (input[0x0b]) {
      memory_ram[INPT2] |= 0x80;
    }
    else {
      memory_ram[INPT2] &= 0x7f;
    }
  }
}

/***********************************************************************************
* riot_setDRA(byte data) and riot_setDRB(byte data)		gdement
* -------------------------------------------------
* Stores a value written to SWCHA/SWCHB into the RIOT's internal DRA/DRB registers.
* These are distinct from what you see when reading SWCHA/SWCHB.
***********************************************************************************/
//void riot_SetDRA(byte data) {
function riot_SetDRA(data) {
  riot_dra = data;
}

//void riot_SetDRB(byte data) {
function riot_SetDRB(data) {
  riot_drb = data;

  // Make changes to joystick buttons immediately. This was added to make
  // The high score cart work properly with Asteroids
  //memory_ram[SWCHB] &= (~0x14);
  memory_ram[SWCHB] = (memory_ram[SWCHB] & (~0x14)) & 0xFF;
  //memory_ram[SWCHB] |= (((~memory_ram[CTLSWB]) | riot_drb) & 0x14);
  memory_ram[SWCHB] = (memory_ram[SWCHB] | (((~memory_ram[CTLSWB]) | riot_drb) & 0x14)) & 0xFF;
}

// ----------------------------------------------------------------------------
// SetTimer
// ----------------------------------------------------------------------------
//void riot_SetTimer(word timer, byte intervals) {
function riot_SetTimer(timer, intervals) {
  riot_timer_reg = intervals & 0xFF;
  riot_cycles_when_set = riot_cycles;
  riot_read_after_int = false;
  riot_interval_shift = SHIFTS[timer & 3];
  riot_timer_count++; // debug
}

// TIM1T, TIM8T, TIM64T, T1024T (by the low 2 address bits)
var SHIFTS = [0, 3, 6, 10];
var TIMERS = [TIM1T, TIM8T, TIM64T, T1024T];

// ----------------------------------------------------------------------------
// UpdateTimer
// ----------------------------------------------------------------------------
// Advances the timer by the given number of CPU cycles.
function riot_UpdateTimer(cycles) {
  riot_cycles += cycles;
}

// INTIM read
function riot_ReadIntim() {
  var delta = riot_cycles - riot_cycles_when_set;
  var ticks = Math.floor((delta + (1 << riot_interval_shift) - 1) / (1 << riot_interval_shift));
  if (ticks <= riot_timer_reg) {
    riot_read_after_int = false;
    return riot_timer_reg - ticks;
  }
  // Reading INTIM after underflow acknowledges the interrupt flag
  riot_read_after_int = true;
  var underflow_delta = delta - riot_timer_reg * (1 << riot_interval_shift) - 1;
  return (0xFF - (underflow_delta & 0xFF)) & 0xFF;
}

// Interrupt flag read (not cleared by reading it)
function riot_ReadIntflg() {
  var delta = riot_cycles - riot_cycles_when_set;
  var expired = delta > riot_timer_reg * (1 << riot_interval_shift);
  return (expired && !riot_read_after_int) ? 0xC0 : 0x00;
}

function IsTimingEnabled() {
  return true;
}

function GetTimerCount() {
  return riot_timer_count;
}

function init() {
  memory_ram = Memory.ram;
  memory_Write = Memory.Write;
}


function GetDRA() {
  return riot_dra;
}

function GetDRB() {
  return riot_drb;
}

function GetTiming() {
  return true;
}

function SetTiming(t) {
}

// Save state: the timer register written last
function GetTimer() {
  return TIMERS[SHIFTS.indexOf(riot_interval_shift)];
}

function SetTimerValue(t) {
  riot_interval_shift = SHIFTS[t & 3];
}

// Save state: the value written to the timer
function GetIntervals() {
  return riot_timer_reg;
}

function SetIntervalsValue(i) {
  riot_timer_reg = i & 0xFF;
}

// Save state: cycles since the timer was written (saturated)
function GetClocks() {
  return Math.min(riot_cycles - riot_cycles_when_set, 0xFFFF);
}

function SetClocks(c) {
  riot_cycles_when_set = riot_cycles - c;
  riot_read_after_int = false;
}

Events.addListener(new Events.Listener("init", init));

export {
  riot_UpdateTimer as UpdateTimer,
  riot_ReadIntim as ReadIntim,
  riot_ReadIntflg as ReadIntflg,
  riot_SetDRB as SetDRB,
  riot_SetDRA as SetDRA,
  riot_SetInput as SetInput,
  riot_Reset as Reset,
  riot_SetTimer as SetTimer,
  GetDRA,
  GetDRB,
  GetTiming,
  SetTiming,
  GetTimer,
  GetIntervals,
  GetClocks,
  SetClocks,
  IsTimingEnabled,
  GetTimerCount,
  SetTimerValue,
  SetIntervalsValue
}

