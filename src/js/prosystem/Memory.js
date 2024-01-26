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
// Memory.cpp
// ----------------------------------------------------------------------------

import * as Xm from "./Xm.js"
import * as Pokey from "./Pokey.js"
import * as Cartridge from "./Cartridge.js"
import * as Riot from "./Riot.js"
import * as Tia from "./Tia.js"
import * as Bios from "./Bios.js"
import * as Events from "../events.js"

var pokey_SetRegister = Pokey.SetRegister;
var pokey_GetRegister = Pokey.GetRegister;
var tia_SetRegister = Tia.SetRegister;
var riot_SetDRB = Riot.SetDRB
var riot_SetDRA = Riot.SetDRA
var riot_SetTimer = Riot.SetTimer
var xm_IsPokeyEnabled = Xm.IsPokeyEnabled;
var xm_IsMemEnabled = Xm.IsMemEnabled;
var xm_IsYmEnabled = Xm.IsYmEnabled;
var xm_Read = Xm.Read;
var xm_Write = Xm.Write;

var highScoreCartEnabled = false;
var highScoreCallback = null;

var INPTCTRL = 1;
var INPT0 = 8;
var INPT1 = 9;
var INPT2 = 10;
var INPT3 = 11;
var INPT4 = 12;
var INPT5 = 13;
var AUDC0 = 21;
var AUDC1 = 22;
var AUDF0 = 23;
var AUDF1 = 24;
var AUDV0 = 25;
var AUDV1 = 26;
var WSYNC = 36;
// banksets changes
var MSTAT = 40;
// banksets changes
var DPPH  = 44;
var SWCHA = 640;
var SWCHB = 642;
var INTIM = 644;
var INTFLG = 645;
var TIM1T = 660;
var TIM8T = 661;
var TIM64T = 662;
var T1024T = 663;

//#define MEMORY_SIZE 65536 (from header)
var MEMORY_SIZE = 65536;
var MEMORY_SOUPER_EXRAM_SIZE = 32768;

//byte memory_ram[MEMORY_SIZE] = {0};
var memory_ram = new Array(MEMORY_SIZE);

//byte memory_rom[MEMORY_SIZE] = {0};
var memory_rom = new Array(MEMORY_SIZE);

// banksets changes
var maria_memory_ram = new Array(MEMORY_SIZE);

var memory_souper_ram = new Array(MEMORY_SOUPER_EXRAM_SIZE);


//int hs_sram_write_count = 0; // Debug, number of writes to High Score SRAM
//var hs_sram_write_count = 0; // Debug, number of writes to High Score SRAM

/** Shadow of Cartridge */
var cartridge_pokey = false;
var cartridge_pokey450 = false;

// banksets changes
var cartridge_pokey800 = false;
var cartridge_pokey_write_only = false;
var cartridge_banksets = false;
var cartridge_halt_banked_ram = false;

var cartridge_flags = 0;
var cartridge_xm = false;
var cartridge_type = 0;

var lock = false;

var maria_read = false;

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
function memory_Reset() {
  //uint index;
  var index;
  for (index = 0; index < MEMORY_SIZE; index++) {
    memory_ram[index] = 0;
    // banksets changes
    maria_memory_ram[index] = 0;
    memory_rom[index] = 1;
  }
  for (index = 0; index < 16384; index++) {
    memory_rom[index] = 0;
  }

  // Debug, reset write count to High Score SRAM
  //hs_sram_write_count = 0;

  // banksets changes
  lock = false;
}

