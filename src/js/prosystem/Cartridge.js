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
// Cartridge.cpp
// ----------------------------------------------------------------------------

import * as Memory from "./Memory.js"
import { md5 } from "../3rdparty/md5.js"
import * as Events from "../events.js"
import * as ProSystem from "./ProSystem.js"

var memory_WriteROM = null;
var memory_ClearROM = null;
var memory_Write = null;

// #define HS_SRAM_START 0x1000
var HS_SRAM_START = 0x1000;
// // The size of the high score cartridge SRAM
// #define HS_SRAM_SIZE 2048
var HS_SRAM_SIZE = 2048;

var highScoreCallback = null;

var HBLANK_DEFAULT = 28;
var REGION_NTSC = null;
var CARTRIDGE_TYPE_NORMAL = 0;
var CARTRIDGE_TYPE_SUPERCART = 1;
var CARTRIDGE_TYPE_SUPERCART_LARGE = 2;
var CARTRIDGE_TYPE_SUPERCART_RAM = 3;
var CARTRIDGE_TYPE_SUPERCART_ROM = 4;
var CARTRIDGE_TYPE_ABSOLUTE = 5;
var CARTRIDGE_TYPE_ACTIVISION = 6;
var CARTRIDGE_TYPE_NORMAL_RAM = 7;
var CARTRIDGE_TYPE_SOUPER  = 8;             /* Used by "Rikki & Vikki" */
var CARTRIDGE_CONTROLLER_NONE = 0;
var CARTRIDGE_CONTROLLER_JOYSTICK = 1;
var CARTRIDGE_CONTROLLER_LIGHTGUN = 2;
var CARTRIDGE_SOUPER_BANK_SEL = 0x8000;
var CARTRIDGE_SOUPER_CHR_A_SEL = 0x8001;
var CARTRIDGE_SOUPER_CHR_B_SEL = 0x8002;
var CARTRIDGE_SOUPER_MODE_SEL = 0x8003;
var CARTRIDGE_SOUPER_EXRAM_V_SEL = 0x8004;
var CARTRIDGE_SOUPER_EXRAM_D_SEL = 0x8005;
var CARTRIDGE_SOUPER_AUDIO_CMD = 0x8007;
var CARTRIDGE_SOUPER_MODE_MFT = 0x1;
var CARTRIDGE_SOUPER_MODE_CHR = 0x2;
var CARTRIDGE_SOUPER_MODE_EXS = 0x4;

//std::string cartridge_title;
var cartridge_title = "";
//std::string cartridge_description;
var cartridge_description = "";
//std::string cartridge_year;
var cartridge_year = "";
//std::string cartridge_maker;
var cartridge_maker = "";
//std::string cartridge_digest;
var cartridge_digest = "";
//std::string cartridge_filename;
//var cartridge_filename = "";
//byte cartridge_type;
var cartridge_type = 0;
//byte cartridge_region;
var cartridge_region = 0;
//bool cartridge_pokey;
var cartridge_pokey = false;
//bool cartridge_pokey450;
var cartridge_pokey450 = false;
//byte cartridge_controller[2] = {1, 1};
var cartridge_controller = [1, 1];
//byte cartridge_bank;
var cartridge_bank = 0;
//uint cartridge_flags;
var cartridge_flags = 0;
//int cartridge_crosshair_x;
var cartridge_crosshair_x = 0;
//int cartridge_crosshair_y;
var cartridge_crosshair_y = 0;
//bool cartridge_dualanalog = false;
var cartridge_dualanalog = false;
//bool cartridge_xm = false;
var cartridge_xm = false;
//bool cartridge_disable_bios = false;
var cartridge_disable_bios = false;
//uint cartridge_hblank = 34;
var cartridge_hblank = 28;
//byte cartridge_left_switch = 1;
var cartridge_left_switch = 1;
//byte cartridge_right_switch = 0;
var cartridge_right_switch = 0;
//bool cartridge_swap_buttons = false;
var cartridge_swap_buttons = false;
//bool cartridge_hsc_enabled = false;
var cartridge_hsc_enabled = false;
var cartridge_composite = false;

// banksets changes
var cartridge_banksets = false;
var cartridge_banksets_begin = 0;
var cartridge_banksets_end = 0;
var cartridge_halt_banked_ram = false;
var cartridge_pokey_write_only = false;
var cartridge_pokey800 = false;

/* SOUPER-specific stuff, used for "Rikki & Vikki" */
var cartridge_bupchip = false;
var cartridge_souper_chr_bank = new Array(2);
var cartridge_souper_mode = 0;
var cartridge_souper_ram_page_bank = new Array(2);

// 0: Disabled, 1: Enabled, 2: Automatic
var XM_MODE_DEFAULT = 2;
var xm_mode = XM_MODE_DEFAULT;

// Whether the cartridge has accessed the high score ROM (indicates that the
// SRAM should be persisted when the cartridge is unloaded)
//bool high_score_set = false;
//  var high_score_set = false;

// Whether the high score cart has been loaded
//static bool high_score_cart_loaded = false;
var high_score_cart_loaded = false;

//static byte* cartridge_buffer = NULL;
var cartridge_buffer = null; // Will be an Array()
//static uint cartridge_size = 0;
var cartridge_size = 0;

var cartridge_stored = false;

// ----------------------------------------------------------------------------
// HasHeader
// ----------------------------------------------------------------------------
//static bool cartridge_HasHeader(const byte* header) {
function cartridge_HasHeader(header) {
  //const char HEADER_ID[ ] = {"ATARI7800"};
  var HEADER_ID = ['A', 'T', 'A', 'R', 'I', '7', '8', '0', '0'];
  //for(int index = 0; index < 9; index++) {
  for (var index = 0; index < 9; index++) {
    //if (HEADER_ID[index] != header[index + 1]) {
    if (HEADER_ID[index] != String.fromCharCode(header[index + 1])) {
      return false;
    }
  }
  return true;
}

// 1.3

