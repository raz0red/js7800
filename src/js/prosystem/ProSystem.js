// ----------------------------------------------------------------------------
//   ___  ___  ___  ___       ___  ____  ___  _  _
//  /__/ /__/ /  / /__  /__/ /__    /   /_   / |/ /
// /    / \  /__/ ___/ ___/ ___/   /   /__  /    /  emulator
//
// ----------------------------------------------------------------------------
// Copyright 2003, 2004 Greg Stanton
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
// ProSystem.cpp
// ----------------------------------------------------------------------------

import * as WebMouse from "../web/mouse.js"
import * as Region from "./Region.js"
import * as Sound from "./Sound.js"
import * as Pokey from "./Pokey.js"
import * as Xm from "./Xm.js"
import * as Memory from "./Memory.js"
import * as Cartridge from "./Cartridge.js"
import * as Maria from "./Maria.js"
import * as Riot from "./Riot.js"
import * as Sally from "./Sally.js"
import * as Tia from "./Tia.js"
import * as Bios from "./Bios.js"
import * as Events from "../events.js"
import * as XM from "./ExpansionModule.js"
import * as YM from "../3rdparty/ym2151.js"

var Tia_Process = Tia.Process;
var pokey_Frame = Pokey.Frame;
var pokey_Process = Pokey.Process;
var pokey_Scanline = Pokey.Scanline;
var riot_SetInput = Riot.SetInput;
var riot_IsTimingEnabled = Riot.IsTimingEnabled;
var riot_UpdateTimer = Riot.UpdateTimer;
var maria_displayArea = Maria.displayArea;
var maria_RenderScanline = Maria.RenderScanline;
var maria_IsNMI = Maria.IsNMI;
var MARIA_CYCLE_LIMIT = Maria.MARIA_CYCLE_LIMIT;
var memory_ram = Memory.ram;
var sally_ExecuteInstruction = Sally.ExecuteInstruction;
var sally_ExecuteNMI = Sally.ExecuteNMI;
var isLightGunEnabled = Cartridge.IsLightGunEnabled;

var INPT4 = 12;
var WSYNC = 36;
var MSTAT = 40;
var CTRL = 60;

var CARTRIDGE_WSYNC_MASK = 2;
var CARTRIDGE_CYCLE_STEALING_MASK = 1;

// The number of cycles per scan line
var CYCLES_PER_SCANLINE = 454;
// The number of cycles for HBLANK
var HBLANK_CYCLES = 136;

//bool prosystem_active = false;
var prosystem_active = false;
//bool prosystem_paused = false;
var prosystem_paused = false;
//word prosystem_frequency = 60;
var prosystem_frequency = 60;
//byte prosystem_frame = 0;
var prosystem_frame = 0;
//word prosystem_scanlines = 262;
var prosystem_scanlines = 262;
//uint prosystem_cycles = 0;
var prosystem_cycles = 0;
var prosystem_mstat_adjust = 0;


/** The current Maria scan line */
var maria_scanline = 1;

/** Shadow of Cartridge */
var cartridge_pokey = false;
var cartridge_flags = 0;
var cartridge_xm = false;
var cartridge_hblank = 28;

// Set the scanlines for Pokey
Pokey.SetCyclesPerScanline(CYCLES_PER_SCANLINE);

// Whether the last CPU operation resulted in a half cycle (need to take it
// into consideration)
//extern bool half_cycle;

