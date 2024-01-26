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
// Sound.cpp
// ----------------------------------------------------------------------------

import * as ProSystem from "./ProSystem.js"
import * as Pokey from "./Pokey.js"
import * as Xm from "./Xm.js"
import * as Cartridge from "./Cartridge.js"
import * as Tia from "./Tia.js"
import * as Events from "../events.js"
import * as YM from "../3rdparty/ym2151.js"

var pokey_buffer = Pokey.buffer;
var pokey_Clear = Pokey.Clear;
var tia_buffer = Tia.buffer;
var tia_Clear = Tia.Clear;
var xm_IsPokeyEnabled = Xm.IsPokeyEnabled;
var xm_IsYmEnabled = Xm.IsYmEnabled;
var prosystem_GetFrame = null;

//#define MAX_BUFFER_SIZE 8192
var MAX_BUFFER_SIZE = 8192;
var store_sound_callback = null;

var prosystem_frequency = 0;
var prosystem_scanlines = 0;
var prosystem_sampleRate = 0;

/** Shadow of Cartridge */  
var cartridge_pokey = false;
var cartridge_bupchip = false;

// /* LUDO: */
// typedef unsigned short WORD;
// typedef unsigned int   DWORD;
// typedef struct { 
//     WORD  wFormatTag; 
//     WORD  nChannels; 
//     DWORD nSamplesPerSec; 
//     DWORD nAvgBytesPerSec; 
//     WORD  nBlockAlign; 
//     WORD  wBitsPerSample; 
//     WORD  cbSize; 
// } WAVEFORMATEX; 

// # define WAVE_FORMAT_PCM 0

// static const WAVEFORMATEX SOUND_DEFAULT_FORMAT = {WAVE_FORMAT_PCM, 1, 48000, 48000, 1, 8, 0};
// static WAVEFORMATEX sound_format = SOUND_DEFAULT_FORMAT;

/*
var sound_format = {
  wFormatTag: 0,
  nChannels: 1,
  nSamplesPerSec: SAMPLE_RATE,
  nAvgBytesPerSec: SAMPLE_RATE,
  nBlockAlign: 1,
  wBitsPerSample: 8,
  cbSize: 0
};
*/

//static bool sound_muted = false;
var sound_muted = false;

// ----------------------------------------------------------------------------
// GetSampleLength
// ----------------------------------------------------------------------------
//static uint sound_GetSampleLength(uint length, uint unit, uint unitMax) {
function sound_GetSampleLength(length, unit, unitMax) {
  //uint sampleLength = length / unitMax;  
  var sampleLength = (length / unitMax) | 0;
  //uint sampleRemain = length % unitMax;
  var sampleRemain = (length % unitMax) | 0;
  if (sampleRemain != 0 && sampleRemain >= unit) {
    sampleLength++;
  }
  return sampleLength;
}

// ----------------------------------------------------------------------------
// Resample
// ----------------------------------------------------------------------------
//static void sound_Resample(const byte* source, byte* target, int length) {
function sound_Resample(tia, pokey, target, length) {
  var measurement = prosystem_sampleRate;
  var sourceIndex = 0;
  var targetIndex = 0;

//  var max = 31440;
  var max = ((prosystem_frequency * prosystem_scanlines) << 1);


  while (targetIndex < length) {
    if (measurement >= max) {
      target[targetIndex++] = tia[sourceIndex] + (pokey ? pokey[sourceIndex] : 0);      
      measurement -= max;
    } else {
      sourceIndex++;
      measurement += prosystem_sampleRate;
    }
  }
}


// ----------------------------------------------------------------------------
// Initialize
// ----------------------------------------------------------------------------
//bool sound_Initialize() {
function sound_Initialize() {
  InitialiseAudio();
  return true;
}