// ----------------------------------------------------------------------------
// Header for CC2 hack
// ----------------------------------------------------------------------------
//static bool cartridge_CC2(const byte* header) {
function cartridge_CC2(header) {
  //const char HEADER_ID[ ] = {">>"};
  var HEADER_ID = ['>', '>'];
  //for(int index = 0; index < 2; index++) {
  for (var index = 0; index < 2; index++) {
    //if (HEADER_ID[index] != header[index + 1]) {
    if (HEADER_ID[index] != String.fromCharCode(header[index + 1])) {
      return false;
    }
  }
  return true;
}

// ----------------------------------------------------------------------------
// GetBank
// ----------------------------------------------------------------------------
//static uint cartridge_GetBank(byte bank) {
function cartridge_GetBank(bank) {
  if ((cartridge_type == CARTRIDGE_TYPE_SUPERCART ||
    cartridge_type == CARTRIDGE_TYPE_SUPERCART_ROM ||
    cartridge_type == CARTRIDGE_TYPE_SUPERCART_RAM) && cartridge_size <= 65536) {
    // for some of these carts, there are only 4 banks. in this case we ignore bit 3
    // previously, games of this type had to be doubled. The first 4 banks needed to be duplicated at the end of the ROM
    return (bank & 3);
  }
  return bank;
}

// ----------------------------------------------------------------------------
// GetBankOffset
// ----------------------------------------------------------------------------
//static uint cartridge_GetBankOffset(byte bank) {
function cartridge_GetBankOffset(bank) {
  return cartridge_GetBank(bank) * 16384;
}

// ----------------------------------------------------------------------------
// WriteBank
// ----------------------------------------------------------------------------
//static void cartridge_WriteBank(word address, byte bank) {
function cartridge_WriteBank(address, bank) {
  // banksets changes
  var size = cartridge_size;
  if (cartridge_banksets) size = size >> 1;

  /*
  console.log("Bank switch: %d, %d, max:%d",
    address, cartridge_GetBank(bank), ((cartridge_size / 16384)>>0));
  */

  //uint offset = cartridge_GetBankOffset(bank);
  var offset = cartridge_GetBankOffset(bank);
  if (offset < size) {
    //memory_WriteROM(address, 16384, cartridge_buffer + offset);
    memory_WriteROM(address, 16384, cartridge_buffer, offset); // JS: Just pass the offset
    cartridge_bank = bank;
  }
}

//static void cartridge_SetTypeBySize(uint size) {
function cartridge_SetTypeBySize(size) {
  // banksets changes
  if (cartridge_banksets) size = size >> 1;

  if (size <= 0x10000) {
    //int old_type = cartridge_type;
    var old_type = cartridge_type;
    cartridge_type = CARTRIDGE_TYPE_NORMAL;
    console.log("Update: no bits and <= 64k: %d, %d", old_type, cartridge_type);
  } else if (size == 0x24000) {
    //int old_type = cartridge_type;
    var old_type = cartridge_type;
    cartridge_type = CARTRIDGE_TYPE_SUPERCART_LARGE;
    console.log("Update: size == 144k: %d, %d", old_type, cartridge_type);
  } else if (size == 0x20000) {
    //int old_type = cartridge_type;
    var old_type = cartridge_type;
    cartridge_type = CARTRIDGE_TYPE_SUPERCART_ROM;
    console.log("Update: size == 128k: %d, %d", old_type, cartridge_type);
  } else {
    //int old_type = cartridge_type;
    var old_type = cartridge_type;
    cartridge_type = CARTRIDGE_TYPE_SUPERCART;
    console.log("Update: default for > 64k: %d, %d", old_type, cartridge_type);
  }
}

