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

js7800.ProSystem = (function () {
  'use strict';

  var Tia = js7800.Tia;
  var Tia_Process = Tia.Process;
  var Pokey = js7800.Pokey;
  var pokey_Frame = Pokey.Frame;
  var pokey_Process = Pokey.Process;
  var pokey_Scanline = Pokey.Scanline;
  var Riot = js7800.Riot;
  var riot_SetInput = Riot.SetInput;
  var riot_IsTimingEnabled = Riot.IsTimingEnabled;
  var riot_UpdateTimer = Riot.UpdateTimer;
  var Region = js7800.Region;
  var Xm = js7800.Xm;
  var Maria = js7800.Maria;
  var maria_displayArea = Maria.displayArea;
  var maria_RenderScanline = Maria.RenderScanline;
  var Memory = js7800.Memory;
  var memory_ram = Memory.ram;
  var Sally = js7800.Sally;
  var sally_ExecuteInstruction = Sally.ExecuteInstruction;
  var Bios = js7800.Bios;  
  var Cartridge = js7800.Cartridge;  
  var Sound = js7800.Sound;

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

  /** The current Maria scan line */
  var maria_scanline = 1;

  /** Shadow of Cartridge */  
  var cartridge_pokey = false;
  var cartridge_flags = 0;
  var cartridge_xm = false;
  var cartridge_hblank = 34;

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
  function prosystem_Reset() {
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
      // Load the high score cartridge
      //cartridge_LoadHighScoreCart();
      prosystem_cycles = Sally.ExecuteRES();
      prosystem_active = true;
    }
  }

  /*
   * Strobe based on the current lightgun location
   */
  //static void prosystem_FireLightGun()
  function prosystem_FireLightGun() {
    if (((maria_scanline >= lightgun_scanline) &&
      (maria_scanline <= (lightgun_scanline + 3))) &&
      // (prosystem_cycles >= ((int)lightgun_cycle ) - 1 ) )
      (prosystem_cycles >= (lightgun_cycle | 0) - 1)) {
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
    // Is WSYNC enabled for the current frame?
    //bool wsync = !(cartridge_flags & CARTRIDGE_WSYNC_MASK);
    var wsync = !(cartridge_flags & CARTRIDGE_WSYNC_MASK);
    dbg_wsync = wsync;

    // Is Maria cycle stealing enabled for the current frame?
    //bool cycle_stealing = !(cartridge_flags & CARTRIDGE_CYCLE_STEALING_MASK);
    var cycle_stealing = !(cartridge_flags & CARTRIDGE_CYCLE_STEALING_MASK);
    dbg_cycle_stealing = cycle_stealing;

    // Is the lightgun enabled for the current frame?
    //bool lightgun =
    var lightgun = false; // (lightgun_enabled && (memory_ram[CTRL] & 96) != 64);

    riot_SetInput(input);

    prosystem_extra_cycles = 0;
    dbg_saved_cycles = 0; // debug
    dbg_wsync_count = 0;  // debug
    dbg_maria_cycles = 0; // debug
    dbg_p6502_cycles = 0; // debug    

    if (cartridge_pokey || cartridge_xm) pokey_Frame();

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
      else if (maria_scanline == maria_displayArea.bottom) {
        memory_ram[MSTAT] = 128;
      }

      // Was a WSYNC performed within the current scanline?
      //bool wsync_scanline = false;
      var wsync_scanline = false;

      //uint cycles = 0;
      var cycles = 0;

      if (!cycle_stealing || (memory_ram[CTRL] & 96) != 64) {
        // Exact cycle counts when Maria is disabled        
        (prosystem_cycles %= CYCLES_PER_SCANLINE) | 0;
        prosystem_extra_cycles = 0;
      }
      else {
        prosystem_extra_cycles = ((prosystem_cycles % CYCLES_PER_SCANLINE) | 0);
        dbg_saved_cycles += prosystem_extra_cycles;

        // Some fudge for Maria cycles. Unfortunately Maria cycle counting
        // isn't exact (This adds some extra cycles).
        prosystem_cycles = 0;
      }

      // If lightgun is enabled, check to see if it should be fired
      if (lightgun) prosystem_FireLightGun();

      while (prosystem_cycles < cartridge_hblank) {
        cycles = sally_ExecuteInstruction();
        prosystem_cycles += (cycles << 2);
        if (half_cycle) prosystem_cycles += 2;

        dbg_p6502_cycles += (cycles << 2); // debug

        if (riot_IsTimingEnabled()) {
          riot_UpdateTimer(cycles);
        }

        // If lightgun is enabled, check to see if it should be fired
        if (lightgun) prosystem_FireLightGun();

        if (memory_ram[WSYNC] && wsync) {
          dbg_wsync_count++; // debug
          //memory_ram[WSYNC] = false;
          memory_ram[WSYNC] = 0;
          wsync_scanline = true;
          break;
        }
      }

      cycles = maria_RenderScanline(maria_scanline);

      if (cycle_stealing) {
        prosystem_cycles += cycles;
        dbg_maria_cycles += cycles; // debug

        if (riot_IsTimingEnabled()) {
          riot_UpdateTimer(cycles >>> 2);
        }
      }

      while (!wsync_scanline && prosystem_cycles < CYCLES_PER_SCANLINE) {
        cycles = sally_ExecuteInstruction();
        prosystem_cycles += (cycles << 2);
        if (half_cycle) prosystem_cycles += 2;

        dbg_p6502_cycles += (cycles << 2); // debug

        // If lightgun is enabled, check to see if it should be fired
        if (lightgun) prosystem_FireLightGun();

        if (riot_IsTimingEnabled()) {
          riot_UpdateTimer(cycles);
        }

        if (memory_ram[WSYNC] && wsync) {
          dbg_wsync_count++; // debug
          //memory_ram[WSYNC] = false;
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

      // If lightgun is enabled, check to see if it should be fired
      if (lightgun) prosystem_FireLightGun();

      Tia_Process(2);
      if (cartridge_pokey || cartridge_xm) {
        pokey_Process(2);
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

  return {
    Reset: prosystem_Reset,
    Close: prosystem_Close,
    ExecuteFrame: prosystem_ExecuteFrame,
    IsActive: function () { return prosystem_active; },
    IsPaused: function () { return prosystem_paused; },
    GetFrequency: function () { return prosystem_frequency; },
    SetFrequency: function (freq) {
      prosystem_frequency = freq;
      Sound.SetFrequency(freq);
    },
    GetFrame: function () { return prosystem_frame; },
    GetScanlines: function () { return prosystem_scanlines; },
    SetScanlines: function (lines) {
      prosystem_scanlines = lines;
      Sound.SetScanlines(lines);
    },
    GetCycles: function () { return prosystem_cycles; },
    GetExtraCycles: function () { return prosystem_extra_cycles; },
    GetDebugSavedCycles: function() { return dbg_saved_cycles; },
    GetDebugWsyncCount: function() { return dbg_wsync_count; },
    GetDebugMariaCycles: function() { return dbg_maria_cycles; },
    GetDebug6502Cycles: function() { return dbg_p6502_cycles; },
    GetDebugWsync: function() { return dbg_wsync; },
    GetDebugCycleStealing: function() { return dbg_cycle_stealing; },
    GetMariaScanline: function() { return maria_scanline; },  
    OnCartridgeLoaded: function() {
      cartridge_pokey = Cartridge.IsPokeyEnabled();
      cartridge_xm = Cartridge.IsXmEnabled();
      cartridge_flags = Cartridge.GetFlags();      
      cartridge_hblank = Cartridge.GetHblank();
    },
    CYCLES_PER_SCANLINE: CYCLES_PER_SCANLINE
  }
})();

// byte * loc_buffer = 0;

// // ----------------------------------------------------------------------------
// // Save
// // ----------------------------------------------------------------------------
// bool prosystem_Save(std:: string filename, bool compress)
// {

//   if (filename.empty() || filename.length() == 0) {
//     logger_LogError("Filename is invalid.", PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   if (!loc_buffer) loc_buffer = (byte *)malloc((33000 + XM_RAM_SIZE + 4) * sizeof(byte));

//   logger_LogInfo("Saving game state to file " + filename + ".");

//   uint size = 0;

//   uint index;
//   for (index = 0; index < 16; index++) {
//     loc_buffer[size + index] = PRO_SYSTEM_STATE_HEADER[index];
//   }
//   size += 16;

//   loc_buffer[size++] = 1;
//   for (index = 0; index < 4; index++) {
//     loc_buffer[size + index] = 0;
//   }
//   size += 4;

//   for (index = 0; index < 32; index++) {
//     loc_buffer[size + index] = cartridge_digest[index];
//   }
//   size += 32;

//   loc_buffer[size++] = sally_a;
//   loc_buffer[size++] = sally_x;
//   loc_buffer[size++] = sally_y;
//   loc_buffer[size++] = sally_p;
//   loc_buffer[size++] = sally_s;
//   loc_buffer[size++] = sally_pc.b.l;
//   loc_buffer[size++] = sally_pc.b.h;
//   loc_buffer[size++] = cartridge_bank;

//   for (index = 0; index < 16384; index++) {
//     loc_buffer[size + index] = memory_ram[index];
//   }
//   size += 16384;

//   if (cartridge_type == CARTRIDGE_TYPE_SUPERCART_RAM) {
//     for (index = 0; index < 16384; index++) {
//       loc_buffer[size + index] = memory_ram[16384 + index];
//     }
//     size += 16384;
//   }

//   // RIOT state
//   loc_buffer[size++] = riot_dra;
//   loc_buffer[size++] = riot_drb;
//   loc_buffer[size++] = Riot.timing;
//   loc_buffer[size++] = (0xff & (riot_timer >>> 8));
//   loc_buffer[size++] = (0xff & riot_timer);
//   loc_buffer[size++] = riot_intervals;
//   loc_buffer[size++] = (0xff & (riot_clocks >>> 8));
//   loc_buffer[size++] = (0xff & riot_clocks);

//   // XM (if applicable)
//   if (cartridge_xm) {
//     loc_buffer[size++] = xm_reg;
//     loc_buffer[size++] = xm_bank;
//     loc_buffer[size++] = xm_pokey_enabled;
//     loc_buffer[size++] = xm_mem_enabled;

//     #if 0
// net_print_string(NULL, 0, "Wrote XM: xm_reg: %d, xm_bank: %d, xm_pokey_enabled: %d, xm_mem_enabled: %d\n",
//       xm_reg, xm_bank, xm_pokey_enabled, xm_mem_enabled);
//     #endif

//     for (index = 0; index < XM_RAM_SIZE; index++) {
//       loc_buffer[size + index] = xm_ram[index];
//     }
//     size += XM_RAM_SIZE;
//   }

//   FILE * file = fopen(filename.c_str(), "wb");
//   if (file == NULL) {
//     logger_LogError("Failed to open the file " + filename + " for writing.",
//       PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   if (fwrite(loc_buffer, 1, size, file) != size) {
//     fclose(file);
//     logger_LogError(
//       "Failed to write the save state data to the file " + filename + ".",
//       PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   fflush(file);
//   fclose(file);

//   return true;
// }

// // ----------------------------------------------------------------------------
// // Load
// // ----------------------------------------------------------------------------
// bool prosystem_Load(const std:: string filename) {

//   if(filename.empty() || filename.length() == 0) {
//   logger_LogError("Filename is invalid.", PRO_SYSTEM_SOURCE);
//   return false;
// }

// if (!loc_buffer) loc_buffer = (byte *)malloc((33000 + XM_RAM_SIZE + 4) * sizeof(byte));

// logger_LogInfo("Loading game state from file " + filename + ".");

// uint size = archive_GetUncompressedFileSize(filename);
// if (size == 0) {
//   FILE * file = fopen(filename.c_str(), "rb");
//   if (file == NULL) {
//     logger_LogError("Failed to open the file " + filename + " for reading.", PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   if (fseek(file, 0, SEEK_END)) {
//     fclose(file);
//     logger_LogError("Failed to find the end of the file.", PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   size = ftell(file);
//   if (fseek(file, 0, SEEK_SET)) {
//     fclose(file);
//     logger_LogError("Failed to find the size of the file.", PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   if (size != 16445 && size != 32829 &&     /* no RIOT */
//     size != 16453 && size != 32837 &&     /* with RIOT */
//     size != (16453 + 4 + XM_RAM_SIZE) &&  /* XM without supercart ram */
//     size != (32837 + 4 + XM_RAM_SIZE))    /* XM with supercart ram */ {
//     fclose(file);
//     logger_LogError("Save state file has an invalid size.", PRO_SYSTEM_SOURCE);
//     return false;
//   }

//   if (fread(loc_buffer, 1, size, file) != size && ferror(file)) {
//     fclose(file);
//     logger_LogError("Failed to read the file data.", PRO_SYSTEM_SOURCE);
//     return false;
//   }
//   fclose(file);
// }
// else {
//   logger_LogError("Save state file has an invalid size.", PRO_SYSTEM_SOURCE);
//   return false;
// }

// uint offset = 0;
// uint index;
// for (index = 0; index < 16; index++) {
//   if (loc_buffer[offset + index] != PRO_SYSTEM_STATE_HEADER[index]) {
//     logger_LogError("File is not a valid ProSystem save state.", PRO_SYSTEM_SOURCE);
//     return false;
//   }
// }
// offset += 16;
// byte version = loc_buffer[offset++];

// uint date = 0;
// for (index = 0; index < 4; index++) {
// }
// offset += 4;

// prosystem_Reset();

// char digest[33] = { 0};
// for (index = 0; index < 32; index++) {
//   digest[index] = loc_buffer[offset + index];
// }
// offset += 32;
// if (cartridge_digest != std:: string(digest)) {
//   logger_LogError("Load state digest [" + std:: string(digest) + "] does not match loaded cartridge digest [" + cartridge_digest + "].", PRO_SYSTEM_SOURCE);
//   return false;
// }

// sally_a = loc_buffer[offset++];
// sally_x = loc_buffer[offset++];
// sally_y = loc_buffer[offset++];
// sally_p = loc_buffer[offset++];
// sally_s = loc_buffer[offset++];
// sally_pc.b.l = loc_buffer[offset++];
// sally_pc.b.h = loc_buffer[offset++];

// cartridge_StoreBank(loc_buffer[offset++]);

// for (index = 0; index < 16384; index++) {
//   memory_ram[index] = loc_buffer[offset + index];
// }
// offset += 16384;

// if (cartridge_type == CARTRIDGE_TYPE_SUPERCART_RAM) {
//   if (size != 32829 && /* no RIOT */
//     size != 32837 && /* with RIOT */
//     size != (32837 + 4 + XM_RAM_SIZE)) /* XM */ {
//     logger_LogError("Save state file has an invalid size.",
//       PRO_SYSTEM_SOURCE);
//     return false;
//   }
//   for (index = 0; index < 16384; index++) {
//     memory_ram[16384 + index] = loc_buffer[offset + index];
//   }
//   offset += 16384;
// }

// if (size == 16453 || /* no supercart ram */
//   size == 32837 || /* supercart ram */
//   size == (16453 + 4 + XM_RAM_SIZE) || /* xm, no supercart ram */
//   size == (32837 + 4 + XM_RAM_SIZE)) /* xm, supercart ram */ {
//   // RIOT state
//   riot_dra = loc_buffer[offset++];
//   riot_drb = loc_buffer[offset++];
//   Riot.timing = loc_buffer[offset++];
//   riot_timer = (loc_buffer[offset++] << 8);
//   riot_timer |= loc_buffer[offset++];
//   riot_intervals = loc_buffer[offset++];
//   riot_clocks = (loc_buffer[offset++] << 8);
//   riot_clocks |= loc_buffer[offset++];
// }

// // XM (if applicable)
// if (cartridge_xm) {
//   if ((size != (16453 + 4 + XM_RAM_SIZE)) &&
//     (size != (32837 + 4 + XM_RAM_SIZE))) {
//     logger_LogError("Save state file has an invalid size.",
//       PRO_SYSTEM_SOURCE);
//     return false;
//   }
//   xm_reg = loc_buffer[offset++];
//   xm_bank = loc_buffer[offset++];
//   xm_pokey_enabled = loc_buffer[offset++];
//   xm_mem_enabled = loc_buffer[offset++];

//   #if 0
// net_print_string(NULL, 0, "Read XM: xm_reg: %d, xm_bank: %d, xm_pokey_enabled: %d, xm_mem_enabled: %d\n",
//     xm_reg, xm_bank, xm_pokey_enabled, xm_mem_enabled);
//   #endif

//   for (index = 0; index < XM_RAM_SIZE; index++) {
//     xm_ram[index] = loc_buffer[offset++];
//   }
// }

// return true;
// }