// ----------------------------------------------------------------------------
// Read
// ----------------------------------------------------------------------------
function _memory_Read(address) {
  //byte tmp_byte;
  var tmp_byte;

  if (cartridge_xm &&
      ((address >= 0x0470 && address < 0x0480) ||
        (xm_IsPokeyEnabled() && (address >= 0x0450 && address < 0x0470)) ||
        (xm_IsMemEnabled() && (address >= 0x4000 && address < 0x8000)) ||
        (xm_IsYmEnabled() && (address >= 0x0460 && address <= 0x0461)))) {
    return xm_Read(address);
  }

  // banksets changes (pokey@800)
  if (!cartridge_pokey_write_only) {
    if (cartridge_pokey && (
      (!cartridge_pokey450 && !cartridge_pokey800 && (address >= 0x4000 && address <= 0x400f)) ||
      (cartridge_pokey800 && (address >= 0x0800 && address < 0x0820)) ||
      (cartridge_pokey450 && (address >= 0x0450 && address < 0x0470)))) {
      return pokey_GetRegister(
        cartridge_pokey800 ? 0x4000 + (address - 0x0800) :
          cartridge_pokey450 ? 0x4000 + (address - 0x0450) :
            address);
    }
  }

  // Maria registers.
  // banksets changes
  if ((address >= 0x20 && address <= 0x3F) && (address != MSTAT)) {
    return 0;
  }

  switch (address) {
    case INTIM:
    case INTIM | 0x2:
      memory_ram[INTFLG] &= 0x7f;
      return memory_ram[INTIM];
      break;
    case INTFLG:
    case INTFLG | 0x2:
      tmp_byte = memory_ram[INTFLG];
      memory_ram[INTFLG] &= 0x7f;
      return tmp_byte;
      break;
    default:

      if (Cartridge.GetType() === Cartridge.CARTRIDGE_TYPE_SOUPER && address >= 0x4000 && address < 0x8000)
        return memory_souper_ram[memory_souper_GetRamAddress(address)];

      // banksets changes
      if (maria_read) {
        if (cartridge_halt_banked_ram && (address >= 16384 && address <= 32767)) {
          return maria_memory_ram[address];
        }
        if(cartridge_type === Cartridge.CARTRIDGE_TYPE_NORMAL || cartridge_type === Cartridge.CARTRIDGE_TYPE_NORMAL_RAM) {
          if (address >= Cartridge.GetBanksetsBegin() && address <= Cartridge.GetBanksetsEnd()) {
            return maria_memory_ram[address];
          }
        } else {
          if (cartridge_type == Cartridge.CARTRIDGE_TYPE_SUPERCART_ROM &&
              address >= 16384 && address <= 32767) {
            return maria_memory_ram[address];
          }
          if (address >= 32768 && address <= 49151) {
            return maria_memory_ram[address];
          }
          if (address >= 49152 && address <= 65535) {
            return maria_memory_ram[address];
          }
        }
      }
      return memory_ram[address];
      break;
  }
}

//byte memory_Read(word address) {
function memory_Read(address) {
  var data = _memory_Read(address);
  if (data < 0) {
    console.error("Less than zero memory read: %d %d", address, data);
  }
  return data;
}

//byte memory_Read(word address) {
  // banksets changes
function memory_ReadMaria(address) {
  maria_read = true;
  var data = _memory_Read(address);
  maria_read = false;
  if (data < 0) {
    console.error("Less than zero memory read: %d %d", address, data);
  }
  return data;
}

