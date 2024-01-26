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
// Maria.c
// ----------------------------------------------------------------------------

import * as Memory from "./Memory.js"
import * as Sally from "./Sally.js"
import * as Events from "../events.js"
import { Rect } from "./Rect.js"
import { Pair } from "./Pair.js"
import * as Cart from "./Cartridge.js"

var ram = Memory.ram;
//var ramf = Memory.Read;

var BACKGRND    = 32;
var DPPH        = 44;
var DPPL        = 48;
var CHARBASE    = 52;
var CTRL        = 60;

var MARIA_SURFACE_SIZE = 77440;
var MARIA_LINERAM_SIZE = 160;

var MARIA_CYCLE_LIMIT = 428;

//extern unsigned char* wii_sdl_get_blit_addr();
//extern unsigned int wii_lightgun_flash;
//extern unsigned int wii_lightgun_flash;
//extern bool lightgun_enabled;

//rect maria_displayArea = {0, 16, 319, 258};
var maria_displayArea = new Rect(0, 17, 319, 258);

//rect maria_visibleArea = {0, 26, 319, 248};
var maria_visibleArea = new Rect(0, 26, 319, 248); 
//word  maria_scanline = 1;

//byte* maria_surface = 0; // TODO JS
var maria_surface = null;

//static byte maria_lineRAM[MARIA_LINERAM_SIZE];
var maria_lineRAM_buffers = [new Array(MARIA_LINERAM_SIZE), new Array(MARIA_LINERAM_SIZE)];
var maria_lineRAM_index = 0;
var maria_lineRAM = maria_lineRAM_buffers[maria_lineRAM_index];
//static uint maria_cycles;
var maria_cycles = 0;
var color_kill = false;
//static pair maria_dpp;
var maria_dpp = new Pair();
//static pair maria_dp;
var maria_dp = new Pair();
//static pair maria_pp;
var maria_pp = new Pair();
//static byte maria_horizontal;
var maria_horizontal = 0;
//static byte maria_palette;
var maria_palette = 0;
//static signed char maria_offset;
var maria_offset = 0;
//static byte maria_h08;
var maria_h08 = 0;
//static byte maria_h16;
var maria_h16 = 0;
//static byte maria_wmode;
var maria_wmode = 0;

// Whether to access RAM directly
var dr = false;
// Whether NMI was triggered
var nmi = false;
// banksets changes
var banksets = false;
var maria_read = false;
var souper = false;

function ramf(address)
{
   if (souper) 
   {   var page, chrOffset;
      if ((Cart.GetSouperMode() & Cart.CARTRIDGE_SOUPER_MODE_MFT) == 0 || address < 0x8000 || 
          ((Cart.GetSouperMode() & Cart.CARTRIDGE_SOUPER_MODE_CHR) == 0 && address < 0xc000)) 
      {
         return Memory.Read(address);
      }
      if (address >= 0xc000) /* EXRAM */
         return Memory.Read(address - 0x8000);
      if (address < 0xa000) /* Fixed ROM */
         return Memory.Read(address + 0x4000);
      page = Cart.SouperChrBank[(address & 0x80) != 0 ? 1 : 0];
      chrOffset = (((page & 0xfe) << 4) | (page & 1)) << 7;
      var addr = (address & 0x0f7f) | chrOffset;
      if(addr >= Cart.GetSize())
        return 0;
      return Cart.Buffer[addr];
   }

   if (maria_read)
      return Memory.ReadMaria(address);
   else
      return Memory.Read(address);
}


// ----------------------------------------------------------------------------
// StoreCell
// ----------------------------------------------------------------------------
//static inline void maria_StoreCell(byte data) {
function maria_StoreCell1(data) {
  if (maria_horizontal < MARIA_LINERAM_SIZE) {
    if (data) {
      maria_lineRAM[maria_horizontal] = maria_palette | data;
    }
    else {
      //byte kmode = memory_ram[CTRL] & 4;
      var kmode = ram[CTRL] & 4;
      if (kmode) {
        maria_lineRAM[maria_horizontal] = 0;
      }
    }
  }
  //maria_horizontal++;
  maria_horizontal = (maria_horizontal + 1) & 0xFF;
}

