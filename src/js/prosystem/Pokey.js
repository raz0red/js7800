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
// PokeySound is Copyright(c) 1997 by Ron Fries
//
// This library is free software; you can redistribute it and/or modify it
// under the terms of version 2 of the GNU Library General Public License
// as published by the Free Software Foundation.
//
// This library is distributed in the hope that it will be useful, but
// WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU Library
// General Public License for more details.
// To obtain a copy of the GNU Library General Public License, write to the
// Free Software Foundation, Inc., 675 Mass Ave, Cambridge, MA 02139, USA.
//
// Any permitted reproduction of these routines, in whole or in part, must
// bear this legend.
// ----------------------------------------------------------------------------
// Pokey.cpp
// ----------------------------------------------------------------------------

import * as ProSystem from "./ProSystem.js"

var POKEY_BUFFER_SIZE = 2048; // WII

var POKEY_AUDF1 = 0x4000;
var POKEY_AUDC1 = 0x4001;
var POKEY_AUDF2 = 0x4002;
var POKEY_AUDC2 = 0x4003;
var POKEY_AUDF3 = 0x4004;
var POKEY_AUDC3 = 0x4005;
var POKEY_AUDF4 = 0x4006;
var POKEY_AUDC4 = 0x4007;
var POKEY_AUDCTL = 0x4008;
// var POKEY_STIMER = 0x4009;
// var POKEY_SKRES = 0x400a;
var POKEY_POTGO = 0x400b;
// var POKEY_SEROUT = 0x400d;
// var POKEY_IRQEN = 0x400e;
var POKEY_SKCTL = 0x400f;

// var POKEY_POT0 = 0x4000;
// var POKEY_POT1 = 0x4001;
// var POKEY_POT2 = 0x4002;
// var POKEY_POT3 = 0x4003;
// var POKEY_POT4 = 0x4004;
// var POKEY_POT5 = 0x4005;
// var POKEY_POT6 = 0x4006;
// var POKEY_POT7 = 0x4007;
var POKEY_ALLPOT = 0x4008;
// var POKEY_KBCODE = 0x4009;
var POKEY_RANDOM = 0x400a;
// var POKEY_SERIN = 0x400d;
// var POKEY_IRQST = 0x400e;
// var POKEY_SKSTAT = 0x400f;

var POKEY_NOTPOLY5 = 0x80;
var POKEY_POLY4 = 0x40;
var POKEY_PURE = 0x20;
var POKEY_VOLUME_ONLY = 0x10;
var POKEY_VOLUME_MASK = 0x0f;
var POKEY_POLY9 = 0x80;
var POKEY_CH1_179 = 0x40;
var POKEY_CH3_179 = 0x20;
var POKEY_CH1_CH2 = 0x10;
var POKEY_CH3_CH4 = 0x08;
var POKEY_CH1_FILTER = 0x04;
var POKEY_CH2_FILTER = 0x02;
var POKEY_CLOCK_15 = 0x01;
var DIV_64 = 28;
var DIV_15 = 114;
var POKEY_POLY4_SIZE = 0x000f;
var POKEY_POLY5_SIZE = 0x001f;
var POKEY_POLY9_SIZE = 0x01ff;
var POKEY_POLY17_SIZE = 0x0001ffff;
var POKEY_CHANNEL1 = 0;
var POKEY_CHANNEL2 = 1;
var POKEY_CHANNEL3 = 2;
var POKEY_CHANNEL4 = 3;
// var POKEY_SAMPLE = 4;
var SK_RESET = 0x03;
var SK_TWOTONE = 0x08;

var CLK_1 = 0;
var CLK_28 = 1;
var CLK_114 = 2;

var clock_count = new Array(0, 0, 0);

var CYCLES_PER_SCANLINE = 0;

var pokey_buffer = new Array(POKEY_BUFFER_SIZE);
var pokey_size = (POKEY_BUFFER_SIZE - 512); // 524