// ----------------------------------------------------------------------------
// Write
// ----------------------------------------------------------------------------
//void memory_Write(word address, byte data) {
function memory_Write(address, data) {
  if (data < 0) {
    console.error("Less than zero memory write: %d %d", address, data);
  }

  if (cartridge_xm &&
      ((address >= 0x0470 && address < 0x0480) ||
        (xm_IsPokeyEnabled() && (address >= 0x0450 && address < 0x0470)) ||
        (xm_IsMemEnabled() && (address >= 0x4000 && address < 0x8000)) ||
        (xm_IsYmEnabled() && (address >= 0x0460 && address <= 0x0461)))) {
    xm_Write(address, data);
    return;
  }

  // banksets changes (pokey@800)
  if (cartridge_pokey && (
      (!cartridge_pokey450 && !cartridge_pokey800 && (address >= 0x4000 && address <= 0x400f)) ||
      (cartridge_pokey800 && (address >= 0x0800 && address < 0x0820)) ||
      (cartridge_pokey450 && (address >= 0x0450 && address < 0x0470)))) {
        pokey_SetRegister(
          cartridge_pokey800 ? 0x4000 + (address - 0x0800) :
            cartridge_pokey450 ? 0x4000 + (address - 0x0450) :
              address, data);
    return;
  }

  if (!memory_rom[address] || (cartridge_halt_banked_ram && (address >= 49152 && address <= 65535))) {

    // Track writes to high score SRAM
    if (highScoreCartEnabled && ((address >= 0x1000) && (address <= 0x17FF))) {
      //hs_sram_write_count++;
      if (highScoreCallback) {
        highScoreCallback.write(address, data);
      }
    }

    // INPTCTRL
    // banksets changes
    // Diagnosed by RevEng
    // Multiple addresses are used to set INPTCTRL
    // Lock Mode needs to be set
    if (address >= 0 && address <= 0xf) {
      if (!lock) {
        if (data & 1) {
          lock = true;
          console.log("Lock: " + data);
          memory_ram[MSTAT] = 0x80; // Required for Bouncing Balls demo
        }
        if ((data & 4) && Cartridge.IsLoaded()) {
          // Cartridge.RestoreFromTmp(Bios.Size(), memory_ram, memory_rom);
          if (!Cartridge.IsStored()) {
            Cartridge.Store();
          }
        }
        else if (!(data & 4) && Bios.IsEnabled()) {
          // Cartridge.SaveToTmp(Bios.Size(), memory_ram, memory_rom);
          Bios.Store();
        }
      }
    } else {
      switch (address) {
        case WSYNC:
            //memory_ram[WSYNC] = true;
            memory_ram[WSYNC] = 1;
          break;
        case INPT0:
        case INPT1:
        case INPT2:
        case INPT3:
        case INPT4:
        case INPT5:
        case MSTAT: // MSTAT is read-only
          break;
        case AUDC0:
          tia_SetRegister(AUDC0, data);
          break;
        case AUDC1:
          tia_SetRegister(AUDC1, data);
          break;
        case AUDF0:
          tia_SetRegister(AUDF0, data);
          break;
        case AUDF1:
          tia_SetRegister(AUDF1, data);
          break;
        case AUDV0:
          tia_SetRegister(AUDV0, data);
          break;
        case AUDV1:
          tia_SetRegister(AUDV1, data);
          break;

        case SWCHB:
          /*gdement:  Writing here actually writes to DRB inside the RIOT chip.
        This value only indirectly affects output of SWCHB.*/
          riot_SetDRB(data);
          break;

        case SWCHA:
          riot_SetDRA(data);
          break;
        case TIM1T:
        case TIM1T | 0x8:
          riot_SetTimer(TIM1T, data);
          break;
        case TIM8T:
        case TIM8T | 0x8:
          riot_SetTimer(TIM8T, data);
          break;
        case TIM64T:
        case TIM64T | 0x8:
          riot_SetTimer(TIM64T, data);
          break;
        case T1024T:
        case T1024T | 0x8:
          riot_SetTimer(T1024T, data);
          break;
        default:
          if (Cartridge.GetType() == Cartridge.CARTRIDGE_TYPE_SOUPER && address >= 0x4000 && address < 0x8000)
          {
            memory_souper_ram[memory_souper_GetRamAddress(address)] = data;
            break;
          }

          // banksets changes
          if (cartridge_halt_banked_ram && (address >= 49152 && address <= 65535)) {
            //console.log(16384 + (address - 49152) + ", " + data);
            maria_memory_ram[16384 + (address - 49152)] = data;
          } else {
            memory_ram[address] = data;
            if (address >= 8256 && address <= 8447) {
              memory_ram[address - 8192] = data;
            }
            else if (address >= 8512 && address <= 8703) {  // banksets changes (8703)
              memory_ram[address - 8192] = data;
            }
            else if (address >= 64 && address <= 255) {
              memory_ram[address + 8192] = data;
            }
            else if (address >= 320 && address <= 511) {
              memory_ram[address + 8192] = data;
            }
            // banksets changes
            else if (address >= 10240 && address <= 12287) {
              memory_ram[address - 2048] = data;
            }
            // banksets changes
            else if (address >= 8192 && address <= 10239) {
              memory_ram[address + 2048] = data;
            }
          }
          break;
      }
    }
  }
  else {
    Cartridge.Write(address, data);
  }
}

