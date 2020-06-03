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
var POKEY_STIMER = 0x4009;
var POKEY_SKRES = 0x400a;
var POKEY_POTGO = 0x400b;
var POKEY_SEROUT = 0x400d;
var POKEY_IRQEN = 0x400e;
var POKEY_SKCTLS = 0x400f;

var POKEY_POT0 = 0x4000;
var POKEY_POT1 = 0x4001;
var POKEY_POT2 = 0x4002;
var POKEY_POT3 = 0x4003;
var POKEY_POT4 = 0x4004;
var POKEY_POT5 = 0x4005;
var POKEY_POT6 = 0x4006;
var POKEY_POT7 = 0x4007;
var POKEY_ALLPOT = 0x4008;
var POKEY_KBCODE = 0x4009;
var POKEY_RANDOM = 0x400a;
var POKEY_SERIN = 0x400d;
var POKEY_IRQST = 0x400e;
var POKEY_SKSTAT = 0x400f;

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
var POKEY_DIV_64 = 28;
var POKEY_DIV_15 = 114;
var POKEY_POLY4_SIZE = 0x000f;
var POKEY_POLY5_SIZE = 0x001f;
var POKEY_POLY9_SIZE = 0x01ff;
var POKEY_POLY17_SIZE = 0x0001ffff;
var POKEY_CHANNEL1 = 0;
var POKEY_CHANNEL2 = 1;
var POKEY_CHANNEL3 = 2;
var POKEY_CHANNEL4 = 3;
var POKEY_SAMPLE = 4;
var SK_RESET = 0x03;

var CYCLES_PER_SCANLINE = 0;

//byte pokey_buffer[POKEY_BUFFER_SIZE] = {0};
var pokey_buffer = new Array(POKEY_BUFFER_SIZE);
//uint pokey_size = (POKEY_BUFFER_SIZE - 512); // 524
var pokey_size = (POKEY_BUFFER_SIZE - 512); // 524

//static uint pokey_frequency = 1787520;
var pokey_frequency = 1787520;
//static uint pokey_sampleRate = 31440;
var pokey_sampleRate = 31440; // rate;;
//static uint pokey_soundCntr = 0;
var pokey_soundCntr = 0;
//static byte pokey_audf[4];
var pokey_audf = new Array(0, 0, 0, 0);
//static byte pokey_audc[4];
var pokey_audc = new Array(0, 0, 0, 0);
//static byte pokey_audctl;
var pokey_audctl = 0;
//static byte pokey_output[4];
var pokey_output = new Array(0, 0, 0, 0);
//static byte pokey_outVol[4];
var pokey_outVol = new Array(0, 0, 0, 0);
//static byte pokey_poly04[POKEY_POLY4_SIZE] = {1,1,0,1,1,1,0,0,0,0,1,0,1,0,0};
var pokey_poly04 = new Array(1, 1, 0, 1, 1, 1, 0, 0, 0, 0, 1, 0, 1, 0, 0);
//static byte pokey_poly05[POKEY_POLY5_SIZE] = {0,0,1,1,0,0,0,1,1,1,1,0,0,1,0,1,0,1,1,0,1,1,1,0,1,0,0,0,0,0,1};
var pokey_poly05 = new Array(0, 0, 1, 1, 0, 0, 0, 1, 1, 1, 1, 0, 0, 1, 0, 1, 0, 1, 1, 0, 1, 1, 1, 0, 1, 0, 0, 0, 0, 0, 1);
//static byte pokey_poly17[POKEY_POLY17_SIZE];
var pokey_poly17 = new Array(POKEY_POLY17_SIZE);
//static uint pokey_poly17Size;
var pokey_poly17Size = 0;
//static uint pokey_polyAdjust;
var pokey_polyAdjust = 0;
//static uint pokey_poly04Cntr;
var pokey_poly04Cntr = 0;
//static uint pokey_poly05Cntr;
var pokey_poly05Cntr = 0;
//static uint pokey_poly17Cntr;
var pokey_poly17Cntr = 0;
//static uint pokey_divideMax[4];
var pokey_divideMax = new Array(0, 0, 0, 0);
//static uint pokey_divideCount[4];
var pokey_divideCount = new Array(0, 0, 0, 0);
//static uint pokey_sampleMax;
var pokey_sampleMax = 0;
//static uint pokey_sampleCount[2];
var pokey_sampleCount_0 = 0;
var pokey_sampleCount_1 = 0;
//static uint pokey_baseMultiplier;
var pokey_baseMultiplier = 0;