var pokey_frequency = 1787520;
var pokey_sampleRate = 31440; // rate;;
var pokey_soundCntr = 0;
var pokey_audf = new Array(0, 0, 0, 0);
var pokey_audc = new Array(0, 0, 0, 0);
var pokey_audctl = 0;
var pokey_output = new Array(0, 0, 0, 0);
var pokey_poly04 = new Array(1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0);
var pokey_poly05 = new Array(0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1);
var pokey_poly09 = new Array(POKEY_POLY9_SIZE);
var pokey_poly17 = new Array(POKEY_POLY17_SIZE);
// var pokey_polyAdjust = 0;
var pokey_poly04Cntr = 0;
var pokey_poly05Cntr = 0;
var pokey_poly09Cntr = 0;
var pokey_poly17Cntr = 0;
var pokey_divideCount = new Array(0, 0, 0, 0);
var pokey_borrowCount = new Array(0, 0, 0, 0);
var pokey_sampleMax = 0;
var pokey_sampleCount_0 = 0;
var pokey_sampleCount_1 = 0;

var rand9 = new Array(0x1ff);
var rand17 = new Array(0x1ffff);
var r9 = 0;
var r17 = 0;
var pokey_skctl = 0;
var RANDOM = 0;

var pokey_debug_count = 0; //100;

var POT_input = new Array(228, 228, 228, 228, 228, 228, 228, 228);
var pot_scanline = 0;

var random_scanline_counter = 0;
var prev_random_scanline_counter = 0;

var pokey_filter = new Array(1, 1, 0, 0);

//static void rand_init(byte *rng, int size, int left, int right, int add)
function rand_init(rng, size, left, right, add) {
  //int mask = (1 << size) - 1;
  var mask = (1 << size) - 1;
  //int i, x = 0;
  var x = 0;
  var idx = 0;

  //for( i = 0; i < mask; i++ )
  for (var i = 0; i < mask; i++) {
    if (size == 17)
      //*rng = x >> 6;	/* use bits 6..13 */
      rng[idx] = x >>> 6;	/* use bits 6..13 */
    else
      //*rng = x;		/* use bits 0..7 */
      rng[idx] = x;
    //rng++;
    idx++;
    /* calculate next bit */
    x = ((x << left) + (x >>> right) + add) & mask;
  }
}

//void pokey_setSampleRate(uint rate) {
function pokey_setSampleRate(rate) {
  rate = 31440;
  pokey_sampleRate = rate; // rate;
  console.log('set pokey sample rate: %d', pokey_sampleRate);
}

function init_poly09() {
  var mask = (1 << 9) - 1;
  var lfsr = mask;
  for (var i = 0; i < mask; i++) {
    var bin = ((lfsr >> 0) & 1) ^ ((lfsr >> 5) & 1);
    lfsr = lfsr >> 1;
    lfsr = (bin << 8) | lfsr;
    pokey_poly09[i] = lfsr & 1;
  }
}

function init_poly17() {
  var mask = (1 << 17) - 1;
  var lfsr = mask;
  for (var i = 0; i < mask; i++) {
    var bin8 = ((lfsr >> 8) & 1) ^ ((lfsr >> 13) & 1);
    var bin = (lfsr & 1);
    lfsr = lfsr >> 1;
    lfsr = (lfsr & 0xff7f) | (bin8 << 7);
    lfsr = (bin << 16) | lfsr;
    pokey_poly17[i] = lfsr & 1;
  }
}


// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void pokey_Reset() {
function pokey_Reset() {
  pokey_debug_count = 0; //100;

  pot_scanline = 0;
  pokey_soundCntr = 0;

  for (let i = 0; i < 32; i++) {
    registers[i] = 0;
  }

  init_poly09();
  init_poly17();

  // pokey_polyAdjust = 0;
  pokey_poly04Cntr = 0;
  pokey_poly05Cntr = 0;
  pokey_poly09Cntr = 0;
  pokey_poly17Cntr = 0;

  pokey_sampleMax = ((pokey_frequency << 8) / pokey_sampleRate) | 0;

  pokey_sampleCount_0 = 0;
  pokey_sampleCount_1 = 0;

  for (var channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
    pokey_output[channel] = 0;
    pokey_divideCount[channel] = 0;
    pokey_audc[channel] = 0;
    pokey_audf[channel] = 0;
  }

  for (var i = 0; i < 8; i++) {
    POT_input[i] = 228;
  }


  /* initialize the random arrays */
  rand_init(rand9, 9, 8, 1, 0x00180);
  rand_init(rand17, 17, 16, 1, 0x1c000);

  //pokey_skctl = SK_RESET;
  pokey_skctl = 0;
  RANDOM = 0;
  pokey_audctl = 0;

  r9 = 0;
  r17 = 0;
  random_scanline_counter = 0;
  prev_random_scanline_counter = 0;

  pokey_filter[0] = 1;
  pokey_filter[1] = 1;
  pokey_filter[2] = 0;
  pokey_filter[3] = 0;

  pokey_Clear(true);
}

/* Called prior to each frame */
//void pokey_Frame() {
function pokey_Frame() {
}

/* Called prior to each scanline */
//void pokey_Scanline() {
function pokey_Scanline() {
  random_scanline_counter += CYCLES_PER_SCANLINE;

  if (pot_scanline < 228)
    pot_scanline++;
}

//byte pokey_GetRegister(word address) {
function pokey_GetRegister(address) {
  if ((pokey_debug_count--) > 0)
    console.log("pokey_getRegister: %d", address);

  //byte data = 0;
  var data = 0;

  //byte addr = address & 0x0f;
  var addr = address & 0x0f;
  if (addr < 8) {
    //byte b = POT_input[addr];
    var b = POT_input[addr];
    if (b <= pot_scanline)
      return b;
    return pot_scanline;
  }

  switch (address) {
    case POKEY_ALLPOT: {
      //byte b = 0;
      var b = 0;
      //for (int i = 0; i < 8; i++)
      for (var i = 0; i < 8; i++)
        if (POT_input[addr] <= pot_scanline)
          b &= ~(1 << i);		/* reset bit if pot value known */
      return b;
    }
    case POKEY_RANDOM:
      //ullong curr_scanline_counter =
      var curr_scanline_counter =
        (random_scanline_counter +
          ProSystem.GetCycles());

      if (pokey_skctl & SK_RESET) {
        var adjust = ((curr_scanline_counter - prev_random_scanline_counter) >>> 2);
        r9 = ((adjust + r9) % 0x001ff) | 0;
        r17 = ((adjust + r17) % 0x1ffff) | 0;
      }
      else {
        r9 = 0;
        r17 = 0;
      }
      if (pokey_audctl & POKEY_POLY9) {
        RANDOM = rand9[r9];
      }
      else {
        RANDOM = rand17[r17];
      }

      prev_random_scanline_counter = curr_scanline_counter;

      RANDOM = RANDOM ^ 0xff;
      data = RANDOM;
      break;
  }

  return data;
}

const registers = Array(32);

// ----------------------------------------------------------------------------
// SetRegister
// ----------------------------------------------------------------------------
function pokey_SetRegister(address, value) {
  if ((pokey_debug_count--) > 0)
    console.log("pokey_setRegister: %d %d", address - 0x4000, value);
  registers[address - 0x4000] = value;

  switch (address) {
    case POKEY_POTGO:
      if (!(pokey_skctl & 4))
        pot_scanline = 0;	/* slow pot mode */
      return;

    case POKEY_SKCTL:
      pokey_skctl = value;
      if (value & 4)
        pot_scanline = 228;	/* fast pot mode - return results immediately */
      return;

    case POKEY_AUDF1:
      pokey_audf[POKEY_CHANNEL1] = value;
      break;
    case POKEY_AUDC1:
      pokey_audc[POKEY_CHANNEL1] = value;
      break;

    case POKEY_AUDF2:
      pokey_audf[POKEY_CHANNEL2] = value;
      break;
    case POKEY_AUDC2:
      pokey_audc[POKEY_CHANNEL2] = value;
      break;

    case POKEY_AUDF3:
      pokey_audf[POKEY_CHANNEL3] = value;
      break;
    case POKEY_AUDC3:
      pokey_audc[POKEY_CHANNEL3] = value;
      break;

    case POKEY_AUDF4:
      pokey_audf[POKEY_CHANNEL4] = value;
      break;
    case POKEY_AUDC4:
      pokey_audc[POKEY_CHANNEL4] = value;
      break;

    case POKEY_AUDCTL:
      pokey_audctl = value;
      break;

    default:
      break;
  }

}