// ----------------------------------------------------------------------------
// ReadHeader
// ----------------------------------------------------------------------------
//static void cartridge_ReadHeader(const byte* header) {
function cartridge_ReadHeader(header) {
  console.log("Reading cartridge header");

  //char temp[33] = { 0};
  var temp = new Array();
  //for (int index = 0; index < 32; index++) {
  for (var index = 0; index < 32; index++) {
    temp[index] = header[index + 17];
  }

  //cartridge_title = temp;
  cartridge_title = "";
  for (var i = 0; i < temp.length; i++) {
    cartridge_title += String.fromCharCode(temp[i]);
  }
  console.log("Title: %s", cartridge_title)

  cartridge_size = header[49] << 24;
  cartridge_size |= header[50] << 16;
  cartridge_size |= header[51] << 8;
  cartridge_size |= header[52];

  if (header[53] == 0) {
    if (cartridge_size > 131072) {
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_LARGE;
    }
    else if (header[54] == 2 || header[54] == 3) {
      cartridge_type = CARTRIDGE_TYPE_SUPERCART;
    }
    else if (header[54] == 4 || header[54] == 5 || header[54] == 6 || header[54] == 7) {
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_RAM;
    }
    else if (header[54] == 8 || header[54] == 9 || header[54] == 10 || header[54] == 11) {
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_ROM;
    }
    else {
      cartridge_type = CARTRIDGE_TYPE_NORMAL;
    }
  }
  else {
    if (header[53] & 0x02) /* raz, updated */
       cartridge_type = CARTRIDGE_TYPE_ABSOLUTE;
    else if (header[53] & 0x01) /* raz, updated */
       cartridge_type = CARTRIDGE_TYPE_ACTIVISION;
    else if (header[53] == 16)
       cartridge_type = CARTRIDGE_TYPE_SOUPER;
    else
       cartridge_type = CARTRIDGE_TYPE_NORMAL;
 }

  cartridge_pokey = (header[54] & 1) ? true : false;
  cartridge_pokey450 = (header[54] & 0x40) ? true : false;
  // banksets changes
  cartridge_pokey800 = (header[53] & 0x80) ? true : false;
  if (cartridge_pokey450 || cartridge_pokey800) {
    cartridge_pokey = true;
  }

  cartridge_controller[0] = header[55];
  cartridge_controller[1] = header[56];
  cartridge_region = header[57] & 0x1;
  cartridge_composite = (header[57] & 0x2) ? 1 : 0;
  cartridge_flags = 0;
  // banksets changes (check for 0x08, ym2151)
  cartridge_xm = (header[63] & 1) || ((header[53] & 0x08) == 0x08) ? true : false;
  cartridge_hsc_enabled = header[58] & 0x03; // HSC or SaveKey /* 0x01; */
  // banksets changes
  cartridge_banksets = header[53] & 0x20 ? true : false;
  if (cartridge_banksets &&
        (cartridge_size === (2 * 48 * 1024) || cartridge_size === (2 * 52 * 1024))) {
    cartridge_pokey_write_only = true;
  }
  cartridge_halt_banked_ram = header[53] & 0x40 ? true : false;
  cartridge_bupchip = false;

  // Wii: Updates to header interpretation
  //byte ct1 = header[54];
  var ct1 = header[54];
  // banksets changes
  var ct2 = header[53];
  //if (header[53] == 0) {       // banksets changes
    if (header[53] & 0x02) { /* raz, updated */
      cartridge_type = CARTRIDGE_TYPE_ABSOLUTE;
    }
    else if (header[53] & 0x01) { /* raz, updated */
      cartridge_type = CARTRIDGE_TYPE_ACTIVISION;
    }
    else if (header[53] & 0x10) { /* raz, updated */
      cartridge_type = CARTRIDGE_TYPE_SOUPER;
    } else if ((ct1 & 0x0a) == 0x0a) { // BIT1 and BIT3 (Supercart Large: 2) rom at $4000
      //int old_type = cartridge_type;
      var old_type = cartridge_type;
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_LARGE;
      console.log("Update: (0x10) bit1 & bit3: %d, %d", old_type, cartridge_type);
    } else if ((ct1 & 0x12) == 0x12) { // BIT1 and BIT4 (Supercart ROM: 4) bank6 at $4000
      //int old_type = cartridge_type;
      var old_type = cartridge_type;
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_ROM;
      console.log("Update: (0x12) bit1 & bit4: %d, %d", old_type, cartridge_type);
    } else if ((ct1 & 0x06) == 0x06) { // BIT1 and BIT2 (Supercart RAM: 3) ram at $4000
      //int old_type = cartridge_type;
      var old_type = cartridge_type;
      cartridge_type = CARTRIDGE_TYPE_SUPERCART_RAM;
      console.log("Update: (0x06) bit1 & bit2: %d, %d", old_type, cartridge_type);
    } else if ((ct1 & 0x02) == 0x02) { // BIT1 (Supercart) bank switched
      //int old_type = cartridge_type;
      var old_type = cartridge_type;
      cartridge_type = CARTRIDGE_TYPE_SUPERCART;
      console.log("Update: (0x01) bit1: %d, %d", old_type, cartridge_type);
    } else if (cartridge_size <= 0x10000 && ((ct1 & 0x04) == 0x04)) { // Size < 64k && BIT2 (Normal RAM: ?) ram at $4000 )
      //int old_type = cartridge_type;
      var old_type = cartridge_type;
      cartridge_type = CARTRIDGE_TYPE_NORMAL_RAM;
      console.log("Update: (0x04) bit2: %d, %d", old_type, cartridge_type);
    } else {
      // Attempt to determine the cartridge type based on its size
      cartridge_SetTypeBySize(cartridge_size);
    }
  //}       // banksets changes

  // banksets changes
  if (cartridge_banksets) {
    if (cartridge_type === CARTRIDGE_TYPE_NORMAL || cartridge_type === CARTRIDGE_TYPE_NORMAL_RAM) {
      if (cartridge_type === CARTRIDGE_TYPE_NORMAL && cartridge_halt_banked_ram) {
        var old_type = cartridge_type;
        cartridge_type = CARTRIDGE_TYPE_NORMAL_RAM;
        console.log("Normal cart with halt based ram, switching type: %d, %d", old_type, cartridge_type);
      }
    } else {
      var old_type = cartridge_type;
      if (cartridge_halt_banked_ram) {
        cartridge_type = CARTRIDGE_TYPE_SUPERCART_RAM;
      } else if ((ct1 & 0x10) == 0x10) {
        cartridge_type = CARTRIDGE_TYPE_SUPERCART_ROM;
      } else {
        cartridge_type = CARTRIDGE_TYPE_SUPERCART;
      }
      if (old_type !== cartridge_type) {
        console.log("Bank switched banksets, switching type: %d, %d", old_type, cartridge_type);
      }
    }
  }

  console.log("Header info:");
  if (ct1 & 0x01) {
    console.log("  bit0: pokey at $4000");
  }
  if (ct1 & 0x02) {
    console.log("  bit1: supergame bank switched");
  }
  if (ct1 & 0x04) {
    console.log("  bit2: supergame ram at $4000");
  }
  if (ct1 & 0x08) {
    console.log("  bit3: rom at $4000");
  }
  if (ct1 & 0x10) {
    console.log("  bit4: bank 6 at $4000");
  }
  if (ct1 & 0x20) {
    console.log("  bit5: supergame banked ram");
  }
  if (ct1 & 0x40) {
    console.log("  bit6: pokey at $450");
  }
  if (ct1 & 0x80) {
    console.log("  bit7: mirror ram at $4000");
  }
  // banksets changes
  if (ct2 & 0x01) {
    console.log("  bit8: activision banking");
  }
  if (ct2 & 0x02) {
    console.log("  bit9: absolute banking");
  }
  if (ct2 & 0x04) {
    console.log("  bit10: pokey at $440");
  }
  if (ct2 & 0x08) {
    console.log("  bit11: ym2151 at $460/$461");
  }
  if (ct2 & 0x10) {
    console.log("  bit12: souper");
  }
  if (ct2 & 0x20) {
    console.log("  bit13: banksets");
  }
  if (ct2 & 0x40) {
    console.log("  bit14: halt banked ram");
  }
  if (ct2 & 0x80) {
    console.log("  bit15: pokey@800");
  }

  console.log("  xm: %s", (cartridge_xm ? "1" : "0"));
  console.log("  banksets: %s", (cartridge_banksets ? "1" : "0"));
  console.log("  pokey: %s", (cartridge_pokey ? "1" : "0"));
  console.log("  pokey450: %s", (cartridge_pokey450 ? "1" : "0"));
  console.log("  pokey800: %s", (cartridge_pokey800 ? "1" : "0"));
  console.log("  pokey write only: %s", cartridge_pokey_write_only ? "1" : "0");
  console.log("  halt banked ram: %s", cartridge_halt_banked_ram ? "1" : "0");
  console.log("  tv type: %s", cartridge_region ? "PAL" : "NTSC");
  console.log("  tv composite: %d\n", cartridge_composite);
  console.log("  Save device: [%d]%s%s", header[58],
    ((header[58] & 0x02) ? " SaveKey/AtariVox" : ""),
    ((header[58] & 0x01) ? " HSC" : ""));
  console.log("  controller1: %d", cartridge_controller[0]);
  console.log("  controller2: %d", cartridge_controller[1]);
  console.log("  cartridge_type 53: %d", header[53]);
  console.log("  cartridge_type 54: %d", header[54]);
  console.log("  cartridge_size: %d", cartridge_size);
  console.log("cartridge_type (from header): %d", cartridge_type);
}

