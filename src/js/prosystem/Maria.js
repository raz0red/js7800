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

// DMA may not start a new header or byte once this many MARIA clocks have been
// used on a line; reaching it forces WSYNC for the rest of the line.
var MARIA_CYCLE_LIMIT = 430;

// Line timing, in MARIA clocks (one 320-mode pixel each). Active display is the
// last 320 clocks of the 454-clock line.
var MARIA_LINE_CLOCKS = 454;
var MARIA_ACTIVE_START = MARIA_LINE_CLOCKS - 320;

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

// Racing beam: the line built on the previous scanline is shifted out while the
// current one is built, using the color and CTRL registers as they stand when
// the beam reaches each pixel.
var maria_displayBuf = maria_lineRAM_buffers[1];
var maria_beamX = 0;
var maria_rowActive = false;
var maria_rowBase = 0;
// Clock at the start of the instruction being executed (set by ProSystem)
var maria_instrClock = 0;
// DL address of the current zone, latched when its DLL entry is read
var maria_dl = new Pair();
// DMA fetches this line from TIA/RIOT addresses (each stretches the line by 2 clocks)
var maria_slowFetches = 0;
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


// A DMA fetch. MARIA's reads use the same bus as the CPU's: below $0500 they
// reach the TIA/MARIA/RIOT registers and RIOT RAM (undriven TIA bits float to
// the last value on the bus), and every fetch drives the bus.
function maria_DmaRead(address) {
  address &= 0xFFFF;
  var data;
  if (address < 0x500) {
    // TIA/RIOT fetches are slow bus cycles for MARIA too
    if (Memory.IsSlow(Memory.FoldMirror(address))) {
      maria_slowFetches++;
    }
    data = Memory.ReadBus(address);
  } else {
    data = (dr ? ram[address] : ramf(address));
    Memory.SetLastBus(data);
  }
  return data;
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
        // Fix for 320D (playsoft)
        maria_lineRAM[maria_horizontal] = maria_palette;
        // maria_lineRAM[maria_horizontal] = 0;
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
  // A fetch from a DMA hole reads nothing
  var data = maria_IsHolyDMA() ? 0 : maria_DmaRead(maria_pp.getW());
  if (maria_wmode) {
    if (maria_IsHolyDMA()) {
      // #if 0 // Wii: disabled due to rendering in Kangaroo mode
      //       maria_StoreCell(0, 0);
      //       maria_StoreCell(0, 0);
      // #endif
      // A fetch from a DMA hole reads nothing and leaves HPOS where it is
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
      // A fetch from a DMA hole reads nothing and leaves HPOS where it is
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

// ----------------------------------------------------------------------------
// Racing beam
// ----------------------------------------------------------------------------

// Starts a scanline: the line DMA built last scanline becomes the displayed one,
// and the other buffer is cleared for this scanline's DMA. Runs on every line,
// whether or not DMA is enabled.
function maria_StartLine(scanline) {
  maria_displayBuf = maria_lineRAM_buffers[maria_lineRAM_index];
  maria_lineRAM_index ^= 1;
  maria_lineRAM = maria_lineRAM_buffers[maria_lineRAM_index];
  maria_lineRAM.fill(0);
  maria_beamX = 0;
  maria_rowActive = maria_surface !== null &&
    scanline >= maria_visibleArea.top && scanline <= maria_visibleArea.bottom;
  maria_rowBase = (scanline - maria_displayArea.top) * maria_displayArea.GetLength();
}

// Shifts the displayed line out up to line clock clk, applying the read mode,
// color kill and colors as they are now.
function maria_CatchUp(clk) {
  var target = clk - MARIA_ACTIVE_START;
  if (target > 320) target = 320;
  if (target <= maria_beamX) return;
  if (maria_rowActive) {
    var ctrl = ram[CTRL];
    var rmode = ctrl & 3;
    var kill = ctrl & 0x80;
    var buf = maria_displayBuf;
    var base = maria_rowBase;
    for (var x = maria_beamX; x < target; x++) {
      var c = buf[x >> 1];
      var code;
      if (rmode < 2) {
        // 160A/B (modes 0 and 1): both pixels of a cell show its code
        code = c;
      } else if (rmode == 2) {
        // 320B/D
        code = (x & 1) ?
          ((c & 16) | ((c & 4) >>> 2) | ((c & 1) << 1)) :
          ((c & 16) | ((c & 8) >>> 3) | (c & 2));
      } else {
        // 320A/C
        code = (x & 1) ? ((c & 28) | ((c & 1) << 1)) : (c & 30);
      }
      var color = maria_GetColor(code);
      maria_surface[base + x] = kill ? (color & 0x0f) : color;
    }
  }
  maria_beamX = target;
}

// Finishes the displayed line at the end of the scanline.
function maria_EndLine() {
  maria_CatchUp(MARIA_LINE_CLOCKS);
  if (maria_rowActive) {
    var rmode = ram[CTRL] & 3;
    // Apply "composite" smoothing filter...
    if (Cart.IsComposite() && ((rmode == 2) || (rmode == 3))) {
      var buffer = maria_surface;
      var offset = maria_rowBase;
      var lum1 = 0;
      var lum2 = 0;
      var lum3 = buffer[offset + 1] & 0x0f;
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
}

// Called by ProSystem before each instruction with the current line clock.
function maria_SetInstructionClock(clk) {
  maria_instrClock = clk;
}

// A CPU write lands at the end of the instruction doing it.
function maria_WriteClock() {
  return maria_instrClock + (Sally.GetCycles() << 2);
}

// CPU write to a MARIA register (address normalized to $20-$3F), before it is
// stored. Color and CTRL writes take effect at the racing beam.
function maria_RegisterWrite(address, data) {
  var reg = address & 0x1F;
  if (reg == 0x18) {
    // OFFSET: the write loads the live zone line counter
    maria_offset = data;
  } else if ((reg == 0x00 || (reg & 3) != 0 || reg == 0x1C) && ram[address] != data) {
    maria_CatchUp(maria_WriteClock());
  }
}

var basePP = new Pair();

// ----------------------------------------------------------------------------
// StoreLineRAM
// ----------------------------------------------------------------------------
//static inline void maria_StoreLineRAM() {
function maria_StoreLineRAM(firstLine) {
  //for (int index = 0; index < MARIA_LINERAM_SIZE; index++) {
  // for (var index = 0; index < MARIA_LINERAM_SIZE; index++) {
  //   maria_lineRAM[index] = 0;
  // }

  maria_cycles += 16; // Maria cycles (DMA Startup)
  if (firstLine) maria_cycles += 8; // Extra startup on the frame's first DMA line

  // Each header byte is fetched once, byte 1 first (it gives the header's
  // length), and only while there is DMA time left.
  while (maria_cycles < MARIA_CYCLE_LIMIT) {
    //byte mode = memory_ram[maria_dp.w + 1];
    var mode = maria_DmaRead(maria_dp.getW() + 1);
    if (!(mode & 0x5f)) break;

    //byte width;
    var width = 0;
    //byte indirect = 0;
    var indirect = 0;

    //maria_pp.b.l = memory_ram[maria_dp.w];
    maria_pp.setBL(maria_DmaRead(maria_dp.getW()));
    //maria_pp.b.h = memory_ram[maria_dp.w + 2];
    maria_pp.setBH(maria_DmaRead(maria_dp.getW() + 2));

    if (mode & 31) {
      maria_cycles += 8; // Maria cycles (Header 4 byte)
      //maria_palette = (memory_ram[maria_dp.w + 1] & 224) >> 3;
      maria_palette = ((mode & 224) >>> 3) & 0xFF;
      //maria_horizontal = memory_ram[maria_dp.w + 3];
      maria_horizontal = maria_DmaRead(maria_dp.getW() + 3);
      //width = memory_ram[maria_dp.w + 1] & 31;
      width = mode & 31;
      //width = ((~width) & 31) + 1;
      width = (((~width) & 31) + 1) & 0xFF;
      //maria_dp.w += 4;
      maria_dp.wPlusEqual(4);
    }
    else {
      maria_cycles += 10; // Maria cycles (Header 5 byte)
      var palWidth = maria_DmaRead(maria_dp.getW() + 3);
      //maria_palette = (memory_ram[maria_dp.w + 3] & 224) >> 3;
      maria_palette = ((palWidth & 224) >>> 3) & 0xFF;
      //maria_horizontal = memory_ram[maria_dp.w + 4];
      maria_horizontal = maria_DmaRead(maria_dp.getW() + 4);
      //indirect = memory_ram[maria_dp.w + 1] & 32;
      indirect = mode & 32;
      //maria_wmode = memory_ram[maria_dp.w + 1] & 128;
      maria_wmode = mode & 128;
      //width = memory_ram[maria_dp.w + 3] & 31;
      width = palWidth & 31;
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
        maria_pp.setBL(maria_DmaRead(basePP.wPlusPlus()));
        //maria_pp.b.h = memory_ram[CHARBASE] + maria_offset;
        maria_pp.setBH(ram[CHARBASE] + maria_offset);

        if (maria_IsHolyDMA()) {
          // The object's first hole costs as much as a real fetch
          if (!dma_hole_known) {
            maria_cycles += cwidth ? 9 : 6;
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
  }

	// Last Line post-render DMA cycle penalties...
  // (A DLI costs no DMA time)
  if (maria_offset == 0) {
    maria_cycles += 8; // extra shutdown time
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
  maria_lineRAM_index = 0;
  maria_lineRAM = maria_lineRAM_buffers[0];
  maria_displayBuf = maria_lineRAM_buffers[1];
  maria_beamX = 0;
  maria_rowActive = false;
  maria_instrClock = 0;
  maria_dl.setW(0);
  //maria_dpp.w = 0;
  // The DLL pointer the BIOS leaves behind. MARIA only reloads it from DPPH/DPPL
  // when DMA is on at the first DMA line, so a game that enables DMA later in
  // the frame keeps walking from here.
  maria_dpp.setW(0x1FF3);
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
  maria_slowFetches = 0;
  nmi = false;

  // DMA runs only when enabled; the racing beam shows the (cleared) line RAM
  // as background otherwise.
  if ((ram[CTRL] & 96) == 64 && maria_scanline >= maria_displayArea.top && maria_scanline <= maria_displayArea.bottom) {
    if (maria_scanline == maria_displayArea.top) {
      //maria_dpp.b.l = memory_ram[DPPL];
      maria_dpp.setBL(ram[DPPL]);
      //maria_dpp.b.h = memory_ram[DPPH];
      maria_dpp.setBH(ram[DPPH]);
      maria_LoadDLL();
    }

    if (maria_scanline >= maria_displayArea.top && maria_scanline != maria_displayArea.bottom) {
      // The DL address was latched when the zone's DLL entry was read
      maria_dp.copy(maria_dl);

      maria_StoreLineRAM(maria_scanline == maria_displayArea.top);

      if (maria_scanline > maria_displayArea.top) {
        if (maria_offset == 0) {
          //maria_dpp.w += 3;
          maria_dpp.wPlusEqual(3);
          maria_LoadDLL();
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

// Reads the DLL entry at maria_dpp: zone height, DMA holes, DLI flag and the
// zone's DL address (latched for every line of the zone).
function maria_LoadDLL() {
  var mode = maria_DmaRead(maria_dpp.getW());
  maria_h08 = mode & 32;
  maria_h16 = mode & 64;
  maria_offset = mode & 15;
  maria_dl.setBH(maria_DmaRead(maria_dpp.getW() + 1));
  maria_dl.setBL(maria_DmaRead(maria_dpp.getW() + 2));
  if (mode & 128) {
    nmi = true;
  }
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

function GetSlowFetches() {
  return maria_slowFetches;
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
  maria_StartLine as StartLine,
  maria_EndLine as EndLine,
  maria_CatchUp as CatchUp,
  maria_SetInstructionClock as SetInstructionClock,
  maria_RegisterWrite as RegisterWrite,
  IsNMI,
  GetSlowFetches,
  SetSurface,
  MARIA_CYCLE_LIMIT
}