//static byte rand9[0x1ff];
var rand9 = new Array(0x1ff);
//static byte rand17[0x1ffff];
var rand17 = new Array(0x1ffff);
//static uint r9;
var r9 = 0;
//static uint r17;
var r17 = 0;
//static byte SKCTL;
var SKCTL = 0;
//byte RANDOM;
var RANDOM = 0;

var pokey_debug_count = 0; //100;

//byte POT_input[8] = {228, 228, 228, 228, 228, 228, 228, 228};
var POT_input = new Array(228, 228, 228, 228, 228, 228, 228, 228);
//static int pot_scanline;
var pot_scanline = 0;

//static ullong random_scanline_counter;
var random_scanline_counter = 0;
//static ullong prev_random_scanline_counter;
var prev_random_scanline_counter = 0;

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

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void pokey_Reset() {
function pokey_Reset() {
  var pokey_debug_count = 0; //100;

  pot_scanline = 0;
  pokey_soundCntr = 0;

  //for (int index = 0; index < POKEY_POLY17_SIZE; index++) {
  for (var index = 0; index < POKEY_POLY17_SIZE; index++) {
    //pokey_poly17[index] = rand() & 1;
    pokey_poly17[index] = (Math.random() * 2) | 0;
  }
  pokey_polyAdjust = 0;
  pokey_poly04Cntr = 0;
  pokey_poly05Cntr = 0;
  pokey_poly17Cntr = 0;

  //pokey_sampleMax = ((uint)pokey_frequency << 8) / pokey_sampleRate;
  pokey_sampleMax = ((pokey_frequency << 8) / pokey_sampleRate) | 0;

  //pokey_sampleCount[0] = 0;
  //pokey_sampleCount[1] = 0;
  pokey_sampleCount_0 = 0;
  pokey_sampleCount_1 = 0;

  pokey_poly17Size = POKEY_POLY17_SIZE;

  //for (int channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
  for (var channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
    pokey_outVol[channel] = 0;
    pokey_output[channel] = 0;
    pokey_divideCount[channel] = 0;
    //pokey_divideMax[channel] = 0x7fffffffL;
    pokey_divideMax[channel] = 0x7fffffff;
    pokey_audc[channel] = 0;
    pokey_audf[channel] = 0;
  }

  //for (int i = 0; i < 8; i++) {
  for (var i = 0; i < 8; i++) {
    POT_input[i] = 228;
  }

  pokey_audctl = 0;
  pokey_baseMultiplier = POKEY_DIV_64;

  /* initialize the random arrays */
  rand_init(rand9, 9, 8, 1, 0x00180);
  rand_init(rand17, 17, 16, 1, 0x1c000);

  SKCTL = SK_RESET;
  RANDOM = 0;

  r9 = 0;
  r17 = 0;
  random_scanline_counter = 0;
  prev_random_scanline_counter = 0;

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
          ProSystem.GetCycles() +
          ProSystem.GetExtraCycles());

      if (SKCTL & SK_RESET) {
        //ullong adjust = ((curr_scanline_counter - prev_random_scanline_counter) >> 2);
        var adjust = ((curr_scanline_counter - prev_random_scanline_counter) >>> 2);
        //r9 = (uint)((adjust + r9) % 0x001ff);
        r9 = ((adjust + r9) % 0x001ff) | 0;
        //r17 = (uint)((adjust + r17) % 0x1ffff);
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

// ----------------------------------------------------------------------------
// SetRegister
// ----------------------------------------------------------------------------
//void pokey_SetRegister(word address, byte value) {
function pokey_SetRegister(address, value) {
  if ((pokey_debug_count--) > 0)
    console.log("pokey_setRegister: %d %d", address, value);

  //byte channelMask;
  var channelMask = 0;
  switch (address) {
    case POKEY_POTGO:
      if (!(SKCTL & 4))
        pot_scanline = 0;	/* slow pot mode */
      return;

    case POKEY_SKCTLS:
      SKCTL = value;
      if (value & 4)
        pot_scanline = 228;	/* fast pot mode - return results immediately */
      return;

    case POKEY_AUDF1:
      pokey_audf[POKEY_CHANNEL1] = value;
      channelMask = 1 << POKEY_CHANNEL1;
      if (pokey_audctl & POKEY_CH1_CH2) {
        channelMask |= 1 << POKEY_CHANNEL2;
      }
      break;

    case POKEY_AUDC1:
      pokey_audc[POKEY_CHANNEL1] = value;
      channelMask = 1 << POKEY_CHANNEL1;
      break;

    case POKEY_AUDF2:
      pokey_audf[POKEY_CHANNEL2] = value;
      channelMask = 1 << POKEY_CHANNEL2;
      break;

    case POKEY_AUDC2:
      pokey_audc[POKEY_CHANNEL2] = value;
      channelMask = 1 << POKEY_CHANNEL2;
      break;

    case POKEY_AUDF3:
      pokey_audf[POKEY_CHANNEL3] = value;
      channelMask = 1 << POKEY_CHANNEL3;

      if (pokey_audctl & POKEY_CH3_CH4) {
        channelMask |= 1 << POKEY_CHANNEL4;
      }
      break;

    case POKEY_AUDC3:
      pokey_audc[POKEY_CHANNEL3] = value;
      channelMask = 1 << POKEY_CHANNEL3;
      break;

    case POKEY_AUDF4:
      pokey_audf[POKEY_CHANNEL4] = value;
      channelMask = 1 << POKEY_CHANNEL4;
      break;

    case POKEY_AUDC4:
      pokey_audc[POKEY_CHANNEL4] = value;
      channelMask = 1 << POKEY_CHANNEL4;
      break;

    case POKEY_AUDCTL:
      pokey_audctl = value;
      channelMask = 15;
      if (pokey_audctl & POKEY_POLY9) {
        pokey_poly17Size = POKEY_POLY9_SIZE;
      }
      else {
        pokey_poly17Size = POKEY_POLY17_SIZE;
      }
      if (pokey_audctl & POKEY_CLOCK_15) {
        pokey_baseMultiplier = POKEY_DIV_15;
      }
      else {
        pokey_baseMultiplier = POKEY_DIV_64;
      }
      break;

    default:
      channelMask = 0;
      break;
  }

  //uint newValue = 0;
  var newValue = 0;

  if (channelMask & (1 << POKEY_CHANNEL1)) {
    if (pokey_audctl & POKEY_CH1_179) {
      newValue = pokey_audf[POKEY_CHANNEL1] + 4;
    }
    else {
      newValue = (pokey_audf[POKEY_CHANNEL1] + 1) * pokey_baseMultiplier;
    }

    if (newValue != pokey_divideMax[POKEY_CHANNEL1]) {
      pokey_divideMax[POKEY_CHANNEL1] = newValue;
      if (pokey_divideCount[POKEY_CHANNEL1] > newValue) {
        pokey_divideCount[POKEY_CHANNEL1] = 0;
      }
    }
  }

  if (channelMask & (1 << POKEY_CHANNEL2)) {
    if (pokey_audctl & POKEY_CH1_CH2) {
      if (pokey_audctl & POKEY_CH1_179) {
        newValue = pokey_audf[POKEY_CHANNEL2] * 256 + pokey_audf[POKEY_CHANNEL1] + 7;
      }
      else {
        newValue = (pokey_audf[POKEY_CHANNEL2] * 256 + pokey_audf[POKEY_CHANNEL1] + 1) * pokey_baseMultiplier;
      }
    }
    else {
      newValue = (pokey_audf[POKEY_CHANNEL2] + 1) * pokey_baseMultiplier;
    }
    if (newValue != pokey_divideMax[POKEY_CHANNEL2]) {
      pokey_divideMax[POKEY_CHANNEL2] = newValue;
      if (pokey_divideCount[POKEY_CHANNEL2] > newValue) {
        pokey_divideCount[POKEY_CHANNEL2] = newValue;
      }
    }
  }

  if (channelMask & (1 << POKEY_CHANNEL3)) {
    if (pokey_audctl & POKEY_CH3_179) {
      newValue = pokey_audf[POKEY_CHANNEL3] + 4;
    }
    else {
      newValue = (pokey_audf[POKEY_CHANNEL3] + 1) * pokey_baseMultiplier;
    }
    if (newValue != pokey_divideMax[POKEY_CHANNEL3]) {
      pokey_divideMax[POKEY_CHANNEL3] = newValue;
      if (pokey_divideCount[POKEY_CHANNEL3] > newValue) {
        pokey_divideCount[POKEY_CHANNEL3] = newValue;
      }
    }
  }

  if (channelMask & (1 << POKEY_CHANNEL4)) {
    if (pokey_audctl & POKEY_CH3_CH4) {
      if (pokey_audctl & POKEY_CH3_179) {
        newValue = pokey_audf[POKEY_CHANNEL4] * 256 + pokey_audf[POKEY_CHANNEL3] + 7;
      }
      else {
        newValue = (pokey_audf[POKEY_CHANNEL4] * 256 + pokey_audf[POKEY_CHANNEL3] + 1) * pokey_baseMultiplier;
      }
    }
    else {
      newValue = (pokey_audf[POKEY_CHANNEL4] + 1) * pokey_baseMultiplier;
    }
    if (newValue != pokey_divideMax[POKEY_CHANNEL4]) {
      pokey_divideMax[POKEY_CHANNEL4] = newValue;
      if (pokey_divideCount[POKEY_CHANNEL4] > newValue) {
        pokey_divideCount[POKEY_CHANNEL4] = newValue;
      }
    }
  }

  //for (byte channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
  for (var channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
    if (channelMask & (1 << channel)) {
      if ((pokey_audc[channel] & POKEY_VOLUME_ONLY) ||
        ((pokey_audc[channel] & POKEY_VOLUME_MASK) == 0) ||
        (pokey_divideMax[channel] < (pokey_sampleMax >>> 8))) {
        //#if 1 // WII
        pokey_outVol[channel] = 1;
        //#else
        //pokey_outVol[channel] = pokey_audc[channel] & POKEY_VOLUME_MASK;
        //#endif
        pokey_divideCount[channel] = 0x7fffffff;
        pokey_divideMax[channel] = 0x7fffffff;
      }
    }
  }
}

function bswap(val) {
  return (
    ((val & 0x000000ff) << 24) |
    ((val & 0x0000ff00) << 8) |
    ((val & 0x00ff0000) >>> 8) |
    ((val & 0xff000000) >>> 24)) | 0;
}

function bswap3b(val) {
  return (((val & 0x0000ff00) << 8) | ((val & 0x00ff0000) >>> 8) | ((val & 0xff000000) >>> 24)) | 0;
}

function bswap3bt(val) {
  return (((val & 0x000000ff) << 24) | ((val & 0x0000ff00) << 8) | ((val & 0x00ff0000) >>> 8)) | 0;
}

function getSampleCntrPtrB() {
  return bswap(
    ((bswap3b(pokey_sampleCount_0) & 0x00FFFFFF) << 8) |
    (pokey_sampleCount_1 & 0x000000FF)) | 0;
}

function updateSampleCntrPtrB(val) {
  pokey_sampleCount_0 = bswap(((pokey_sampleCount_0 & 0x000000FF) << 24) | ((bswap3bt(val) >>> 8) & 0x00FFFFFF));
  pokey_sampleCount_1 = bswap((val & 0xFF000000) | (bswap3b(pokey_sampleCount_1) & 0x00FFFFFF));
}

// ----------------------------------------------------------------------------
// Process
// ----------------------------------------------------------------------------
//void pokey_Process(uint length)
function pokey_Process(length) {
  //byte * buffer = pokey_buffer + pokey_soundCntr;
  var buffer = pokey_buffer;
  var buff_idx = pokey_soundCntr;
  //#ifdef BIG_ENDIAN
  //uint * sampleCntrPtrB = (uint *)((byte *) & pokey_sampleCount[0] + 3);
  //#else
  //uint * sampleCntrPtrB = (uint *)((byte *) & pokey_sampleCount[0] + 1);
  //#endif
  //uint size = length;
  var sampleCntrPtrB = getSampleCntrPtrB();

  var size = length;

  while (length) {
    //byte currentValue;
    var currentValue = 0;
    //byte nextEvent = POKEY_SAMPLE;
    var nextEvent = POKEY_SAMPLE;
    //uint eventMin = * sampleCntrPtrB;
    var eventMin = sampleCntrPtrB;

    //byte channel;
    var channel = 0;
    for (channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
      if (pokey_divideCount[channel] <= eventMin) {
        eventMin = pokey_divideCount[channel];
        nextEvent = channel;
      }
    }

    for (channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
      pokey_divideCount[channel] -= eventMin;
    }

    //* sampleCntrPtrB -= eventMin;
    sampleCntrPtrB -= eventMin;
    updateSampleCntrPtrB(sampleCntrPtrB);

    pokey_polyAdjust += eventMin;

    if (nextEvent != POKEY_SAMPLE) {
      pokey_poly04Cntr = (pokey_poly04Cntr + pokey_polyAdjust) % POKEY_POLY4_SIZE;
      pokey_poly05Cntr = (pokey_poly05Cntr + pokey_polyAdjust) % POKEY_POLY5_SIZE;
      pokey_poly17Cntr = (pokey_poly17Cntr + pokey_polyAdjust) % pokey_poly17Size;
      pokey_polyAdjust = 0;
      pokey_divideCount[nextEvent] += pokey_divideMax[nextEvent];

      if ((pokey_audc[nextEvent] & POKEY_NOTPOLY5) || pokey_poly05[pokey_poly05Cntr]) {
        if (pokey_audc[nextEvent] & POKEY_PURE) {
          pokey_output[nextEvent] = !pokey_output[nextEvent];
        }
        else if (pokey_audc[nextEvent] & POKEY_POLY4) {
          pokey_output[nextEvent] = pokey_poly04[pokey_poly04Cntr];
        }
        else {
          pokey_output[nextEvent] = pokey_poly17[pokey_poly17Cntr];
        }
      }

      if (pokey_output[nextEvent]) {
        pokey_outVol[nextEvent] = pokey_audc[nextEvent] & POKEY_VOLUME_MASK;
      }
      else {
        pokey_outVol[nextEvent] = 0;
      }
    }
    else {
      //#ifdef BIG_ENDIAN
      //  * (pokey_sampleCount + 1) += pokey_sampleMax;
      //#else 
      //* pokey_sampleCount += pokey_sampleMax;
      //#endif
      pokey_sampleCount_0 += pokey_sampleMax;
      sampleCntrPtrB = getSampleCntrPtrB();

      currentValue = 0;

      for (channel = POKEY_CHANNEL1; channel <= POKEY_CHANNEL4; channel++) {
        currentValue += pokey_outVol[channel];
      }

      currentValue = (currentValue << 2) + 8;

      //* buffer++ = currentValue;
      buffer[buff_idx] = currentValue;
      buff_idx++;

      length--;
    }
  }

  pokey_soundCntr += size;
  if (pokey_soundCntr >= pokey_size) {
    pokey_soundCntr = 0;
  }
}

// ----------------------------------------------------------------------------
// Clear
// ----------------------------------------------------------------------------
//void pokey_Clear() {
function pokey_Clear(flush) {
  pokey_soundCntr = 0;
  //memset(pokey_buffer, 0, POKEY_BUFFER_SIZE);
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
  SetCyclesPerScanline
}