// ----------------------------------------------------------------------------
// SetFormat
// ----------------------------------------------------------------------------
//bool sound_SetFormat(WAVEFORMATEX format) {
function sound_SetFormat(format) {
  sound_format = format;
  return true;
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------

var sample = new Array(MAX_BUFFER_SIZE);
var ymBuffer = new Array(MAX_BUFFER_SIZE);

function sound_Store() {
  var pokey = (cartridge_pokey || xm_IsPokeyEnabled());
  var ym = xm_IsYmEnabled();
  var prosystem_frame = prosystem_GetFrame();

  var length = sound_GetSampleLength(
    prosystem_sampleRate, prosystem_frame, prosystem_frequency);   
    
  sound_Resample(tia_buffer, (pokey ? pokey_buffer : null), sample, length);

  if (cartridge_bupchip) {
    let bupBuffer = new Int16Array(Module.HEAP16.buffer, window.Module._bupchip_GetBupChipBuffer(), length << 1);
    for (let i = 0; i < length; i++) {
      const curr = (sample[i] / 255);
      let n = (bupBuffer[i * 2]);
      if (n !== undefined) {
        sample[i] = ((n / 32768) + (bupBuffer[i * 2 + 1] / 32768)) / 2;
      }  else {
        sample[i] = 0;
      }      
      sample[i] = ((curr * .4) + (sample[i] * .6));
      sample[i] *= 255;
    }
  }

   tia_Clear();
   pokey_Clear();

  if (ym) {
    YM.mixStereo(ymBuffer, length, 0);
  }

  if (!sound_muted) {
    store_sound_callback(sample, (ym ? ymBuffer : null), length);
  }

  return true;
}

// ----------------------------------------------------------------------------
// Play
// ----------------------------------------------------------------------------
//bool sound_Play() {
function sound_Play() {
  //ResetAudio();
  return true;
}

// ----------------------------------------------------------------------------
// Stop
// ----------------------------------------------------------------------------
//bool sound_Stop() {
function sound_Stop() {
  //StopAudio();
  return true;
}

// ----------------------------------------------------------------------------
// SetSampleRate
// ----------------------------------------------------------------------------
//bool sound_SetSampleRate(uint rate) {
/*
function sound_SetSampleRate(rate) {  
  sound_format.nSamplesPerSec = rate;
  sound_format.nAvgBytesPerSec = rate;
  return sound_SetFormat(sound_format);
}
*/

// ----------------------------------------------------------------------------
// GetSampleRate
// ----------------------------------------------------------------------------
//uint sound_GetSampleRate() {
/*
function sound_GetSampleRate() {  
  return sound_format.nSamplesPerSec;
}
*/

// ----------------------------------------------------------------------------
// SetMuted
// ----------------------------------------------------------------------------
//bool sound_SetMuted(bool muted) {
function sound_SetMuted(muted) {
  /*
  if (sound_muted != muted) {
    if (!muted) {
      if (!sound_Play()) {
        return false;
      }
    }
    else {
      if (!sound_Stop()) {
        return false;
      }
    }
    sound_muted = muted;
  }
  */
  sound_muted = muted;
  return true;
}

// ----------------------------------------------------------------------------
// IsMuted
// ----------------------------------------------------------------------------
//bool sound_IsMuted() {
function sound_IsMuted() {
  return sound_muted;
}

function SetFrequency(freq) { 
  prosystem_frequency = freq; 
}

function SetScanlines(lines) { 
  prosystem_scanlines = lines 
}

function SetSampleRate(rate) { 
  if (cartridge_bupchip) {
    rate = 31440;
  }
  console.log("Set sample rate: %d", rate);
  Pokey.SetSampleRate(rate);
  YM.setSampleRate(rate);
  prosystem_sampleRate = rate; 
}

function SetStoreSoundCallback(callback) { 
  store_sound_callback = callback 
}

function OnCartridgeLoaded() {
  cartridge_pokey = Cartridge.IsPokeyEnabled();
  cartridge_bupchip = Cartridge.IsBupChip();
}

function init() {
  prosystem_GetFrame = ProSystem.GetFrame;
}

Events.addListener(
  new Events.Listener("init", init));
Events.addListener(
  new Events.Listener("onCartridgeLoaded", OnCartridgeLoaded));

export {
  sound_Store as Store,
  sound_SetMuted as SetMuted,
  SetFrequency,
  SetScanlines,
  SetSampleRate,
  SetStoreSoundCallback
}