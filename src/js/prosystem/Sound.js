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
import * as Xm from "./ExpansionModule.js"
import * as Cartridge from "./Cartridge.js"
import * as Tia from "./Tia.js"
import * as Events from "../events.js"

var pokey_buffer = Pokey.buffer;
var pokey_Clear = Pokey.Clear;
var tia_buffer = Tia.buffer;
var tia_Clear = Tia.Clear;
var xm_IsPokeyEnabled = Xm.IsPokeyEnabled;
var prosystem_GetFrame = null;

//int wii_sound_length = 0;
var js_sound_length = 0;
//int wii_convert_length = 0;
var js_convert_length = 0;
//#define MAX_BUFFER_SIZE 8192
var MAX_BUFFER_SIZE = 8192;
var store_sound_callback = null;

var prosystem_frequency = 0;
var prosystem_scanlines = 0;
var prosystem_sampleRate = 0;

/** Shadow of Cartridge */  
var cartridge_pokey = false;

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
function sound_Resample(source, target, length) {
  //int measurement = sound_format.nSamplesPerSec;
  var measurement = prosystem_sampleRate;
  //int sourceIndex = 0;
  var sourceIndex = 0;
  //int targetIndex = 0;
  var targetIndex = 0;

  //int max = ((prosystem_frequency * prosystem_scanlines) << 1);
  var max = ((prosystem_frequency * prosystem_scanlines) << 1);
  while (targetIndex < length) {
    if (measurement >= max) {
      target[targetIndex++] = source[sourceIndex];
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

//byte sample[MAX_BUFFER_SIZE] = { 0};
var sample = new Array(MAX_BUFFER_SIZE);
//byte pokeySample[MAX_BUFFER_SIZE] = { 0};
var pokeySample = new Array(MAX_BUFFER_SIZE);

//#ifdef TRACE_SOUND
//static int maxTia = 0, minTia = 0, maxPokey = 0, minPokey = 0;
//static u64 sumTia = 0, sumPokey = 0;
//static int scount = 0;
//static u64 stotalCount = 0;
//#endif

//bool sound_Store() {
function sound_Store() {
  //bool pokey = (cartridge_pokey || xm_pokey_enabled);
  var pokey = (cartridge_pokey || xm_IsPokeyEnabled());

  var prosystem_frame = prosystem_GetFrame();

  //if (sound_muted) sound_SetMuted(false);
  //memset(sample, 0, MAX_BUFFER_SIZE);

  // TODO JS: This seems unnecessary
  /*
  for (var i = 0; i < MAX_BUFFER_SIZE; i++) {
    sample[i] = 0;
  }
  */

  //uint length = 48000 / prosystem_frequency; /* 

  length = sound_GetSampleLength(
    prosystem_sampleRate, prosystem_frame, prosystem_frequency);  /* 48000 / prosystem_frequency */
  //var length = (SAMPLE_RATE / prosystem_frequency) | 0;
  //console.log(length);  
  sound_Resample(tia_buffer, sample, length);
  tia_Clear(); // WII

  if (pokey) {
    //memset(pokeySample, 0, MAX_BUFFER_SIZE);
    // TODO JS: This seems unnecessary
    /*
    for (var i = 0; i < MAX_BUFFER_SIZE; i++) {
      pokeySample[i] = 0;
    }
    */

    sound_Resample(pokey_buffer, pokeySample, length, prosystem_frequency);
    //for (uint index = 0; index < length; index++) {
    for (var index = 0; index < length; index++) {
      //#ifdef TRACE_SOUND
      //stotalCount++;
      //if (sample[index] > maxTia) maxTia = sample[index];
      //if (sample[index] < minTia) minTia = sample[index];
      //if (pokeySample[index] > maxPokey) maxPokey = pokeySample[index];
      //if (pokeySample[index] < minPokey) minPokey = pokeySample[index];
      //sumTia += sample[index];
      //sumPokey += pokeySample[index];
      //#endif
      //u32 sound = sample[index] + pokeySample[index];
      var sound = sample[index] + pokeySample[index];
      sample[index] = sound >>> 1;
    }
  }
  else {
    //for (uint index = 0; index < length; index++) {
    for (var index = 0; index < length; index++) {
      //#ifdef TRACE_SOUND
      //stotalCount++;
      //sumTia += sample[index];
      //if (sample[index] > maxTia) maxTia = sample[index];
      //if (sample[index] < minTia) minTia = sample[index];
      //#endif
      //sample[index] = sample[index] * 0.75; //>> 1;
      sample[index] = (sample[index] * 0.75) | 0; //>> 1;
    }
  }
  pokey_Clear(); // WII

  //wii_storeSound(sample, length);
  if (!sound_muted) {
    store_sound_callback(sample, length);
  }

  //#ifdef TRACE_SOUND
  // if (scount++ == 60) {
  //   net_print_string(NULL, 0, "Pokey: max %d, min %d, avg: %f (sum:%llu, count:%llu)\n",
  //     maxPokey, minPokey, (sumPokey / (double)stotalCount), sumPokey, stotalCount);
  //   net_print_string(NULL, 0, "TIA: max %d, min %d, avg: %f (sum:%llu, count:%llu)\n",
  //     maxTia, minTia, (sumTia / (double)stotalCount), sumTia, stotalCount);
  //   scount = stotalCount = 0;
  //   maxPokey = minPokey = sumPokey = 0;
  //   maxTia = minTia = sumTia = 0;
  // }
  // #endif

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
  console.log("Set sample rate: %d", rate);
  Pokey.SetSampleRate(rate);
  prosystem_sampleRate = rate; 
}

function SetStoreSoundCallback(callback) { 
  store_sound_callback = callback 
}

function OnCartridgeLoaded() {
  cartridge_pokey = Cartridge.IsPokeyEnabled();
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
};