// ----------------------------------------------------------------------------
// StoreCell
// ----------------------------------------------------------------------------
//static inline void maria_StoreCell(byte high, byte low) {  
function maria_StoreCell2(high, low) {
  // banksets changes
  var kmode = ram[CTRL] & 4;
  var c = (maria_palette & 0x10) | high | low; 
  if (((c & 3) || kmode) && (maria_horizontal < MARIA_LINERAM_SIZE)) {
    maria_lineRAM[maria_horizontal] = c;
  }


  // var rmode = ram[CTRL] & 3;
  // if (maria_horizontal < MARIA_LINERAM_SIZE) {
  //   if (low || high) {
  //     let v = maria_palette & 16 | high | low;
  //     if (rmode === 0 && !(v & 3)) console.log("## C&3 occurring!")
      
  //     if (rmode !==0 || v & 3)
  //       maria_lineRAM[maria_horizontal] = v;
  //   }
  //   else {
  //     //byte kmode = memory_ram[CTRL] & 4;
  //     var kmode = ram[CTRL] & 4;
  //     if (kmode) {
  //       maria_lineRAM[maria_horizontal] = 0;
  //     }
  //   }
  // }
  //maria_horizontal++;
  maria_horizontal = (maria_horizontal + 1) & 0xFF;
}

// ----------------------------------------------------------------------------
// IsHolyDMA
// ----------------------------------------------------------------------------
//static inline bool maria_IsHolyDMA( ) {
function maria_IsHolyDMA() {
  //if(maria_pp.w > 32767) {
  if (maria_pp.getW() > 32767) {
    //if(maria_h16 && (maria_pp.w & 4096)) {
    if (maria_h16 && (maria_pp.getW() & 4096)) {
      return true;
    }
    //if(maria_h08 && (maria_pp.w & 2048)) {
    if (maria_h08 && (maria_pp.getW() & 2048)) {
      return true;
    }
  }
  return false;
}

// ----------------------------------------------------------------------------
// GetColor
// ----------------------------------------------------------------------------
//extern byte atari_pal8[256];

//static inline byte maria_GetColor(byte data) {  
function maria_GetColor(data) {
  data &= 0xFF;
  if (data & 3) {
    //return atari_pal8[memory_ram[BACKGRND + data]];
    return ram[BACKGRND + data];
  }
  else {
    // return atari_pal8[memory_ram[BACKGRND]];
    return ram[BACKGRND];
  }
}

// ----------------------------------------------------------------------------
// StoreGraphic
// ----------------------------------------------------------------------------
//static inline void maria_StoreGraphic( ) {
function maria_StoreGraphic() {
  //byte data = memory_ram[maria_pp.w];
  var data = (dr ? ram[maria_pp.getW()] : ramf(maria_pp.getW()));
  if (maria_wmode) {
    if (maria_IsHolyDMA()) {
      // #if 0 // Wii: disabled due to rendering in Kangaroo mode
      //       maria_StoreCell(0, 0);
      //       maria_StoreCell(0, 0);
      // #endif      
      //maria_horizontal += 2;
      maria_horizontal = (maria_horizontal + 2) & 0xFF;
    }
    else {
      maria_StoreCell2((data & 12), (data & 192) >>> 6);
      maria_StoreCell2((data & 48) >>> 4, (data & 3) << 2);
    }
  }
  else {
    if (maria_IsHolyDMA()) {
      // #if 0 // Wii: disabled due to rendering in Kangaroo mode
      //       maria_StoreCell(0);
      //       maria_StoreCell(0);
      //       maria_StoreCell(0);
      //       maria_StoreCell(0);
      // #endif      
      //maria_horizontal += 4;
      maria_horizontal = (maria_horizontal + 4) & 0xFF;
    }
    else {
      maria_StoreCell1((data & 192) >>> 6);
      maria_StoreCell1((data & 48) >>> 4);
      maria_StoreCell1((data & 12) >>> 2);
      maria_StoreCell1(data & 3);
    }
  }
  //maria_pp.w++;
  maria_pp.wPlusPlus();
}

function colorKill(buffer, index) {
  for(var i = 0; i <8; i++) {
    buffer[index + i] = buffer[index + i] & 0x0f;
  }
}