// ----------------------------------------------------------------------------
// Load
// ----------------------------------------------------------------------------
//static bool cartridge_Load(const byte* data, uint size) {
function cartridge_Load(data, size) {

  if (size <= 128) {
    console.log("Cartridge data is invalid.");
    return false;
  }

  console.log("actual cartridge_size: %d", size);

  cartridge_Release();

  //byte header[128] = { 0 };
  var header = new Array();
  //for (int index = 0; index < 128; index++) {
  for (var index = 0; index < 128; index++) {
    header[index] = data[index];
  }

  // 1.3
  if (cartridge_CC2(header)) {
    console.log("Prosystem doesn't support CC2 hacks.");
    return false;
  }

  //uint offset = 0;
  var offset = 0;
  if (cartridge_HasHeader(header)) {
    console.log("Found cartridge header");
    cartridge_ReadHeader(header);
    size -= 128;
    offset = 128;

    // Several cartridge headers do not have the proper size. So attempt to use the size
    // of the file.
    if (cartridge_size != size) {
      console.log("!!! CARTRIDGE SIZE IN HEADER DOES NOT MATCH !!! : %d %d",
        cartridge_size, size);
      // Necessary for the following roms:
      // Impossible Mission hacks w/ C64 style graphics
      if (size % 1024 == 0) {
        console.log("!!! ROM size is 1k multiple, using ROM size !!! : %d", size);
        cartridge_size = size;
      } else {
        console.log("!!! ROM size is not 1k multiple, using header size !!! : %d", cartridge_size);
      }
    }
  }
  else {
    console.log("Unable to find cartridge header");
    cartridge_size = size;
    // Attempt to guess the cartridge type based on its size
    cartridge_SetTypeBySize(size);
  }

  console.log("cartridge_type: %d", cartridge_type);
  console.log("cartridge_size: %d", cartridge_size);

  //cartridge_buffer = new byte[cartridge_size];
  cartridge_buffer = new Array(cartridge_size);
  var hashstr = "";
  //for (int index = 0; index < cartridge_size; index++) {
  for (var index = 0; index < cartridge_size; index++) {
    cartridge_buffer[index] = data[index + offset];
    hashstr += String.fromCharCode(cartridge_buffer[index]);
  }

  //cartridge_digest = hash_Compute(cartridge_buffer, cartridge_size);
  cartridge_digest = md5(hashstr);
  console.log("cartridge_digest: %s", cartridge_digest);

   // Diagnostic cartridge
   if (cartridge_digest === "91041aadd1700a7a4076f4005f2c362f" ||
       cartridge_digest === "66a90a41b11faa0f6d1e05aefb59ec6f")
   {
      console.log("Patching diagnostic cartridge...");
      var offset = cartridge_size - 0x1914 - 128;
      cartridge_buffer[offset + 0] = 0xDF; // raz fix
      cartridge_buffer[offset + 1] = 0xE6; // raz fix
   }

  var crc16 = Crc16(cartridge_buffer.slice((
    cartridge_size - (16 * 1024)), 
    cartridge_size - (16 * 1024) + 1024));

   // PPII Hack.
   console.log("CRC 16: 0x" + crc16.toString(16));
   if ((crc16 & 0xFFFF) == 0x9e8a) {
      console.log("Applying Pole Position II hack...");
      ProSystem.SetMstatAdjust(3);
   }


  // Swap hi and lo
  if (cartridge_type == CARTRIDGE_TYPE_ACTIVISION && (
    // Rampage (AM) (NTSC) (Activision) (1989) (39A316AA).a78
    (cartridge_digest !== "ac03806cef2558fc795a7d5d8dba7bc0") &&
    // Double Dragon (AM) (NTSC) (Activision) (1989) (AA265865).a78
    (cartridge_digest !== "543484c00ba233736bcaba2da20eeea9") &&
    // Double Dragon (AM) (PAL) (Activision) (1989) (F29ABDB2).a78
    (cartridge_digest !== "de2ebafcf0e37aaa9d0e9525a7f4dd62")
  )) {
    var swap = new Array(8 * 1024);
    console.log("Swap hi and lo 8k...");
    for (var i = 0; i < cartridge_size; i += 16 * 1024) {
      console.log("swap " + i);
      for (var j = 0; j < 8 * 1024; j++) {
        swap[j] = cartridge_buffer[i + j];
      }
      for (var j = 0; j < 8 * 1024; j++) {
        cartridge_buffer[i + j] = cartridge_buffer[i + (8 * 1024) + j];
      }
      for (var j = 0; j < 8 * 1024; j++) {
        cartridge_buffer[i + (8 * 1024) + j] = swap[j];
      }
    }
  }

  if (cartridge_type === CARTRIDGE_TYPE_SOUPER && cartridge_size === 1024 * 1024) {
    cartridge_bupchip = true;
    let musicSize = window.Module._bupchip_GetMusicSize();
    let bupchipMusicBuffer = new Uint8Array(Module.HEAPU8.buffer, window.Module._bupchip_GetMusicBuffer(), musicSize);
    for (let i = 0; i < musicSize; i++) {
      bupchipMusicBuffer[i] = cartridge_buffer[(512 * 1024) + i];
    }
    window.Module._bupchip_Unpack();
  }

  return true;
}

