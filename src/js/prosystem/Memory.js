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

//#define MEMORY_SIZE 65536 (from header)
var MEMORY_SIZE = 65536;

//byte memory_ram[MEMORY_SIZE] = {0};
var memory_ram = new Array(MEMORY_SIZE);

//byte memory_rom[MEMORY_SIZE] = {0};
var memory_rom = new Array(MEMORY_SIZE);

//int hs_sram_write_count = 0; // Debug, number of writes to High Score SRAM
var hs_sram_write_count = 0; // Debug, number of writes to High Score SRAM

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
function memory_Reset() {
  //uint index;
  var index;
  for (index = 0; index < MEMORY_SIZE; index++) {
    memory_ram[index] = 0;
    memory_rom[index] = 1;
  }
  for (index = 0; index < 16384; index++) {
    memory_rom[index] = 0;
  }

  // Debug, reset write count to High Score SRAM
  hs_sram_write_count = 0;
}

// ----------------------------------------------------------------------------
// Read
// ----------------------------------------------------------------------------
function _memory_Read(address) {
  //byte tmp_byte;
  var tmp_byte;

  if (cartridge_xm) {
    if ((address >= 0x0470 && address < 0x0480) ||
      (xm_pokey_enabled && (address >= 0x0450 && address < 0x0470)) ||
      (xm_mem_enabled && (address >= 0x4000 && address < 0x8000))) {
      return xm_Read(address);
    }
  }

  if (cartridge_pokey && (
    (!cartridge_pokey450 && (address >= 0x4000 && address <= 0x400f)) ||
    (cartridge_pokey450 && (address >= 0x0450 && address < 0x0470)))) {
    return js7800.Pokey.GetRegister(
      cartridge_pokey450 ? 0x4000 + (address - 0x0450) : address);
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
      ((xm_pokey_enabled && (address >= 0x0450 && address < 0x0470)) ||
        (xm_mem_enabled && (address >= 0x4000 && address < 0x8000))))) {
    xm_Write(address, data);
    return;
  }

  if (cartridge_pokey && (
    (!cartridge_pokey450 && (address >= 0x4000 && address <= 0x400f)) ||
    (cartridge_pokey450 && (address >= 0x0450 && address < 0x0470)))) {
    js7800.Pokey.SetRegister(
      (cartridge_pokey450 ? 0x4000 + (address - 0x0450) : address), data);
    return;
  }

  if (!memory_rom[address]) {

    // Debug, track writes to high score SRAM
    if (address >= 0x1000 && address <= 0x17FF) {
      hs_sram_write_count++;
    }

    switch (address) {
      case WSYNC:
        if (!(cartridge_flags & 128)) {
          //memory_ram[WSYNC] = true;
          memory_ram[WSYNC] = 1;
        }
        break;
      case INPTCTRL:
        if (data == 22 && cartridge_IsLoaded()) {
          cartridge_Store();
        }
        else if (data == 2 && bios_enabled) {
          bios_Store();
        }
        break;
      case INPT0:
        break;
      case INPT1:
        break;
      case INPT2:
        break;
      case INPT3:
        break;
      case INPT4:
        break;
      case INPT5:
        break;
      case AUDC0:
        js7800.Tia.SetRegister(AUDC0, data);
        break;
      case AUDC1:
        js7800.Tia.SetRegister(AUDC1, data);
        break;
      case AUDF0:
        js7800.Tia.SetRegister(AUDF0, data);
        break;
      case AUDF1:
        js7800.Tia.SetRegister(AUDF1, data);
        break;
      case AUDV0:
        js7800.Tia.SetRegister(AUDV0, data);
        break;
      case AUDV1:
        js7800.Tia.SetRegister(AUDV1, data);
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
        memory_ram[address] = data;
        if (address >= 8256 && address <= 8447) {
          memory_ram[address - 8192] = data;
        }
        else if (address >= 8512 && address <= 8702) {
          memory_ram[address - 8192] = data;
        }
        else if (address >= 64 && address <= 255) {
          memory_ram[address + 8192] = data;
        }
        else if (address >= 320 && address <= 511) {
          memory_ram[address + 8192] = data;
        }
        break;
    }
  }
  else {
    cartridge_Write(address, data);
  }
}

// ----------------------------------------------------------------------------
// WriteROM
// ----------------------------------------------------------------------------
//memory_WriteROM = function(word address, uint size, const byte* data) {
function memory_WriteROM(address, size, data, offset) {
  //if((address + size) <= MEMORY_SIZE && data != NULL) {
  if ((address + size) <= MEMORY_SIZE && data != null) {
    //for(uint index = 0; index < size; index++) {
    for (var index = 0; index < size; index++) {
      //memory_ram[address + index] = data[index];
      memory_ram[address + index] = data[index + offset];
      memory_rom[address + index] = 1;
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
    }
  }
}

/*
extern "C" byte* 
get_memory_ram()
{
  return memory_ram;
}
*/

function get_memory_ram() {
  return memory_ram;
}