//#ifdef LOWTRACE
//static char msg[512];
//#endif

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void prosystem_Reset() {

let lastPostResetCallback = null;

function prosystem_Reset(postResetCallback) {
  lastPostResetCallback = postResetCallback;
  if (Cartridge.IsLoaded()) {
    maria_scanline = 1;
    prosystem_paused = false;
    prosystem_frame = 0;
    Sally.Reset(); // WII
    Region.Reset();
    Tia.Clear();
    Pokey.Reset();
    Xm.Reset();

    Memory.Reset();
    Maria.Clear();
    Maria.Reset();
    Riot.Reset();
    if (Bios.IsEnabled()) {
      Bios.Store();
    }
    else {
      Cartridge.Store();
    }

    if (postResetCallback) {
      var postHsLoad = function(isSuccess) {
        Events.fireEvent("onHighScoreCartLoaded", isSuccess);
        prosystem_cycles = Sally.ExecuteRES() << 2;
        prosystem_active = true;
        // Invoke post reset callback
        postResetCallback();
      }
      // Load high score cart w/ callback
      Cartridge.LoadHighScoreCart(postHsLoad);
    }
  }
}

/*
  * Strobe based on the current lightgun location
  */
//static void prosystem_FireLightGun()
function prosystem_FireLightGun() {
  var lightGunScanline = WebMouse.getLightGunScanline();
  var lightGunCycle = WebMouse.getLightGunCycle();
  if (((maria_scanline >= lightGunScanline) && (maria_scanline <= (lightGunScanline + 3))) &&
    (prosystem_cycles >= ((lightGunCycle | 0) - 1))) {
    memory_ram[INPT4] &= 0x7f;
  }
  else {
    memory_ram[INPT4] |= 0x80;
  }
}

//uint prosystem_extra_cycles = 0;
var prosystem_extra_cycles = 0;

//uint dbg_saved_cycles = 0;
var dbg_saved_cycles = 0;
//uint dbg_wsync_count = 0;
var dbg_wsync_count = 0;
//uint dbg_maria_cycles = 0;
var dbg_maria_cycles = 0;
//uint dbg_p6502_cycles = 0;
var dbg_p6502_cycles = 0;
//bool dbg_wsync;
var dbg_wsync = false;
//bool dbg_cycle_stealing;
var dbg_cycle_stealing = false;

// ----------------------------------------------------------------------------
// ExecuteFrame
// ----------------------------------------------------------------------------

//#if 0
//extern float wii_orient_roll;
//#endif

//void prosystem_ExecuteFrame(const byte* input)
function prosystem_ExecuteFrame(input) // TODO: input is array
{
	/*
  // Is WSYNC enabled for the current frame?
  //bool wsync = !(cartridge_flags & CARTRIDGE_WSYNC_MASK);
  var wsync = !(cartridge_flags & CARTRIDGE_WSYNC_MASK);
  dbg_wsync = wsync;

  // Is Maria cycle stealing enabled for the current frame?
  //bool cycle_stealing = !(cartridge_flags & CARTRIDGE_CYCLE_STEALING_MASK);
  var cycle_stealing = !(cartridge_flags & CARTRIDGE_CYCLE_STEALING_MASK);
  dbg_cycle_stealing = cycle_stealing;
  */

  var scanlinesPerBupchipTick = 0;
  var bupchipTickScanlines = 0;
  var currentBupchipTick   = 0;

  // Is the lightgun enabled for the current frame?
  var lightgun = (isLightGunEnabled() && (memory_ram[CTRL] & 96) != 64);

  riot_SetInput(input);

  scanlinesPerBupchipTick = ((prosystem_scanlines - 1) / 4) | 0;

  prosystem_extra_cycles = 0;
  dbg_saved_cycles = 0; // debug
  dbg_wsync_count = 0;  // debug
  dbg_maria_cycles = 0; // debug
  dbg_p6502_cycles = 0; // debug

  if (cartridge_pokey || cartridge_xm) pokey_Frame();


  /*
  // Proper fix for Pole Position II (once tested, remove PPII Hack.)
  var m_scanline = 1;
  for (m_scanline = 1; m_scanline <= prosystem_scanlines; m_scanline++) {
      maria_scanline = (m_scanline + 244) % (prosystem_scanlines+1);
  */
  for (maria_scanline = 1; maria_scanline <= prosystem_scanlines; maria_scanline++) {
    //#if 0
    //    if ((int)wii_orient_roll == maria_scanline) {
    //  memory_ram[INPT2] &= 0x7f;
    //} else {
    //  memory_ram[INPT2] |= 0x80;
    //}
    //#endif

    if (maria_scanline == maria_displayArea.top) {
      memory_ram[MSTAT] = 0;
    }
    else if (maria_scanline == (maria_displayArea.bottom - prosystem_mstat_adjust /* PPII Hack */)) {
      memory_ram[MSTAT] = 128;
    }

    // Was a WSYNC performed within the current scanline?
    //bool wsync_scanline = false;
    var wsync_scanline = false;

    //uint cycles = 0;
    var cycles = 0;

    // Reset ProSystem cycles for current frame
      (prosystem_cycles %= CYCLES_PER_SCANLINE) | 0;

    // If lightgun is enabled, check to see if it should be fired
    if (lightgun) prosystem_FireLightGun();

    while (prosystem_cycles < cartridge_hblank) {
      cycles = (sally_ExecuteInstruction() << 2);
      prosystem_cycles += cycles;
      if (lightgun) prosystem_FireLightGun();

      if (Sally.GetHalfCycle())  {
        prosystem_cycles += 2;
        if (lightgun) prosystem_FireLightGun();
      }

      if (riot_IsTimingEnabled()) {
        riot_UpdateTimer(cycles >>> 2);
      }

      if (memory_ram[WSYNC]) {
        dbg_wsync_count++; // debug
        memory_ram[WSYNC] = 0;
        wsync_scanline = true;
        break;
      }
    }

    Xm.setDmaActive(true);
    cycles = (((maria_RenderScanline(maria_scanline))+3)>>>2)<<2;
    if (cycles > MARIA_CYCLE_LIMIT) {
      // cycles = MARIA_CYCLE_LIMIT; // TODO: This causes flicker is Scramble (is it necessary?)
      wsync_scanline = true;
    }
    Xm.setDmaActive(false);

      prosystem_cycles += cycles;
      dbg_maria_cycles += cycles; // debug

      if (riot_IsTimingEnabled()) {
      riot_UpdateTimer((cycles) >>> 2);
    }

    // https://atariage.com/forums/topic/201163-the-truth-about-wsync-and-other-scanline-issues/
    // - The 6502 requires two cycles to acknowledge the NMI.
    // - 0-6 cycles pass as the 6502 finishes the currently executing instruction.
    // Interrupt entry takes 7 cycles.
    if (maria_IsNMI()) {
      if (!wsync_scanline && (prosystem_cycles < CYCLES_PER_SCANLINE)) {
        cycles = (sally_ExecuteInstruction() << 2); // 0-6 cycles pass for current instruction
        if (riot_IsTimingEnabled()) {
        riot_UpdateTimer(cycles >>> 2);
      }
        prosystem_cycles += cycles;

        if (memory_ram[WSYNC]) {
          dbg_wsync_count++; // debug
          memory_ram[WSYNC] = 0;
          wsync_scanline = true;
        }
      }
      sally_ExecuteNMI();
    }

    while (!wsync_scanline && prosystem_cycles < CYCLES_PER_SCANLINE) {
      cycles = (sally_ExecuteInstruction() << 2);
      prosystem_cycles += cycles;
      if (lightgun) prosystem_FireLightGun();

      if (Sally.GetHalfCycle()) {
         prosystem_cycles += 2;
      if (lightgun) prosystem_FireLightGun();
      }

      if (riot_IsTimingEnabled()) {
        riot_UpdateTimer(cycles >>> 2);
      }

      if (memory_ram[WSYNC]) {
        dbg_wsync_count++; // debug
        memory_ram[WSYNC] = 0;
        wsync_scanline = true;
        break;
      }
    }

    // If a WSYNC was performed and the current cycle count is less than
    // the cycles per scanline, add those cycles to current timers.
    if (wsync_scanline && (prosystem_cycles < CYCLES_PER_SCANLINE)) {
      if (riot_IsTimingEnabled()) {
        riot_UpdateTimer((CYCLES_PER_SCANLINE - prosystem_cycles) >>> 2);
      }
      prosystem_cycles = CYCLES_PER_SCANLINE;
    }

    dbg_p6502_cycles += prosystem_cycles; // debug

    if (lightgun) prosystem_FireLightGun();

    Tia_Process(2);
    if (cartridge_pokey || cartridge_xm) {
      pokey_Process(2);
    }

    if (Cartridge.IsBupChip())
    {
       bupchipTickScanlines++;
       if (bupchipTickScanlines == scanlinesPerBupchipTick)
       {
          bupchipTickScanlines = 0;
          window.Module._bupchip_Process(currentBupchipTick);
          currentBupchipTick++;
       }
    }

    if (cartridge_pokey || cartridge_xm) pokey_Scanline();
  }

  prosystem_frame++;
  if (prosystem_frame >= prosystem_frequency) {
    prosystem_frame = 0;
  }
}

// ----------------------------------------------------------------------------
// Pause
// ----------------------------------------------------------------------------
//void prosystem_Pause(bool pause) {
function prosystem_Pause(pause) {
  if (prosystem_active) {
    prosystem_paused = pause;
  }
}

// ----------------------------------------------------------------------------
// Close
// ----------------------------------------------------------------------------
//void prosystem_Close() {
function prosystem_Close() {
  prosystem_active = false;
  prosystem_paused = false;
  Cartridge.Release();
  Maria.Reset();
  Maria.Clear();
  Memory.Reset();
  Tia.Reset();
  Tia.Clear(true);
  Pokey.Reset();
  Pokey.Clear(true);
}

function IsActive() {
  return prosystem_active;
}

function IsPaused() {
  return prosystem_paused;
}

function GetFrequency() {
  return prosystem_frequency;
}

function SetFrequency(freq) {
  prosystem_frequency = freq;
  Sound.SetFrequency(freq);
}

function GetFrame() {
  return prosystem_frame;
}

function GetScanlines() {
  return prosystem_scanlines;
}

function SetScanlines(lines) {
  prosystem_scanlines = lines;
  Sound.SetScanlines(lines);
}

function GetCycles() {
  return prosystem_cycles;
}

function GetExtraCycles() {
  return prosystem_extra_cycles;
}

function GetDebugSavedCycles() {
  return dbg_saved_cycles;
}

function GetDebugWsyncCount() {
  return dbg_wsync_count;
}

function GetDebugMariaCycles() {
  return dbg_maria_cycles;
}

function GetDebug6502Cycles() {
  return dbg_p6502_cycles;
}

function GetDebugWsync() {
  return dbg_wsync;
}

function GetDebugCycleStealing() {
  return dbg_cycle_stealing;
}

function GetMariaScanline() {
  return maria_scanline;
}

function SetMstatAdjust(adjust) {
  prosystem_mstat_adjust = adjust;
}

function OnCartridgeLoaded() {
  cartridge_pokey = Cartridge.IsPokeyEnabled();
  cartridge_xm = Cartridge.IsXmEnabled();
  // cartridge_flags = Cartridge.GetFlags();
  // cartridge_hblank = Cartridge.GetHblank();
}

Events.addListener(
  new Events.Listener("onCartridgeLoaded", OnCartridgeLoaded));

export {
  prosystem_Reset as Reset,
  prosystem_Close as Close,
  prosystem_ExecuteFrame as ExecuteFrame,
  prosystem_Pause as Pause,
  CYCLES_PER_SCANLINE,
  HBLANK_CYCLES,
  IsActive,
  IsPaused,
  GetFrequency,
  SetFrequency,
  GetFrame,
  GetScanlines,
  SetScanlines,
  GetCycles,
  GetExtraCycles,
  GetDebugSavedCycles,
  GetDebugWsyncCount,
  GetDebugMariaCycles,
  GetDebug6502Cycles,
  GetDebugWsync,
  GetDebugCycleStealing,
  GetMariaScanline,
  SetMstatAdjust,
  ProSystemSave,
  ProSystemLoad
}

const PRO_SYSTEM_STATE_HEADER="PRO-SYSTEM STATE";

// ----------------------------------------------------------------------------
// Save
// ----------------------------------------------------------------------------
function ProSystemSave()
{
  const loc_buffer = new Array(40 * 1024 + XM.XM_RAM_SIZE + 4);  

  console.log("Saving game state.");

  let size = 0;

  let index;
  for (index = 0; index < 16; index++) {
    loc_buffer[size + index] = PRO_SYSTEM_STATE_HEADER.charCodeAt(index);
  }
  size += 16;

  loc_buffer[size++] = 1;
  for (index = 0; index < 4; index++) {
    loc_buffer[size + index] = 0;
  }
  size += 4;

  for (index = 0; index < 32; index++) {
    loc_buffer[size + index] = Cartridge.GetDigest().charCodeAt(index);
  }
  size += 32;

  loc_buffer[size++] = Sally.GetSallyA();
  loc_buffer[size++] = Sally.GetSallyX();
  loc_buffer[size++] = Sally.GetSallyY();
  loc_buffer[size++] = Sally.GetSallyP();
  loc_buffer[size++] = Sally.GetSallyS();
  loc_buffer[size++] = Sally.GetSallyPC().getBL();
  loc_buffer[size++] = Sally.GetSallyPC().getBH();
  loc_buffer[size++] = Cartridge.GetCartridgeBank();

  for (index = 0; index < 16384; index++) {
    loc_buffer[size + index] = Memory.ram[index];
  }
  size += 16384;

  if (Cartridge.GetType() == Cartridge.CARTRIDGE_TYPE_SUPERCART_RAM) {
    for (index = 0; index < 16384; index++) {
      loc_buffer[size + index] = Memory.ram[16384 + index];
    }
    size += 16384;
  }

  if (Cartridge.IsHaltBankedRam()) {
    for (index = 0; index < 16384; index++) {
      loc_buffer[size + index] = Memory.mariaRam[16384 + index];
    }
    size += 16384;
  }

  // RIOT state
  loc_buffer[size++] = Riot.GetDRA(); //riot_dra;
  loc_buffer[size++] = Riot.GetDRB(); //riot_drb;
  loc_buffer[size++] = Riot.GetTiming() ? 1 : 0; //Riot.timing;
  loc_buffer[size++] = (0xff & (Riot.GetTimer() >>> 8));
  loc_buffer[size++] = (0xff & Riot.GetTimer());
  loc_buffer[size++] = Riot.GetIntervals(); //riot_intervals;
  loc_buffer[size++] = (0xff & (Riot.GetClocks() >>> 8));
  loc_buffer[size++] = (0xff & Riot.GetClocks());

  // XM (if applicable)
  if (Cartridge.GetCartridgeXM() /*cartridge_xm*/) {
    loc_buffer[size++] = Xm.IsMemEnabled() ? 1 : 0;;
    loc_buffer[size++] = Xm.IsPokeyEnabled() ? 1 : 0;;
    loc_buffer[size++] = Xm.IsYmEnabled() ? 1 : 0;;
    loc_buffer[size++] = Xm.Is48kRamEnabled() ? 1 : 0;;
    loc_buffer[size++] = Xm.IsBank0Enabled() ? 1 : 0;;
    loc_buffer[size++] = Xm.IsBank1Enabled() ? 1 : 0;
    loc_buffer[size++] = Xm.IsRamWeDisabled() ? 1 : 0;
    loc_buffer[size++] = Xm.IsDmaActive() ? 1 : 0;
    loc_buffer[size++] = Xm.GetCntrl1();
    loc_buffer[size++] = Xm.GetCntrl2();
    loc_buffer[size++] = Xm.GetCntrl3();
    loc_buffer[size++] = Xm.GetCntrl4();
    loc_buffer[size++] = Xm.GetCntrl5();
    loc_buffer[size++] = Xm.GetYmAddr();

    for (index = 0; index < Xm.XM_RAM_SIZE; index++) {
      loc_buffer[size + index] = Xm.xm_ram[index];
    }
    size += Xm.XM_RAM_SIZE;
  }

  // Pokey
  let registers = Pokey.registers;
  for (let i = 0; i < registers.length; i++) {
    loc_buffer[size++] = registers[i];
  }

  // YM2151
  registers = YM.getRegisters();
  for (let i = 0; i < registers.length; i++) {
    loc_buffer[size++] = registers[i];
  }

  if (Cartridge.GetType() == Cartridge.CARTRIDGE_TYPE_SOUPER) {
    loc_buffer[size++] = Cartridge.SouperChrBank[0];
    loc_buffer[size++] = Cartridge.SouperChrBank[1];
    loc_buffer[size++] = Cartridge.GetSouperMode();
    loc_buffer[size++] = Cartridge.SouperRamBank[0];
    loc_buffer[size++] = Cartridge.SouperRamBank[1];
    for(index = 0; index < Memory.SouperRam.length; index++) {
      loc_buffer[size++] = Memory.SouperRam[index];
    }
    loc_buffer[size++] = window.Module._bupchip_GetFlags();
    loc_buffer[size++] = window.Module._bupchip_GetVolumeValue();
    loc_buffer[size++] = window.Module._bupchip_GetCurrentSong();
  }

  loc_buffer.length = size;
  return loc_buffer;
}

// ----------------------------------------------------------------------------
// Load
// ----------------------------------------------------------------------------
function ProSystemLoad(loc_buffer) {
  const size = loc_buffer.length;

  console.log("Loading game state.");

  let cbrSize = 0;
  if (Cartridge.IsHaltBankedRam()) {
    cbrSize = 16384
  }

  if (size != (256 + 32 + 16453 + cbrSize) &&
    size != (256 + 32 + 32837 + cbrSize) &&
    size != (256 + 32 + 16453 + 14 + Xm.XM_RAM_SIZE + cbrSize) &&  /* XM without supercart ram */
    size != (256 + 32 + 32837 + 14 + Xm.XM_RAM_SIZE + cbrSize) &&    /* XM with supercart ram */ 
    size != 49517 /* Souper */) {
    console.log("Save buffer has an invalid size.");
    return false;
  }

  var offset = 0;
  for (let index = 0; index < 16; index++) {
    if (String.fromCharCode(loc_buffer[offset + index]) != PRO_SYSTEM_STATE_HEADER[index]) {
      console.log("Buffer is not a valid ProSystem save state.");
      return false;
    }
  }

  offset += 16;
  const version = loc_buffer[offset++];

  const date = 0;
  for (let index = 0; index < 4; index++) {
  }
  offset += 4;

  prosystem_Reset(null);

  let digest = ""
  for (let index = 0; index < 32; index++) {
    digest += String.fromCharCode(loc_buffer[offset + index]);
  }
  offset += 32;
  if (Cartridge.GetDigest() != digest) {
    console.log("Load state digest [" + digest + "] does not match loaded cartridge digest [" + cartridge_digest + "].");
    return false;
  }

  // sally_a = loc_buffer[offset++];
  Sally.SetSallyA(loc_buffer[offset++]);
  // sally_x = loc_buffer[offset++];
  Sally.SetSallyX(loc_buffer[offset++]);
  // sally_y = loc_buffer[offset++];
  Sally.SetSallyY(loc_buffer[offset++]);
  // sally_p = loc_buffer[offset++];
  Sally.SetSallyP(loc_buffer[offset++]);
  // sally_s = loc_buffer[offset++];
  Sally.SetSallyS(loc_buffer[offset++]);
  // sally_pc.b.l = loc_buffer[offset++];
  Sally.GetSallyPC().setBL(loc_buffer[offset++]);
  // sally_pc.b.h = loc_buffer[offset++];
  Sally.GetSallyPC().setBH(loc_buffer[offset++]);

  // cartridge_StoreBank(loc_buffer[offset++]);
  Cartridge.StoreBank(loc_buffer[offset++]);

  for (let index = 0; index < 16384; index++) {
    Memory.ram[index] = loc_buffer[offset + index];
  }
  offset += 16384;

  if (Cartridge.GetType() == Cartridge.CARTRIDGE_TYPE_SUPERCART_RAM) {
    for (let index = 0; index < 16384; index++) {
      Memory.ram[16384 + index] = loc_buffer[offset + index];
    }
    offset += 16384;
  }

  if (Cartridge.IsHaltBankedRam()) {
    for (let index = 0; index < 16384; index++) {
      Memory.mariaRam[16384 + index] = loc_buffer[offset + index];
    }
    offset += 16384;
  }

  // RIOT state
  Riot.SetDRA(loc_buffer[offset++]);
  Riot.SetDRB(loc_buffer[offset++]);
  Riot.SetTiming(loc_buffer[offset++] === 1 ? true : false);
  let h = loc_buffer[offset++];
  let l = loc_buffer[offset++];
  Riot.SetTimerValue(((h << 8) & 0xFF) | (l & 0xFF));
  Riot.SetIntervalsValue(loc_buffer[offset++]);
  h = loc_buffer[offset++];
  l = loc_buffer[offset++];
  Riot.SetClocks(((h << 8) & 0xFF) | (l & 0xFF));

  if (Cartridge.GetCartridgeXM() /*cartridge_xm*/) {
    Xm.SetMemEnabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetPokeyEnabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetYmEnabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.Set48kRamEnabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetBank0Enabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetBank1Enabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetRamWeDisabled(loc_buffer[offset++] === 1 ? true : false);
    Xm.setDmaActive(loc_buffer[offset++] === 1 ? true : false);
    Xm.SetCntrl1(loc_buffer[offset++]);
    Xm.SetCntrl2(loc_buffer[offset++]);
    Xm.SetCntrl3(loc_buffer[offset++]);
    Xm.SetCntrl4(loc_buffer[offset++]);
    Xm.SetCntrl5(loc_buffer[offset++]);
    Xm.SetYmAddr(loc_buffer[offset++]);

    for (let index = 0; index < Xm.XM_RAM_SIZE; index++) {
      Xm.xm_ram[index] = loc_buffer[offset++];
    }
  }

  // Pokey
  for (let i = 0; i < 32; i++) {
    const v = loc_buffer[offset++];
    Pokey.SetRegister(0x4000 + i, v);
  }

  // YM-2151
  for (let i = 0; i < 256; i++) {
    const v = loc_buffer[offset++];
    YM.setReg(i, v);
  }

  if (Cartridge.GetType() == Cartridge.CARTRIDGE_TYPE_SOUPER) {
    Cartridge.SouperChrBank[0] = loc_buffer[offset++];
    Cartridge.SouperChrBank[1] = loc_buffer[offset++];    
    Cartridge.SetSouperMode(loc_buffer[offset++]);
    Cartridge.SouperRamBank[0] = loc_buffer[offset++];
    Cartridge.SouperRamBank[1] = loc_buffer[offset++];
    for(let idx = 0; idx < Memory.SouperRam.length; idx++) {
      Memory.SouperRam[idx] = loc_buffer[offset++];      
    }
    window.Module._bupchip_SetFlags(loc_buffer[offset++]);
    window.Module._bupchip_SetVolumeValue(loc_buffer[offset++]);
    window.Module._bupchip_SetCurrentSong(loc_buffer[offset++]);
    window.Module._bupchip_StateLoaded();
  }

  console.log(loc_buffer.length + ", " + offset);

  return true;
}