// ----------------------------------------------------------------------------
// Store
// ----------------------------------------------------------------------------
//void cartridge_Store() {
function cartridge_Store() {
  // banksets changes
  cartridge_stored = true;
  var size = cartridge_size;
  if (cartridge_banksets) size = size >> 1;

  switch (cartridge_type) {
    case CARTRIDGE_TYPE_NORMAL:
      //memory_WriteROM(65536 - cartridge_size, cartridge_size, cartridge_buffer,);
      memory_WriteROM((65536 - size), size, cartridge_buffer, 0);
      break;
    case CARTRIDGE_TYPE_NORMAL_RAM:
      //memory_WriteROM(65536 - cartridge_size, cartridge_size, cartridge_buffer);
      memory_WriteROM(65536 - size, size, cartridge_buffer, 0);
      memory_ClearROM(16384, 16384);
      break;
    case CARTRIDGE_TYPE_SUPERCART: {
      //uint offset = size - 16384;
      var offset = size - 16384;
      if (offset < size) {
        //memory_WriteROM(49152, 16384, cartridge_buffer + offset);
        memory_WriteROM(49152, 16384, cartridge_buffer, offset);

        // Default to bank 0
        // banksets changes
        cartridge_StoreBank(0);
      }
    } break;
    case CARTRIDGE_TYPE_SUPERCART_LARGE: {
      //uint offset = size - 16384;
      var offset = size - 16384;
      if (offset < size) {
        //memory_WriteROM(49152, 16384, cartridge_buffer + offset);
        memory_WriteROM(49152, 16384, cartridge_buffer, offset);
        //memory_WriteROM(16384, 16384, cartridge_buffer + cartridge_GetBankOffset(0));
        memory_WriteROM(16384, 16384, cartridge_buffer, cartridge_GetBankOffset(0));

        // Default to bank 0
        // banksets changes
        cartridge_StoreBank(0);
      }
    } break;
    case CARTRIDGE_TYPE_SUPERCART_RAM: {
      //uint offset = size - 16384;
      var offset = size - 16384;
      if (offset < size) {
        //memory_WriteROM(49152, 16384, cartridge_buffer + offset);
        memory_WriteROM(49152, 16384, cartridge_buffer, offset);
        memory_ClearROM(16384, 16384);

        // Default to bank 0
        // banksets changes
        cartridge_StoreBank(0);
      }
    } break;
    case CARTRIDGE_TYPE_SUPERCART_ROM: {
      //uint offset = size - 16384;
      var offset = size - 16384;
      if (offset < size && cartridge_GetBankOffset(6) < size) {
        //memory_WriteROM(49152, 16384, cartridge_buffer + offset);
        memory_WriteROM(49152, 16384, cartridge_buffer, offset);
        //memory_WriteROM(16384, 16384, cartridge_buffer + cartridge_GetBankOffset(6));
        memory_WriteROM(16384, 16384, cartridge_buffer, cartridge_GetBankOffset(6));

        // Default to bank 0
        // banksets changes
        cartridge_StoreBank(0);
      }
    } break;
    case CARTRIDGE_TYPE_ABSOLUTE:
      //memory_WriteROM(16384, 16384, cartridge_buffer);
      memory_WriteROM(16384, 16384, cartridge_buffer, 0);
      //memory_WriteROM(32768, 32768, cartridge_buffer + cartridge_GetBankOffset(2));
      memory_WriteROM(32768, 32768, cartridge_buffer, cartridge_GetBankOffset(2));
      break;
    case CARTRIDGE_TYPE_ACTIVISION:
      if (122880 < size) {
        //memory_WriteROM(40960, 16384, cartridge_buffer);
        memory_WriteROM(40960, 16384, cartridge_buffer, 0);
        //memory_WriteROM(16384, 8192, cartridge_buffer + 106496);
        memory_WriteROM(16384, 8192, cartridge_buffer, 106496);
        //memory_WriteROM(24576, 8192, cartridge_buffer + 98304);
        memory_WriteROM(24576, 8192, cartridge_buffer, 98304);
        //memory_WriteROM(32768, 8192, cartridge_buffer + 122880);
        memory_WriteROM(32768, 8192, cartridge_buffer, 122880);
        //memory_WriteROM(57344, 8192, cartridge_buffer + 114688);
        memory_WriteROM(57344, 8192, cartridge_buffer, 114688);
      }
      break;
    case CARTRIDGE_TYPE_SOUPER:
      memory_WriteROM(0xc000, 0x4000, cartridge_buffer, cartridge_GetBankOffset(31));
      memory_WriteROM(0x8000, 0x4000, cartridge_buffer, cartridge_GetBankOffset(0));
      memory_ClearROM(0x4000, 0x4000);
      break;
  }
}