function inc_chan(chan, cycl) {
  pokey_divideCount[chan] = (pokey_divideCount[chan] + 1) & 0xff;
  if (pokey_divideCount[chan] == 0 && pokey_borrowCount[chan] == 0)
    pokey_borrowCount[chan] = cycl;
}

function check_borrow(chan) {
  if (pokey_borrowCount[chan] > 0) {
    pokey_borrowCount[chan]--;
    return (pokey_borrowCount[chan] == 0);
  }
  return 0;
}

function reset_channel(chan) {
  pokey_divideCount[chan] = pokey_audf[chan] ^ 0xff;
  pokey_borrowCount[chan] = 0;
}

function process_channel(chan) {
  if ((pokey_audc[chan] & POKEY_NOTPOLY5) || pokey_poly05[pokey_poly05Cntr]) {
    if (pokey_audc[chan] & POKEY_PURE)
      pokey_output[chan] ^= 1;
    else if (pokey_audc[chan] & POKEY_POLY4)
      pokey_output[chan] = pokey_poly04[pokey_poly04Cntr];
    else if (pokey_audctl & POKEY_POLY9)
      pokey_output[chan] = pokey_poly09[pokey_poly09Cntr];
    else
      pokey_output[chan] = pokey_poly17[pokey_poly17Cntr];
  }
}