// ----------------------------------------------------------------------------
// WriteROM
// ----------------------------------------------------------------------------
//memory_WriteROM = function(word address, uint size, const byte* data) {
function memory_WriteROM(address, size, data, offset) {
  var write_to_maria = false;
  var maria_offset = 0;

  // banksets changes
  if (cartridge_banksets) {
    var type = Cartridge.GetType();
    if(type === Cartridge.CARTRIDGE_TYPE_NORMAL || type === Cartridge.CARTRIDGE_TYPE_NORMAL_RAM) {
      maria_offset = size;
      Cartridge.SetBanksetsBegin(address);
      Cartridge.SetBanksetsEnd(address + size - 1);
      write_to_maria = true;
    } else if (address === 32768 || address === 49152 ||
        (type === Cartridge.CARTRIDGE_TYPE_SUPERCART_ROM && address === 16384)) {
      maria_offset = 128 * 1024;
      write_to_maria = true;
    }
  }

  //if((address + size) <= MEMORY_SIZE && data != NULL) {
  if ((address + size) <= MEMORY_SIZE && data != null) {
    //for(uint index = 0; index < size; index++) {
    for (var index = 0; index < size; index++) {
      //memory_ram[address + index] = data[index];
      memory_ram[address + index] = data[index + offset];
      memory_rom[address + index] = 1;
      if (write_to_maria) {
        // banksets changes
        maria_memory_ram[address + index] = data[index + offset + maria_offset]
      }
    }
  }
}

// ----------------------------------------------------------------------------
// ClearROM
// ----------------------------------------------------------------------------
//void memory_ClearROM(word address, uint size) {
function memory_ClearROM(address, size) {
  if ((address + size) <= MEMORY_SIZE) {
    //for(uint index = 0; index < size; index++) {
    for (var index = 0; index < size; index++) {
      memory_ram[address + index] = 0;
      memory_rom[address + index] = 0;
      // banksets changes
      if (cartridge_halt_banked_ram && address === 16384) {
        maria_memory_ram[address + index] = 0;
      }
    }
  }
}

function memory_souper_GetRamAddress(address)
{
  var page = (address - 0x4000) >> 12;
  if ((Cartridge.GetSouperMode() & Cartridge.CARTRIDGE_SOUPER_MODE_EXS) != 0)
  {
    if (address >= 0x6000 && address < 0x7000)
      page = Cartridge.SouperRamBank[0];
    else if (address >= 0x7000 && address < 0x8000)
      page = Cartridge.SouperRamBank[1];
  }
  return (address & 0x0fff) | (page << 12);
}

function OnCartridgeLoaded() {
  cartridge_pokey = Cartridge.IsPokeyEnabled();
  cartridge_pokey450 = Cartridge.IsPokey450Enabled();
  cartridge_pokey800 = Cartridge.IsPokey800Enabled();
  cartridge_xm = Cartridge.IsXmEnabled();
  cartridge_flags = Cartridge.GetFlags();
  cartridge_pokey_write_only = Cartridge.IsPokeyWriteOnly();
  cartridge_banksets = Cartridge.IsBanksets();
  cartridge_halt_banked_ram = Cartridge.IsHaltBankedRam();
  cartridge_type = Cartridge.GetType();
}

Events.addListener(
  new Events.Listener("onCartridgeLoaded", OnCartridgeLoaded));

Events.addListener(
  new Events.Listener("onHighScoreCartLoaded",
  function(loaded) {
    highScoreCartEnabled = loaded;
  }
));

Events.addListener(
  new Events.Listener("highScoreCallbackChanged",
  function (hsCallback) {
    highScoreCallback = hsCallback;
  }
));

export {
  memory_ClearROM as ClearROM,
  memory_WriteROM as WriteROM,
  memory_Write as Write,
  memory_Read as Read,
  memory_ReadMaria as ReadMaria,
  memory_Reset as Reset,
  memory_ram as ram,
  memory_rom as rom,
  maria_memory_ram as mariaRam,
  memory_souper_ram as SouperRam
}