// ----------------------------------------------------------------------------
// Write
// ----------------------------------------------------------------------------
//void cartridge_Write(word address, byte data) {
function cartridge_Write(address, data) {
  // banksets changes
  var size = cartridge_size;
  if (cartridge_banksets) size = size >> 1;

  //console.log("Cartridge write: %d, %d", address, data);
  switch (cartridge_type) {
    case CARTRIDGE_TYPE_SUPERCART:
    case CARTRIDGE_TYPE_SUPERCART_RAM:
    case CARTRIDGE_TYPE_SUPERCART_ROM: {
      //uint maxbank = size / 16384;
      var maxbank = size / 16384;
      if (address >= 32768 && address < 49152 && cartridge_GetBank(data) < maxbank /*9*/) {
        cartridge_StoreBank(data);
      }
    } break;
    case CARTRIDGE_TYPE_SUPERCART_LARGE: {
      //uint maxbank = size / 16384;
      var maxbank = size / 16384;
      if (address >= 32768 && address < 49152 && cartridge_GetBank(data) < maxbank /*9*/) {
        cartridge_StoreBank(data + 1);
      }
    } break;
    case CARTRIDGE_TYPE_ABSOLUTE:
      if (address == 32768 && (data == 1 || data == 2)) {
        cartridge_StoreBank(data - 1);
      }
      break;
    case CARTRIDGE_TYPE_ACTIVISION:
      if (address >= 65408) {
        cartridge_StoreBank(address & 7);
      }
      break;
    case CARTRIDGE_TYPE_SOUPER:
      if (address >= 0x4000 && address < 0x8000)
      {
          memory_souper_ram[memory_souper_GetRamAddress(address)] = data;
          break;
      }
      switch (address)
      {
      case CARTRIDGE_SOUPER_BANK_SEL:
          cartridge_StoreBank(data & 31);
          break;
      case CARTRIDGE_SOUPER_CHR_A_SEL:
          cartridge_souper_StoreChrBank(0, data);
          break;
      case CARTRIDGE_SOUPER_CHR_B_SEL:
          cartridge_souper_StoreChrBank(1, data);
          break;
      case CARTRIDGE_SOUPER_MODE_SEL:
          cartridge_souper_SetMode(data);
          break;
      case CARTRIDGE_SOUPER_EXRAM_V_SEL:
          cartridge_souper_SetRamPageBank(0, data);
          break;
      case CARTRIDGE_SOUPER_EXRAM_D_SEL:
          cartridge_souper_SetRamPageBank(1, data);
          break;
      case CARTRIDGE_SOUPER_AUDIO_CMD:
          window.Module._bupchip_ProcessAudioCommand(data); 
          break;
      }
      break;
  }
}

// ----------------------------------------------------------------------------
// StoreBank
// ----------------------------------------------------------------------------
//void cartridge_StoreBank(byte bank) {
function cartridge_StoreBank(bank) {
  switch (cartridge_type) {
    case CARTRIDGE_TYPE_SUPERCART:
      cartridge_WriteBank(32768, bank);
      break;
    case CARTRIDGE_TYPE_SUPERCART_RAM:
      cartridge_WriteBank(32768, bank);
      break;
    case CARTRIDGE_TYPE_SUPERCART_ROM:
      cartridge_WriteBank(32768, bank);
      break;
    case CARTRIDGE_TYPE_SUPERCART_LARGE:
      cartridge_WriteBank(32768, bank);
      break;
    case CARTRIDGE_TYPE_ABSOLUTE:
      cartridge_WriteBank(16384, bank);
      break;
    case CARTRIDGE_TYPE_ACTIVISION:
      cartridge_WriteBank(40960, bank);
      break;
    case CARTRIDGE_TYPE_SOUPER:
      cartridge_WriteBank(32768, bank);
      break;
  }
}

// SOUPER
function cartridge_souper_StoreChrBank(page, bank)
{
   if (page < 2)
      cartridge_souper_chr_bank[page] = bank;
}

function cartridge_souper_SetMode(data)
{
   cartridge_souper_mode = data;
}

function cartridge_souper_GetMode()
{
  return cartridge_souper_mode;
}

function cartridge_souper_SetRamPageBank(which, data)
{
   if (which < 2)
      cartridge_souper_ram_page_bank[which] = data & 7;
}

// ----------------------------------------------------------------------------
// IsLoaded
// ----------------------------------------------------------------------------
//bool cartridge_IsLoaded() {
function cartridge_IsLoaded() {
  //return (cartridge_buffer != NULL) ? true : false;
  return (cartridge_buffer != null) ? true : false;
}

// ----------------------------------------------------------------------------
// Release
// ----------------------------------------------------------------------------
//void cartridge_Release() {
function cartridge_Release() {
  cartridge_stored = false;
  high_score_cart_loaded = false;

  //if (cartridge_buffer != NULL) {
  if (cartridge_buffer != null) {
    //delete [] cartridge_buffer;
    cartridge_size = 0;
    //cartridge_buffer = NULL;
    cartridge_buffer = null;

    //
    // Wii
    //
    // These values need to be reset so that moving between carts works
    // consistently. This seems to be a ProSystem emulator bug.
    //
    cartridge_title = "";
    cartridge_type = 0;
    cartridge_region = 0;
    cartridge_pokey = 0;
    cartridge_pokey450 = 0;
      // banksets changes
    cartridge_pokey800 = 0;
    cartridge_xm = false;
    // Default to joysticks
    //memset(cartridge_controller, 1, sizeof(cartridge_controller));
    cartridge_controller = [1, 1];
    cartridge_bank = 0;
    cartridge_flags = 0;
    cartridge_disable_bios = false;
    cartridge_crosshair_x = 0;
    cartridge_crosshair_y = 0;
//      high_score_set = false;
    cartridge_hblank = HBLANK_DEFAULT;
    cartridge_dualanalog = false;
    cartridge_left_switch = 1;
    cartridge_right_switch = 0;
    cartridge_swap_buttons = false;
    cartridge_hsc_enabled = false;
    // banksets changes
    cartridge_banksets = false;
    cartridge_pokey_write_only = false;
    cartridge_halt_banked_ram = false;
  }
}