// ----------------------------------------------------------------------------
// Process
// ----------------------------------------------------------------------------
function pokey_Process(length) {
  var buffer = pokey_buffer;
  var buff_idx = pokey_soundCntr;
  var clock_divisors = new Array(1, DIV_64, DIV_15);
  var size = length;
  var pcycles;

  while (length) {
    var currentValue = 0;

    // DEBUG... new code...

    for (pcycles = 0; pcycles < (CYCLES_PER_SCANLINE / 8); pcycles++) {

      var clk;
      var clock_triggered = new Array(0, 0, 0);
      var base_clock = (pokey_audctl & POKEY_CLOCK_15) ? CLK_114 : CLK_28;

      if (pokey_skctl & SK_RESET) // clocks don't run when in reset
      {

        for (clk = 0; clk < 3; clk++) {
          clock_count[clk]++;
          if (clock_count[clk] >= clock_divisors[clk]) {
            clock_count[clk] = 0;
            clock_triggered[clk] = 1;
          }
        }

        pokey_poly04Cntr = (pokey_poly04Cntr + 1) % POKEY_POLY4_SIZE;
        pokey_poly05Cntr = (pokey_poly05Cntr + 1) % POKEY_POLY5_SIZE;
        pokey_poly09Cntr = (pokey_poly09Cntr + 1) % POKEY_POLY9_SIZE;
        pokey_poly17Cntr = (pokey_poly17Cntr + 1) % POKEY_POLY17_SIZE;

        if ((pokey_audctl & POKEY_CH1_179) && (clock_triggered[CLK_1])) {
          if (pokey_audctl & POKEY_CH1_CH2)
            inc_chan(POKEY_CHANNEL1, 7);
          else
            inc_chan(POKEY_CHANNEL1, 4);
        }

        if ((!(pokey_audctl & POKEY_CH1_179)) && (clock_triggered[base_clock]))
          inc_chan(POKEY_CHANNEL1, 1);

        if ((pokey_audctl & POKEY_CH3_179) && (clock_triggered[CLK_1])) {
          if (pokey_audctl & POKEY_CH3_CH4)
            inc_chan(POKEY_CHANNEL3, 7);
          else
            inc_chan(POKEY_CHANNEL3, 4);
        }

        if ((!(pokey_audctl & POKEY_CH3_179)) && (clock_triggered[base_clock]))
          inc_chan(POKEY_CHANNEL3, 1);

        if (clock_triggered[base_clock]) {
          if (!(pokey_audctl & POKEY_CH1_CH2))
            inc_chan(POKEY_CHANNEL2, 1);
          if (!(pokey_audctl & POKEY_CH3_CH4))
            inc_chan(POKEY_CHANNEL4, 1);
        }
      } // ! in reset

      if (check_borrow(POKEY_CHANNEL3)) {
        if (pokey_audctl & POKEY_CH3_CH4)
          inc_chan(POKEY_CHANNEL4, 1);
        else
          reset_channel(POKEY_CHANNEL3);

        process_channel(POKEY_CHANNEL3);

        if (pokey_audctl & POKEY_CH1_FILTER)
          pokey_filter[POKEY_CHANNEL1] = pokey_output[POKEY_CHANNEL1]; // filter sample()
        else
          pokey_filter[POKEY_CHANNEL1] = 1;
      }

      if (check_borrow(POKEY_CHANNEL4)) {
        if (pokey_audctl & POKEY_CH3_CH4)
          reset_channel(POKEY_CHANNEL3);

        reset_channel(POKEY_CHANNEL4);
        process_channel(POKEY_CHANNEL4);

        if (pokey_audctl & POKEY_CH2_FILTER)
          pokey_filter[POKEY_CHANNEL2] = pokey_output[POKEY_CHANNEL2]; // filter sample()
        else
          pokey_filter[POKEY_CHANNEL2] = 1;
      }

      if ((pokey_skctl & SK_TWOTONE) && (pokey_borrowCount[POKEY_CHANNEL2] == 1))
        reset_channel(POKEY_CHANNEL1)

      if (check_borrow(POKEY_CHANNEL1)) {
        if (pokey_audctl & POKEY_CH1_CH2)
          inc_chan(POKEY_CHANNEL2, 1);
        else
          reset_channel(POKEY_CHANNEL1);

        process_channel(POKEY_CHANNEL1);
      }

      if (check_borrow(POKEY_CHANNEL2)) {
        if (pokey_audctl & POKEY_CH1_CH2)
          reset_channel(POKEY_CHANNEL1);

        reset_channel(POKEY_CHANNEL2);
        process_channel(POKEY_CHANNEL2);
      }

      // all up all of the output values and divide later, to low-pass filter
      for (var ch = POKEY_CHANNEL1; ch <= POKEY_CHANNEL4; ch++)
        currentValue += ((((pokey_output[ch] ^ pokey_filter[ch]) || (pokey_audc[ch] & POKEY_VOLUME_ONLY)) ? (pokey_audc[ch] & POKEY_VOLUME_MASK) : 0)) << 2;

    } // pcycle loop

    currentValue = currentValue / pcycles;

    pokey_sampleCount_0 += pokey_sampleMax;

    buffer[buff_idx] = currentValue;
    buff_idx++;

    length--;
  }

  pokey_soundCntr += size;
  if (pokey_soundCntr >= pokey_size)
    pokey_soundCntr = 0;
}

// ----------------------------------------------------------------------------
// Clear
// ----------------------------------------------------------------------------
//void pokey_Clear() {
function pokey_Clear(flush) {
  pokey_soundCntr = 0;
  if (flush) {
    for (var i = 0; i < POKEY_BUFFER_SIZE; i++) {
      pokey_buffer[i] = 0;
    }
  }
}

function SetCyclesPerScanline(cycles) {
  CYCLES_PER_SCANLINE = cycles;
}

export {
  pokey_Clear as Clear,
  pokey_Process as Process,
  pokey_SetRegister as SetRegister,
  pokey_Reset as Reset,
  pokey_GetRegister as GetRegister,
  pokey_setSampleRate as SetSampleRate,
  pokey_Frame as Frame,
  pokey_Scanline as Scanline,
  pokey_buffer as buffer,
  SetCyclesPerScanline,
  registers
}