// ----------------------------------------------------------------------------
// WriteLineRAM
// ----------------------------------------------------------------------------
//static inline void maria_WriteLineRAM(byte * buffer) {
function maria_WriteLineRAM(buffer, offset) {  // TODO JS: What is buffer?
  //byte rmode = memory_ram[CTRL] & 3;
  var rmode = ram[CTRL] & 3;
  var pixel = offset;
  if (rmode == 0) {
    // 160A/B
    //int pixel = 0;    
    //for (int index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
    for (var index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
      //word color;
      var color;
      color = maria_GetColor(maria_lineRAM[index + 0]);
      buffer[pixel++] = color;
      buffer[pixel++] = color;
      color = maria_GetColor(maria_lineRAM[index + 1]);
      buffer[pixel++] = color;
      buffer[pixel++] = color;
      color = maria_GetColor(maria_lineRAM[index + 2]);
      buffer[pixel++] = color;
      buffer[pixel++] = color;
      color = maria_GetColor(maria_lineRAM[index + 3]);
      buffer[pixel++] = color;
      buffer[pixel++] = color;
      if (color_kill) {
        colorKill(buffer, pixel - 8);
      }      
    }
  }
  else if (rmode == 2) {
    // 320B/D
    //int pixel = 0;
    //for (int index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
    for (var index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 0] & 16) | ((maria_lineRAM[index + 0] & 8) >>> 3) | ((maria_lineRAM[index + 0] & 2)));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 0] & 16) | ((maria_lineRAM[index + 0] & 4) >>> 2) | ((maria_lineRAM[index + 0] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 1] & 16) | ((maria_lineRAM[index + 1] & 8) >>> 3) | ((maria_lineRAM[index + 1] & 2)));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 1] & 16) | ((maria_lineRAM[index + 1] & 4) >>> 2) | ((maria_lineRAM[index + 1] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 2] & 16) | ((maria_lineRAM[index + 2] & 8) >>> 3) | ((maria_lineRAM[index + 2] & 2)));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 2] & 16) | ((maria_lineRAM[index + 2] & 4) >>> 2) | ((maria_lineRAM[index + 2] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 3] & 16) | ((maria_lineRAM[index + 3] & 8) >>> 3) | ((maria_lineRAM[index + 3] & 2)));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 3] & 16) | ((maria_lineRAM[index + 3] & 4) >>> 2) | ((maria_lineRAM[index + 3] & 1) << 1));
      if (color_kill) {
        colorKill(buffer, pixel - 8);
      }      
    }
  }
  else if (rmode == 3) {
    // 320A/C
    //int pixel = 0;
    //for (int index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
    for (var index = 0; index < MARIA_LINERAM_SIZE; index += 4) {
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 0] & 30));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 0] & 28) | ((maria_lineRAM[index + 0] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 1] & 30));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 1] & 28) | ((maria_lineRAM[index + 1] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 2] & 30));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 2] & 28) | ((maria_lineRAM[index + 2] & 1) << 1));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 3] & 30));
      buffer[pixel++] = maria_GetColor((maria_lineRAM[index + 3] & 28) | ((maria_lineRAM[index + 3] & 1) << 1));
      if (color_kill) {
        colorKill(buffer, pixel - 8);
      }      
    }
  }

  // Apply "composite" smoothing filter...
  if (Cart.IsComposite() && ((rmode == 2) || (rmode == 3))) {
    var lum1 = 0;
    var lum2 = 0;
    var lum3 = 0;
    lum3 = buffer[offset + 1] & 0x0f;
    for (var pixel = offset + 2;
      pixel < (MARIA_LINERAM_SIZE * 2 + offset - 1); pixel += 1) {
      lum1 = lum2;
      lum2 = lum3;
      lum3 = buffer[pixel] & 0x0f;
      // a proper composite artifact would shift chroma for even-position
      // bright pixels differently from odd-position bright pixels. We
      // don't do that (1) for performance reasons, (2) because it doesn't
      // actually enhance Tower Toppler, and (3) there's very wide variance
      // in how the shift works, depending on the TV.
      if ((lum1 == 0) && (lum2 > 5) && (lum3 == 0)) {
        buffer[pixel - 1] =
          (buffer[pixel - 1] & 0xF0) | ((lum2 >> 1) + 1);
        buffer[pixel - 2] = buffer[pixel - 1];
      }
    }
  }
}

var basePP = new Pair();