function cartridge_LoadHighScoreCart(callback) {
  if (!cartridge_hsc_enabled || (cartridge_region != REGION_NTSC)) {
    // Only load the cart if it is enabled and the region is NTSC
    console.log(cartridge_hsc_enabled ?
      "Not loading high score cartridge, PAL region." :
      "High score cartridge is disabled (via db and cart header)."
    );
    callback(false);
    return;
  }

  // Load high score cartridge
  var high_score_buffer = highScoreCallback.getRom();
  if (high_score_buffer == null) {
    console.log("Unable to locate high score cartridge.");
    callback(false);
    return;
  }
  console.log("Found high score cartridge.");

  // Validate high score cartridge hash
  var digest = md5(high_score_buffer);
  if (digest != "c8a73288ab97226c52602204ab894286") {
    console.log("High score cartridge hash is invalid.");
    callback(false);
    return;
  }

  // Post SRAM load callback
  var postLoadCallback = function(sram) {
    if (sram) {
      for (var i = 0; i < sram.length && i < HS_SRAM_SIZE; i++) {
        memory_Write(HS_SRAM_START + i, sram[i]);
      }
      for (var i = 0; i < high_score_buffer.length; i++) {
        memory_Write(0x3000 + i, high_score_buffer.charCodeAt(i));
      }
      high_score_cart_loaded = true;
    }
    console.log("High score cart loaded: " + high_score_cart_loaded);

    // Invoke callback
    callback(high_score_cart_loaded);
  }
  // Load SRAM with callback
  highScoreCallback.loadSram(postLoadCallback);
}

function Crc16(data) {
  var num, uCRC = 0xffff;
  var x;

  for (num = 0; num < data.length; num++) {
    uCRC = (data[num]) ^ uCRC;
    for (x = 0; x < 8; x++) {
      if (uCRC & 0x0001) {
        uCRC = uCRC >> 1;
        uCRC = uCRC ^ 0xA001;
      } else {
        uCRC = uCRC >> 1;
      }
    }
  }
  return uCRC;
}

function GetRegion() {
  return cartridge_region;
}

function IsComposite() {
  return cartridge_composite;
}

function IsPokeyEnabled() {
  return cartridge_pokey;
}

function IsPokey450Enabled() {
  return cartridge_pokey450;
}

function IsPokey800Enabled() {
  return cartridge_pokey800;
}

function IsPokeyWriteOnly() {
  return cartridge_pokey_write_only;
}

function GetCartridgeXM() {
  return cartridge_xm;
}

function IsXmEnabled() {
  return xm_mode == 2 ? cartridge_xm : xm_mode;
}

function IsBanksets() {
  return cartridge_banksets;
}

function IsHaltBankedRam() {
  return cartridge_halt_banked_ram;
}

function IsSwapButtons() {
  return cartridge_swap_buttons;
}

function IsDualAnalog() {
  return cartridge_dualanalog;
}

function IsBupChip() {
  return cartridge_bupchip;
}

function IsLightGunEnabled() {
  return cartridge_controller[0] == CARTRIDGE_CONTROLLER_LIGHTGUN;
}

function GetFlags() {
  return cartridge_flags;
}

function GetHblank() {
  return cartridge_hblank;
}

function GetLeftSwitch() {
  return cartridge_left_switch;
}

function GetRightSwitch() {
  return cartridge_right_switch;
}

function GetDigest() {
  return cartridge_digest;
}

function SetTitle(title) {
  cartridge_title = title;
}

function GetTitle() {
  return cartridge_title;
}

function GetSize() {
  return cartridge_size;
}

function GetType() {
  return cartridge_type;
}

function SetType(type) {
  cartridge_type = type;
}

function SetPokey(pokey) {
  cartridge_pokey = pokey;
}

function SetPokey450(pokey) {
  cartridge_pokey450 = pokey;
}

function SetController1(c1) {
  cartridge_controller[0] = c1;
}

function SetController2(c2) {
  cartridge_controller[1] = c2;
}

function GetController1() {
  return cartridge_controller[0];
}

function GetController2() {
  return cartridge_controller[1];
}

function SetRegion(region) {
  cartridge_region = region;
}

function SetFlags(flags) {
  cartridge_flags = flags;
}

function SetXm(xm) {
  cartridge_xm = xm;
}

function SetHblank(hblank) {
  cartridge_hblank = hblank;
}

function SetCrossX(crossx) {
  cartridge_crosshair_x = crossx;
}

function SetCrossY(crossy) {
  cartridge_crosshair_y = crossy;
}

function GetCrossX() {
  return cartridge_crosshair_x;
}

function GetCrossY() {
  return cartridge_crosshair_y;
}

function SetDualAnalog(dualAnalog) {
  cartridge_dualanalog = dualAnalog;
}

function SetLeftSwitch(val) {
  cartridge_left_switch = val;
}

function SetRightSwitch(val) {
  cartridge_right_switch = val;
}

function SetSwapButtons(val) {
  cartridge_swap_buttons = val;
}

function SetHighScoreCartEnabled(val) {
  cartridge_hsc_enabled = val;
}

function IsHighScoreCartEnabled() {
  return cartridge_hsc_enabled;
}

function SetXmMode(m) {
  xm_mode = m;
}

function GetXmMode() {
  return xm_mode;
}

function GetXmModeDefault() {
  return XM_MODE_DEFAULT;
}

function cartridge_IsStored() {
  return cartridge_stored;
}

function SetBanksetsBegin(begin) {
  cartridge_banksets_begin = begin;
}

function GetBanksetsBegin() {
  return cartridge_banksets_begin;
}

function SetBanksetsEnd(end) {
  cartridge_banksets_end = end;
}

function GetBanksetsEnd() {
  return cartridge_banksets_end;
}

function GetCartridgeBank() {
  return cartridge_bank;
}

function init(e) {
  REGION_NTSC = e.Region.REGION_NTSC;

  memory_WriteROM = Memory.WriteROM;
  memory_ClearROM = Memory.ClearROM;
  memory_Write = Memory.Write;
}

Events.addListener(new Events.Listener("init",
  function (event) { init(event); }));

Events.addListener(new Events.Listener("highScoreCallbackChanged",
  function (hsCallback) { highScoreCallback = hsCallback }));

export {
  GetCartridgeXM,
  GetRegion,
  IsBanksets,
  IsHaltBankedRam,
  IsPokeyEnabled,
  IsPokey450Enabled,
  IsPokey800Enabled,
  IsPokeyWriteOnly,
  IsXmEnabled,
  IsSwapButtons,
  IsDualAnalog,
  IsLightGunEnabled,
  IsComposite,
  IsBupChip,
  GetFlags,
  GetHblank,
  GetLeftSwitch,
  GetRightSwitch,
  GetDigest,
  SetTitle,
  GetTitle,
  GetSize,
  GetType,
  SetType,
  SetPokey,
  SetPokey450,
  SetBanksetsBegin,
  GetBanksetsBegin,
  SetBanksetsEnd,
  GetBanksetsEnd,
  SetController1,
  SetController2,
  GetController1,
  GetController2,
  SetRegion,
  SetFlags,
  SetXm,
  SetXmMode,
  GetXmMode,
  GetXmModeDefault,
  SetHblank,
  SetCrossX,
  SetCrossY,
  GetCrossX,
  GetCrossY,
  SetDualAnalog,
  SetLeftSwitch,
  SetRightSwitch,
  SetSwapButtons,
  SetHighScoreCartEnabled,
  IsHighScoreCartEnabled,
  GetCartridgeBank,
  cartridge_Load as Load,
  cartridge_IsLoaded as IsLoaded,
  cartridge_Write as Write,
  cartridge_Store as Store,
  cartridge_Release as Release,
  cartridge_LoadHighScoreCart as LoadHighScoreCart,
  cartridge_IsStored as IsStored,
  cartridge_StoreBank as StoreBank,
  cartridge_souper_GetMode as GetSouperMode,
  cartridge_souper_SetMode as SetSouperMode,
  cartridge_buffer as Buffer,
  cartridge_souper_chr_bank as SouperChrBank,
  cartridge_souper_ram_page_bank as SouperRamBank,
  CARTRIDGE_TYPE_NORMAL,
  CARTRIDGE_TYPE_NORMAL_RAM,
  CARTRIDGE_TYPE_SUPERCART,
  CARTRIDGE_TYPE_SUPERCART_RAM,
  CARTRIDGE_TYPE_SUPERCART_ROM,
  CARTRIDGE_TYPE_SUPERCART_LARGE,
  CARTRIDGE_TYPE_SOUPER,
  CARTRIDGE_SOUPER_MODE_MFT,
  CARTRIDGE_SOUPER_MODE_CHR,
  CARTRIDGE_SOUPER_MODE_EXS
}

// // The memory location of the high score cartridge SRAM
// #define HS_SRAM_START 0x1000
// // The size of the high score cartridge SRAM
// #define HS_SRAM_SIZE 2048

// /*
//  * Saves the high score cartridge SRAM
//  *
//  * return   Whether the save was successful
//  */
// bool cartridge_SaveHighScoreSram()
// {
//   if (!high_score_cart_loaded || !high_score_set) {
//     // If we didn't load the high score cartridge, or the game didn't
//     // access the high score ROM, don't save.
//     return false;
//   }

//   char sram_file[WII_MAX_PATH] = "";
//   snprintf(sram_file, WII_MAX_PATH, "%s%s", wii_get_fs_prefix(),
//     WII_HIGH_SCORE_CART_SRAM);
//   std:: string filename(sram_file);
//   FILE * file = fopen(filename.c_str(), "wb");
//   if (file == NULL) {
//     logger_LogError("Failed to open the file " + filename + " for writing.");
//     return false;
//   }

//   if (fwrite( & (memory_ram[HS_SRAM_START]), 1, HS_SRAM_SIZE, file) != HS_SRAM_SIZE) {
//     fclose(file);
//     logger_LogError("Failed to write highscore sram data to the file " + filename + ".");
//     return false;
//   }

//   fflush(file);
//   fclose(file);

//   return true;
// }

// /*
//  * Loads the high score cartridge SRAM
//  *
//  * return   Whether the load was successful
//  */
// static bool cartridge_LoadHighScoreSram()
// {
//   char sram_file[WII_MAX_PATH] = "";
//   snprintf(sram_file, WII_MAX_PATH, "%s%s", wii_get_fs_prefix(),
//     WII_HIGH_SCORE_CART_SRAM);
//   std:: string filename(sram_file);
//   FILE * file = fopen(filename.c_str(), "rb");
//   if (file == NULL) {
//     return false;
//   }

//   byte sram[HS_SRAM_SIZE];
//   if (fread(sram, 1, HS_SRAM_SIZE, file) != HS_SRAM_SIZE) {
//     fclose(file);
//     logger_LogError("Failed to read highscore sram data from the file " + filename + ".");
//     return false;
//   }

//   for (uint i = 0; i < HS_SRAM_SIZE; i++ )
//   {
//     memory_Write(HS_SRAM_START + i, sram[i]);
//   }

//   fclose(file);

//   return true;
// }

// /*
//  * Loads the high score cartridge
//  *
//  * return   Whether the load was successful
//  */
// bool cartridge_LoadHighScoreCart() {

//   if (!cartridge_hsc_enabled || cartridge_region != REGION_NTSC) {
//     // Only load the cart if it is enabled and the region is NTSC
//     return false;
//   }

//   byte * high_score_buffer = NULL;
//   char high_score_cart[WII_MAX_PATH] = "";
//   snprintf(high_score_cart, WII_MAX_PATH, "%s%s", wii_get_fs_prefix(),
//     WII_HIGH_SCORE_CART);

//   uint hsSize = cartridge_Read(high_score_cart, & high_score_buffer);
//   if (high_score_buffer != NULL) {
//     logger_LogInfo("Found high score cartridge.");
//     std:: string digest = hash_Compute(high_score_buffer, hsSize);
//     if (digest == std:: string("c8a73288ab97226c52602204ab894286") )
//     {
//       cartridge_LoadHighScoreSram();
//       for (uint i = 0; i < hsSize; i++ )
//       {
//         //memory_WriteROM( 0x3000, hsSize, high_score_buffer );
//         memory_Write(0x3000 + i, high_score_buffer[i]);
//       }
//       high_score_cart_loaded = true;
//     }
//         else
//     {
//       logger_LogError("High score cartridge hash is invalid.");
//     }

//     delete [] high_score_buffer;
//     return high_score_cart_loaded;
//   }
//   else {
//     logger_LogInfo("Unable to locate high score cartridge.");
//   }

//   return false;
// }