// ----------------------------------------------------------------------------
// StoreLineRAM
// ----------------------------------------------------------------------------
//static inline void maria_StoreLineRAM() {
function maria_StoreLineRAM() {
  //for (int index = 0; index < MARIA_LINERAM_SIZE; index++) {
  // for (var index = 0; index < MARIA_LINERAM_SIZE; index++) {
  //   maria_lineRAM[index] = 0;
  // }

  maria_cycles += 16; // Maria cycles (DMA Startup)

  //byte mode = memory_ram[maria_dp.w + 1];
  var mode = (dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1));
  while (mode & 0x5f && (maria_cycles < MARIA_CYCLE_LIMIT)) {
    //byte width;
    var width = 0;
    //byte indirect = 0;
    var indirect = 0;

    //maria_pp.b.l = memory_ram[maria_dp.w];
    maria_pp.setBL((dr ? ram[maria_dp.getW()] : ramf(maria_dp.getW())));
    //maria_pp.b.h = memory_ram[maria_dp.w + 2];
    maria_pp.setBH((dr ? ram[maria_dp.getW() + 2] : ramf(maria_dp.getW() + 2)));

    if (mode & 31) {
      maria_cycles += 8; // Maria cycles (Header 4 byte)
      //maria_palette = (memory_ram[maria_dp.w + 1] & 224) >> 3;
      maria_palette = (((dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1)) & 224) >>> 3) & 0xFF;
      //maria_horizontal = memory_ram[maria_dp.w + 3];
      maria_horizontal = (dr ? ram[maria_dp.getW() + 3] : ramf(maria_dp.getW() + 3));
      //width = memory_ram[maria_dp.w + 1] & 31;
      width = (dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1)) & 31;
      //width = ((~width) & 31) + 1;
      width = (((~width) & 31) + 1) & 0xFF;
      //maria_dp.w += 4;
      maria_dp.wPlusEqual(4);
    }
    else {
      maria_cycles += 10; // Maria cycles (Header 5 byte) 
      //maria_palette = (memory_ram[maria_dp.w + 3] & 224) >> 3;
      maria_palette = (((dr ? ram[maria_dp.getW() + 3] : ramf(maria_dp.getW() + 3)) & 224) >>> 3) & 0xFF;
      //maria_horizontal = memory_ram[maria_dp.w + 4];
      maria_horizontal = (dr ? ram[maria_dp.getW() + 4] : ramf(maria_dp.getW() + 4));
      //indirect = memory_ram[maria_dp.w + 1] & 32;
      indirect = (dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1)) & 32;
      //maria_wmode = memory_ram[maria_dp.w + 1] & 128;
      maria_wmode = (dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1)) & 128;
      //width = memory_ram[maria_dp.w + 3] & 31;
      width = (dr ? ram[maria_dp.getW() + 3] : ramf(maria_dp.getW() + 3)) & 31;
      //width = (width == 0) ? 32 : ((~width) & 31) + 1;
      width = ((width == 0) ? 32 : ((~width) & 31) + 1) & 0xFF;
      //maria_dp.w += 5;
      maria_dp.wPlusEqual(5);
    }

    var dma_hole_known = false;

    if (!indirect) {
      //maria_pp.b.h += maria_offset;
      maria_pp.bhPlusEqual(maria_offset);
      //for (int index = 0; index < width; index++) {
      for (var index = 0; index < width; index++) {
        if (maria_cycles >= MARIA_CYCLE_LIMIT) 
          break;

        if (maria_IsHolyDMA()) {
          if (!dma_hole_known) {
            maria_cycles += 3;
            dma_hole_known = true;
          }
        } else {
          maria_cycles += 3;
        }
        maria_StoreGraphic();
      }
    }
    else {
      //byte cwidth = memory_ram[CTRL] & 16;
      var cwidth = ram[CTRL] & 16;
      //pair basePP = maria_pp;
      //var basePP = maria_pp.clone();
      basePP.copy(maria_pp);
      //for (int index = 0; index < width; index++) {
      for (var index = 0; index < width; index++) {
        if (maria_cycles >= MARIA_CYCLE_LIMIT) 
          break;

        //maria_pp.b.l = memory_ram[basePP.w++];
        maria_pp.setBL((dr ? ram[basePP.wPlusPlus()] : ramf(basePP.wPlusPlus())));
        //maria_pp.b.h = memory_ram[CHARBASE] + maria_offset;
        maria_pp.setBH(ram[CHARBASE] + maria_offset);

        if (maria_IsHolyDMA()) {
          if (!dma_hole_known) {
            maria_cycles += 3;
            dma_hole_known = true;
          }
        } else {
          maria_cycles += 6;
          if (cwidth) {
            maria_cycles += 3; 
          }
        }

        maria_StoreGraphic(); // Maria cycles (Indirect, 1 byte)        
        if (cwidth) {
          maria_StoreGraphic();
        }
      }
    }
    //mode = memory_ram[maria_dp.w + 1];
    mode = (dr ? ram[maria_dp.getW() + 1] : ramf(maria_dp.getW() + 1));
  }

	// Last Line post-render DMA cycle penalties...
  if (maria_offset == 0) {
    maria_cycles += 6; // extra shutdown time
    if ((dr ? ram[maria_dpp.getW() + 3] : ramf(maria_dpp.getW() + 3)) & 128) {
      maria_cycles += 17; // interrupt overhead
    }  
  }
}

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void maria_Reset() {
function maria_Reset() {
  if (!maria_surface) maria_surface = js_get_blit_addr();
  //maria_scanline = 1;
  //for (int index = 0; index < MARIA_SURFACE_SIZE; index++) {
  for (var index = 0; index < MARIA_SURFACE_SIZE; index++) {
    maria_surface[index] = 0;
  }

  for (var index = 0; index < MARIA_LINERAM_SIZE; index++) {
    maria_lineRAM_buffers[0][index] = 0;
    maria_lineRAM_buffers[1][index] = 0;
  }

  //
  // WII
  //
  // These values need to be reset to allow switching between carts. 
  // This appears to be a bug in the ProSystem emulator.
  //
  maria_cycles = 0;
  color_kill = false;
  //maria_dpp.w = 0;
  maria_dpp.setW(0);
  //maria_dp.w = 0;
  maria_dp.setW(0);
  //maria_pp.w = 0;
  maria_pp.setW(0);
  maria_horizontal = 0;
  maria_palette = 0;
  maria_offset = 0;
  maria_h08 = 0;
  maria_h16 = 0;
  maria_wmode = 0;
  nmi = false;
  maria_read = false;
}

// ----------------------------------------------------------------------------
// RenderScanline
// ----------------------------------------------------------------------------
//uint maria_RenderScanline() {
function maria_RenderScanline(maria_scanline) {
  // banksets changes
  if (banksets) maria_read = true;


  maria_cycles = 0;
  color_kill = (ram[CTRL] & 0x80);
  nmi = false;

  //
  // Displays the background color when Maria is disabled (if applicable)
  //
  if (((ram[CTRL] & 96) != 64) &&
    maria_scanline >= maria_visibleArea.top &&
    maria_scanline <= maria_visibleArea.bottom /*&&
  (!lightgun_enabled || wii_lightgun_flash)*/) {
    //byte bgcolor = maria_GetColor(0);
    var bgcolor = maria_GetColor(0);
    //byte * bgstart = maria_surface + ((maria_scanline - maria_displayArea.top) * maria_displayArea.GetLength());
    var bgstart_idx = ((maria_scanline - maria_displayArea.top) * maria_displayArea.GetLength());
    //for (uint index = 0; index < MARIA_LINERAM_SIZE; index++ ) {
    for (var index = 0; index < MARIA_LINERAM_SIZE; index++) {
      //* bgstart++ = bgcolor;
      maria_surface[bgstart_idx++] = bgcolor;
      //* bgstart++ = bgcolor;
      maria_surface[bgstart_idx++] = bgcolor;
    }
  } else if ((ram[CTRL] & 96) == 64 && maria_scanline >= maria_displayArea.top && maria_scanline <= maria_displayArea.bottom) {    
    if (maria_scanline == maria_displayArea.top) {
      //maria_dpp.b.l = memory_ram[DPPL];
      maria_dpp.setBL(ram[DPPL]);
      //maria_dpp.b.h = memory_ram[DPPH];
      maria_dpp.setBH(ram[DPPH]);
      //maria_h08 = memory_ram[maria_dpp.w] & 32;
      maria_h08 = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 32;
      //maria_h16 = memory_ram[maria_dpp.w] & 64;
      maria_h16 = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 64;
      //maria_offset = memory_ram[maria_dpp.w] & 15;
      maria_offset = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 15;
      //maria_dp.b.l = memory_ram[maria_dpp.w + 2];
      maria_dp.setBL((dr ? ram[maria_dpp.getW() + 2] : ramf(maria_dpp.getW() + 2)));
      //maria_dp.b.h = memory_ram[maria_dpp.w + 1];
      maria_dp.setBH((dr ? ram[maria_dpp.getW() + 1] : ramf(maria_dpp.getW() + 1)));
      //if (memory_ram[maria_dpp.w] & 128) {
      if ((dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 128) {
        nmi = true;
      }
    }

    if (maria_scanline >= maria_displayArea.top && maria_scanline != maria_displayArea.bottom) {
      //maria_cycles += 4;
      //maria_dp.b.l = memory_ram[maria_dpp.w + 2];
      maria_dp.setBL((dr ? ram[maria_dpp.getW() + 2] : ramf(maria_dpp.getW() + 2)));
      //maria_dp.b.h = memory_ram[maria_dpp.w + 1];
      maria_dp.setBH((dr ? ram[maria_dpp.getW() + 1] : ramf(maria_dpp.getW() + 1)));
      
      maria_lineRAM = maria_lineRAM_buffers[maria_lineRAM_index];
      maria_StoreLineRAM();
    
      // Swap buffers
      maria_lineRAM_index = (maria_lineRAM_index == 1 ? 0 : 1);
      maria_lineRAM = maria_lineRAM_buffers[maria_lineRAM_index];

      if (maria_scanline >= maria_visibleArea.top && maria_scanline <= maria_visibleArea.bottom) {
        //maria_WriteLineRAM(maria_surface + ((maria_scanline - maria_displayArea.top) * maria_displayArea.GetLength()));
        maria_WriteLineRAM(maria_surface, ((maria_scanline - maria_displayArea.top) * maria_displayArea.GetLength()));
      }

      for (var index = 0; index < MARIA_LINERAM_SIZE; index++) {
        maria_lineRAM[index] = 0;
      }  

      if (maria_scanline > maria_displayArea.top) {
        if (maria_offset == 0) {
        //maria_dpp.w += 3;
        maria_dpp.wPlusEqual(3);
        //maria_h08 = memory_ram[maria_dpp.w] & 32;
        maria_h08 = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 32;
        //maria_h16 = memory_ram[maria_dpp.w] & 64;
        maria_h16 = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 64;
        //maria_offset = memory_ram[maria_dpp.w] & 15;
        maria_offset = (dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 15;
        //if (memory_ram[maria_dpp.w] & 128) {
        if ((dr ? ram[maria_dpp.getW()] : ramf(maria_dpp.getW())) & 128) {
            nmi = true;
        }
        } else {
          maria_offset--;
      }
      }
    }
  }

  // banksets changes
  if (banksets) maria_read = false;

  return maria_cycles;
}

// ----------------------------------------------------------------------------
// Clear
// ----------------------------------------------------------------------------
//void maria_Clear() {
function maria_Clear() {
  //if (!maria_surface) maria_surface = js_atari_get_blit_addr();
  //for (int index = 0; index < MARIA_SURFACE_SIZE; index++) {
  for (var index = 0; index < MARIA_SURFACE_SIZE; index++) {
    maria_surface[index] = 0;
  }
}

function SetSurface(surface) { 
  maria_surface = surface; 
}

function IsNMI() {
  return nmi;
}

Events.addListener(
  new Events.Listener("onCartridgeLoaded", function(cart) {
    // banksets changes  
    dr = !cart.IsXmEnabled() && !cart.IsBanksets() && cart.GetType() !== cart.CARTRIDGE_TYPE_SOUPER;
    console.log("Maria RAM Direct: " + dr);
    // banksets changes
    banksets = cart.IsBanksets();
    souper = cart.GetType() == Cart.CARTRIDGE_TYPE_SOUPER;
  }));  

export {
  maria_Clear as Clear,
  maria_RenderScanline as RenderScanline,
  maria_Reset as Reset,
  maria_displayArea as displayArea,
  maria_visibleArea as visibleArea,
  IsNMI,
  SetSurface,
  MARIA_CYCLE_LIMIT
}
