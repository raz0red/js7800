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
// Sally.cpp
// ----------------------------------------------------------------------------

import * as Memory from "./Memory.js"
import { Pair } from "./Pair.js"
import * as ProSystem from "./ProSystem.js"

var memory_Read = Memory.Read;
var memory_Write = Memory.Write;
var memory_ram = Memory.ram;

var INPT4 = 12;

//byte sally_a = 0;
var sally_a = 0;
//byte sally_x = 0;
var sally_x = 0;
//byte sally_y = 0;
var sally_y = 0;
//byte sally_p = 0;
var sally_p = 0;
//byte sally_s = 0;
var sally_s = 0;

//pair sally_pc = {0};
var sally_pc = new Pair();

//static byte sally_opcode;
var sally_opcode = 0;
//static pair sally_address;
var sally_address = new Pair();
//static uint sally_cycles;
var sally_cycles = 0;

// Whether the last operation resulted in a half cycle. (needs to be taken
// into consideration by ProSystem when cycle counting). This can occur when
// a TIA or RIOT are accessed (drops to 1.19Mhz when the TIA or RIOT chips
// are accessed)
//bool half_cycle = false;
var half_cycle = false; // Global

/*
struct Flag {
  byte C;
  byte Z;
  byte I;
  byte D;
  byte B;
  byte R;
  byte V;
  byte N;
};

static const Flag SALLY_FLAG = {0x01, 0x02, 0x04, 0x08, 0x10, 0x20, 0x40, 0x80};
*/

var SALLY_FLAG = {
  C: 0x01,
  Z: 0x02,
  I: 0x04,
  D: 0x08,
  B: 0x10,
  R: 0x20,
  V: 0x40,
  N: 0x80
}

/*
struct Vector {
  word H;
  word L;
};
*/

//static const Vector SALLY_RES = {65533, 65532};
var SALLY_RES = {
  H: 65533,
  L: 65532
};

//static const Vector SALLY_NMI = {65531, 65530};
var SALLY_NMI = {
  H: 65531,
  L: 65530
};

//static const Vector SALLY_IRQ = {65535, 65534};
var SALLY_IRQ = {
  H: 65535,
  L: 65534
};

//static const byte SALLY_CYCLES[256] = { ... }
var SALLY_CYCLES = [
  7, 6, 0, 0, 2, 3, 5, 0, 3, 2, 2, 2 /* ANC */, 0, 4, 6, 0, // 0 - 15
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 16 - 31
  6, 6, 0, 0, 3, 3, 5, 0, 4, 2, 2, 2 /* ANC */, 4, 4, 6, 0, // 32 - 47
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 48 - 63
  6, 6, 0, 0, 0, 3, 5, 0, 3, 2, 2, 2 /* ALR (ASR) */, 3, 4, 6, 0, // 64 - 79
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 80 - 95
  6, 6, 0, 0, 0, 3, 5, 0, 4, 2, 2, 0, 5, 4, 6, 0, // 96 - 111
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 112 - 127
  2, 6, 0, 0, 3, 3, 3, 0, 2, 0, 2, 0, 4, 4, 4, 0, // 128 - 143
  2, 6, 0, 0, 4, 4, 4, 4 /* SAX */, 2, 5, 2, 0, 0, 5, 0, 0, // 144 - 159
  2, 6, 2, 0, 3, 3, 3, 0, 2, 2, 2, 0, 4, 4, 4, 0, // 160 - 175
  2, 5, 0, 6 /* LAX */, 4, 4, 4, 0, 2, 4, 2, 0, 4, 4, 4, 0, // 176 - 191
  2, 6, 0, 0, 3, 3, 5, 0, 2, 2, 2, 0, 4, 4, 6, 0, // 192 - 207
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 208 - 223
  2, 6, 0, 0, 3, 3, 5, 0, 2, 2, 2, 0, 4, 4, 6, 0, // 222 - 239
  2, 5, 0, 0, 0, 4, 6, 0, 2, 4, 0, 0, 0, 4, 7, 0, // 240 - 255
];

/*
  * Checks to see if the High Score ROM has been accessed via known entry
  * points. This is necessary due to the fact that some ROMs (Xenophobe, etc.)
  * overwrite SRAM of the high score cart. In such cases, they don't ever
  * access the high score cartridge. By setting a flag, we know when to persist
  * changes to SRAM
  */
/*
function sally_checkHighScoreSet() {
  //if( sally_pc.w == 0x3fcf || sally_pc.w == 0x3ffd )
  if (sally_pc.getW() == 0x3fcf || sally_pc.getW() == 0x3ffd) {
    high_score_set = true;
  }
}
*/

// ----------------------------------------------------------------------------
// Push
// ----------------------------------------------------------------------------
function sally_Push(data) {
  memory_Write((sally_s + 256) & 0xFFFF, data);
  //sally_s--;
  sally_s = (sally_s - 1) & 0xFF;
}

// ----------------------------------------------------------------------------
// Pop
// ----------------------------------------------------------------------------
function sally_Pop() {
  //sally_s++;
  sally_s = (sally_s + 1) & 0xFF;
  return memory_Read((sally_s + 256) & 0xFFFF);
}

// ----------------------------------------------------------------------------
// Flags
// ----------------------------------------------------------------------------
function sally_Flags(data) {
  if (!data) {
    sally_p |= SALLY_FLAG.Z;
  }
  else {
    //sally_p &= ~SALLY_FLAG.Z;
    sally_p = (sally_p & ~SALLY_FLAG.Z) & 0xFF;
  }
  if (data & 128) {
    sally_p |= SALLY_FLAG.N;
  }
  else {
    //sally_p &= ~SALLY_FLAG.N;
    sally_p = (sally_p & ~SALLY_FLAG.N) & 0xFF;
  }
}

var temp = new Pair();

// ----------------------------------------------------------------------------
// Branch
// ----------------------------------------------------------------------------
function sally_Branch(branch) {
  if (branch) {
    //pair temp = sally_pc;
    //var temp = sally_pc.clone();
    temp.copy(sally_pc);
    //sally_pc.w += (signed char)sally_address.b.l;
    sally_pc.wPlusEqual(sally_address.getBLSigned());
    //if (temp.b.h != sally_pc.b.h) {
    if (temp.getBH() != sally_pc.getBH()) {
      sally_cycles += 2;
    }
    else {
      sally_cycles++;
    }
  }
}

var address1 = new Pair();
var address2 = new Pair();

// ----------------------------------------------------------------------------
// Delay
// ----------------------------------------------------------------------------
function sally_Delay(delta) {
  //pair address1 = sally_address;
  //var address1 = sally_address.clone();
  address1.copy(sally_address);
  //pair address2 = sally_address;
  //var address2 = sally_address.clone();
  address2.copy(sally_address);
  //address1.w -= delta;
  address1.wMinusEqual(delta);
  //if(address1.b.h != address2.b.h) {
  if (address1.getBH() != address2.getBH()) {
    sally_cycles++;
  }
}

// ----------------------------------------------------------------------------
// Absolute
// ----------------------------------------------------------------------------
function sally_Absolute() {
  //sally_address.b.l = memory_Read(sally_pc.w++);
  sally_address.setBL(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.h = memory_Read(sally_pc.w++);
  sally_address.setBH(memory_Read(sally_pc.wPlusPlus()));
}

// ----------------------------------------------------------------------------
// AbsoluteX
// ----------------------------------------------------------------------------
function sally_AbsoluteX() {
  //sally_address.b.l = memory_Read(sally_pc.w++);
  sally_address.setBL(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.h = memory_Read(sally_pc.w++);
  sally_address.setBH(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.w += sally_x;
  sally_address.wPlusEqual(sally_x);
}

// ----------------------------------------------------------------------------
// AbsoluteY
// ----------------------------------------------------------------------------
function sally_AbsoluteY() {
  //sally_address.b.l = memory_Read(sally_pc.w++);
  sally_address.setBL(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.h = memory_Read(sally_pc.w++);
  sally_address.setBH(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.w += sally_y;
  sally_address.wPlusEqual(sally_y);
}

// ----------------------------------------------------------------------------
// Immediate
// ----------------------------------------------------------------------------
function sally_Immediate() {
  //sally_address.w = sally_pc.w++;
  sally_address.setW(sally_pc.wPlusPlus());
}

// ----------------------------------------------------------------------------
// Indirect
// ----------------------------------------------------------------------------
function sally_Indirect() {
  //pair base;
  var base = new Pair();
  //base.b.l = memory_Read(sally_pc.w++);
  base.setBL(memory_Read(sally_pc.wPlusPlus()));
  //base.b.h = memory_Read(sally_pc.w++);
  base.setBH(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.l = memory_Read(base.w);
  sally_address.setBL(memory_Read(base.getW()));
  //sally_address.b.h = memory_Read(base.w + 1);
  sally_address.setBH(memory_Read(base.getW() + 1));
}

// ----------------------------------------------------------------------------
// IndirectX
// ----------------------------------------------------------------------------
function sally_IndirectX() {
  //sally_address.b.l = memory_Read(sally_pc.w++) + sally_x;
  sally_address.setBL(memory_Read(sally_pc.wPlusPlus()) + sally_x);
  //sally_address.b.h = memory_Read(sally_address.b.l + 1);
  sally_address.setBH(memory_Read(sally_address.getBL() + 1));
  //sally_address.b.l = memory_Read(sally_address.b.l);
  sally_address.setBL(memory_Read(sally_address.getBL()));
}

// ----------------------------------------------------------------------------
// IndirectY
// ----------------------------------------------------------------------------
function sally_IndirectY() {
  //sally_address.b.l = memory_Read(sally_pc.w++);
  sally_address.setBL(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.h = memory_Read(sally_address.b.l + 1);
  sally_address.setBH(memory_Read(sally_address.getBL() + 1));
  //sally_address.b.l = memory_Read(sally_address.b.l);
  sally_address.setBL(memory_Read(sally_address.getBL()));
  //sally_address.w += sally_y;
  sally_address.wPlusEqual(sally_y);
}

// ----------------------------------------------------------------------------
// Relative
// ----------------------------------------------------------------------------
function sally_Relative() {
  //sally_address.w = memory_Read(sally_pc.w++);
  sally_address.setW(memory_Read(sally_pc.wPlusPlus()));
}

// ----------------------------------------------------------------------------
// Zero Page
// ----------------------------------------------------------------------------
function sally_ZeroPage() {
  //sally_address.w = memory_Read(sally_pc.w++);
  sally_address.setW(memory_Read(sally_pc.wPlusPlus()));
}

// ----------------------------------------------------------------------------
// ZeroPageX
// ----------------------------------------------------------------------------
function sally_ZeroPageX() {
  //sally_address.w = memory_Read(sally_pc.w++);
  sally_address.setW(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.l += sally_x;
  sally_address.blPlusEqual(sally_x);
}

// ----------------------------------------------------------------------------
// ZeroPageY
// ----------------------------------------------------------------------------
function sally_ZeroPageY() {
  //sally_address.w = memory_Read(sally_pc.w++);
  sally_address.setW(memory_Read(sally_pc.wPlusPlus()));
  //sally_address.b.l += sally_y;
  sally_address.blPlusEqual(sally_y);
}

// ----------------------------------------------------------------------------
// ADC
// ----------------------------------------------------------------------------
function sally_ADC() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (sally_p & SALLY_FLAG.D) {
    //word al = (sally_a & 15) + (data & 15) + (sally_p & SALLY_FLAG.C);
    var al = ((sally_a & 15) + (data & 15) + (sally_p & SALLY_FLAG.C)) & 0xFFFF;
    //word ah = (sally_a >> 4) + (data >> 4);
    var ah = ((sally_a >>> 4) + (data >>> 4)) & 0xFFFF;

    if (al > 9) {
      //al += 6;
      al = (al + 6) & 0xFFFF;
      //ah++;
      ah = (ah + 1) & 0xFFFF;
    }

    // Set Z flag properly in decimal mode
    // Diagnosed by RevEng
    // The 6502 Z flag doesn't seem to understand decimal mode, so it gets set
    // as if you had added things without decimal mode enabled,
    // where $55+$AB=$00. So A7800 and visual 6502 both set Z,
    // but unfortunately z is clear in JS7800.
    //
    // banksets changes
    var ztemp = new Pair();
    ztemp.setW(sally_a + data + (sally_p & SALLY_FLAG.C));
    if (!ztemp.getBL()) {
      sally_p |= SALLY_FLAG.Z;
    }
    else {
      //sally_p &= ~SALLY_FLAG.Z;
      sally_p = (sally_p & ~SALLY_FLAG.Z) & 0xFF;
    }

    /*
    if (!(sally_a + data + (sally_p & SALLY_FLAG.C))) {
      sally_p |= SALLY_FLAG.Z;
    }
    else {
      //sally_p &= ~SALLY_FLAG.Z;
      sally_p = (sally_p & ~SALLY_FLAG.Z) & 0xFF;
    }
    */

    if ((ah & 8) != 0) {
      sally_p |= SALLY_FLAG.N;
    }
    else {
      //sally_p &= ~SALLY_FLAG.N;
      sally_p = (sally_p & ~SALLY_FLAG.N) & 0xFF;
    }

    if (~(sally_a ^ data) & ((ah << 4) ^ sally_a) & 128) {
      sally_p |= SALLY_FLAG.V;
    }
    else {
      //sally_p &= ~SALLY_FLAG.V;
      sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
    }

    if (ah > 9) {
      //ah += 6;
      ah = (ah + 6) & 0xFFFF;
    }

    if (ah > 15) {
      sally_p |= SALLY_FLAG.C;
    }
    else {
      //sally_p &= ~SALLY_FLAG.C;
      sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
    }

    //sally_a = (ah << 4) | (al & 15);
    sally_a = ((ah << 4) | (al & 15)) & 0xFF;
  }
  else {
    //pair temp;
    var temp = new Pair();
    //temp.w = sally_a + data + (sally_p & SALLY_FLAG.C);
    temp.setW(sally_a + data + (sally_p & SALLY_FLAG.C));

    //if(temp.b.h) {
    if (temp.getBH()) {
      sally_p |= SALLY_FLAG.C;
    }
    else {
      //sally_p &= ~SALLY_FLAG.C;
      sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
    }

    //if(~(sally_a ^ data) & (sally_a ^ temp.b.l) & 128) {
    if (~(sally_a ^ data) & (sally_a ^ temp.getBL()) & 128) {
      sally_p |= SALLY_FLAG.V;
    }
    else {
      //sally_p &= ~SALLY_FLAG.V;
      sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
    }

    //sally_Flags(temp.b.l);
    sally_Flags(temp.getBL());
    //sally_a = temp.b.l;
    sally_a = temp.getBL();
  }
}

// ----------------------------------------------------------------------------
// AND
// ----------------------------------------------------------------------------
function sally_AND() {
  //sally_a &= memory_Read(sally_address.w);
  sally_a &= memory_Read(sally_address.getW());
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// ASLA
// ----------------------------------------------------------------------------
function sally_ASLA() {
  if (sally_a & 128) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //sally_a <<= 1;
  sally_a = (sally_a << 1) & 0xFF;
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// ASL
// ----------------------------------------------------------------------------
function sally_ASL() {

  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (data & 128) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //data <<= 1;
  data = (data << 1) & 0xFF;
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// BCC
// ----------------------------------------------------------------------------
function sally_BCC() {
  sally_Branch(!(sally_p & SALLY_FLAG.C));
}

// ----------------------------------------------------------------------------
// BCS
// ----------------------------------------------------------------------------
function sally_BCS() {
  sally_Branch(sally_p & SALLY_FLAG.C);
}

// ----------------------------------------------------------------------------
// BEQ
// ----------------------------------------------------------------------------
function sally_BEQ() {
  sally_Branch(sally_p & SALLY_FLAG.Z);
}

// ----------------------------------------------------------------------------
// BIT
// ----------------------------------------------------------------------------
function sally_BIT() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (!(data & sally_a)) {
    sally_p |= SALLY_FLAG.Z;
  }
  else {
    //sally_p &= ~SALLY_FLAG.Z;
    sally_p = (sally_p & ~SALLY_FLAG.Z) & 0xFF;
  }

  //sally_p &= ~SALLY_FLAG.V;
  sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
  //sally_p &= ~SALLY_FLAG.N;
  sally_p = (sally_p & ~SALLY_FLAG.N) & 0xFF;
  sally_p |= data & 64;
  sally_p |= data & 128;
}

// ----------------------------------------------------------------------------
// BMI
// ----------------------------------------------------------------------------
function sally_BMI() {
  sally_Branch(sally_p & SALLY_FLAG.N);
}

// ----------------------------------------------------------------------------
// BNE
// ----------------------------------------------------------------------------
function sally_BNE() {
  sally_Branch(!(sally_p & SALLY_FLAG.Z));
}

// ----------------------------------------------------------------------------
// BPL
// ----------------------------------------------------------------------------
function sally_BPL() {
  sally_Branch(!(sally_p & SALLY_FLAG.N));
}

// ----------------------------------------------------------------------------
// BRK
// ----------------------------------------------------------------------------
function sally_BRK() {
  //sally_pc.w++;
  sally_pc.wPlusPlus();
  sally_p |= SALLY_FLAG.B;

  //sally_Push(sally_pc.b.h);
  sally_Push(sally_pc.getBH());
  //sally_Push(sally_pc.b.l);
  sally_Push(sally_pc.getBL());
  sally_Push(sally_p);

  sally_p |= SALLY_FLAG.I;
  //sally_pc.b.l = memory_ram[SALLY_IRQ.L];
  sally_pc.setBL(memory_ram[SALLY_IRQ.L]);
  //sally_pc.b.h = memory_ram[SALLY_IRQ.H];
  sally_pc.setBH(memory_ram[SALLY_IRQ.H]);
}

// ----------------------------------------------------------------------------
// BVC
// ----------------------------------------------------------------------------
function sally_BVC() {
  sally_Branch(!(sally_p & SALLY_FLAG.V));
}

// ----------------------------------------------------------------------------
// BVS
// ----------------------------------------------------------------------------
function sally_BVS() {
  sally_Branch(sally_p & SALLY_FLAG.V);
}

// ----------------------------------------------------------------------------
// CLC
// ----------------------------------------------------------------------------
function sally_CLC() {
  //sally_p &= ~SALLY_FLAG.C;
  sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
}

// ----------------------------------------------------------------------------
// CLD
// ----------------------------------------------------------------------------
function sally_CLD() {
  //sally_p &= ~SALLY_FLAG.D;
  sally_p = (sally_p & ~SALLY_FLAG.D) & 0xFF;
}

// ----------------------------------------------------------------------------
// CLI
// ----------------------------------------------------------------------------
function sally_CLI() {
  //sally_p &= ~SALLY_FLAG.I;
  sally_p = (sally_p & ~SALLY_FLAG.I) & 0xFF;
}

// ----------------------------------------------------------------------------
// CLV
// ----------------------------------------------------------------------------
function sally_CLV() {
  //sally_p &= ~SALLY_FLAG.V;
  sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
}

// ----------------------------------------------------------------------------
// CMP
// ----------------------------------------------------------------------------
function sally_CMP() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (sally_a >= data) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;

  }

  //sally_Flags(sally_a - data);
  sally_Flags((sally_a - data) & 0xFF);
}

// ----------------------------------------------------------------------------
// CPX
// ----------------------------------------------------------------------------
function sally_CPX() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (sally_x >= data) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //sally_Flags(sally_x - data);
  sally_Flags((sally_x - data) & 0xFF);
}

// ----------------------------------------------------------------------------
// CPY
// ----------------------------------------------------------------------------
function sally_CPY() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (sally_y >= data) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //sally_Flags(sally_y - data);
  sally_Flags((sally_y - data) & 0xFF);
}

// ----------------------------------------------------------------------------
// DEC
// ----------------------------------------------------------------------------
function sally_DEC() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());
  //memory_Write(sally_address.w, --data);
  data = ((data - 1) & 0xFF);
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// DEX
// ----------------------------------------------------------------------------
function sally_DEX() {
  //sally_Flags(--sally_x);
  sally_x = (sally_x - 1) & 0xFF;
  sally_Flags(sally_x);
}

// ----------------------------------------------------------------------------
// DEY
// ----------------------------------------------------------------------------
function sally_DEY() {
  //sally_Flags(--sally_y);
  sally_y = (sally_y - 1) & 0xFF;
  sally_Flags(sally_y);
}

// ----------------------------------------------------------------------------
// EOR
// ----------------------------------------------------------------------------
function sally_EOR() {
  //sally_a ^= memory_Read(sally_address.w);
  sally_a ^= memory_Read(sally_address.getW());
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// INC
// ----------------------------------------------------------------------------
function sally_INC() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());
  //memory_Write(sally_address.w, ++data);
  data = (data + 1) & 0xFF;
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// INX
// ----------------------------------------------------------------------------
function sally_INX() {
  //sally_Flags(++sally_x);
  sally_x = (sally_x + 1) & 0xFF;
  sally_Flags(sally_x);
}

// ----------------------------------------------------------------------------
// INY
// ----------------------------------------------------------------------------
function sally_INY() {
  // sally_Flags(++sally_y);
  sally_y = (sally_y + 1) & 0xFF;
  sally_Flags(sally_y);
}

// ----------------------------------------------------------------------------
// JMP
// ----------------------------------------------------------------------------
function sally_JMP() {
  //sally_pc = sally_address;
  //sally_pc = sally_address.clone();
  sally_pc.copy(sally_address);

  // Check for known entry point of high score ROM
//    sally_checkHighScoreSet();
}

// ----------------------------------------------------------------------------
// JSR
// ----------------------------------------------------------------------------
function sally_JSR() {
  //sally_pc.w--;
  sally_pc.wMinusMinus();
  //sally_Push(sally_pc.b.h);
  sally_Push(sally_pc.getBH());
  //sally_Push(sally_pc.b.l);
  sally_Push(sally_pc.getBL());

  //sally_pc = sally_address;
  //sally_pc = sally_address.clone();
  sally_pc.copy(sally_address);

  // Check for known entry point of high score ROM
//    sally_checkHighScoreSet();
}

// ----------------------------------------------------------------------------
// LDA
// ----------------------------------------------------------------------------
function sally_LDA() {
  //sally_a = memory_Read(sally_address.w);
  sally_a = memory_Read(sally_address.getW());
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// LDX
// ----------------------------------------------------------------------------
function sally_LDX() {
  //sally_x = memory_Read(sally_address.w);
  sally_x = memory_Read(sally_address.getW());
  sally_Flags(sally_x);
}

// ----------------------------------------------------------------------------
// LDY
// ----------------------------------------------------------------------------
function sally_LDY() {
  //sally_y = memory_Read(sally_address.w);
  sally_y = memory_Read(sally_address.getW());
  sally_Flags(sally_y);
}

// ----------------------------------------------------------------------------
// LSRA
// ----------------------------------------------------------------------------
function sally_LSRA() {
  //sally_p &= ~SALLY_FLAG.C;
  sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  sally_p |= sally_a & 1;

  //sally_a >>>= 1;
  sally_a = (sally_a >>> 1) & 0xFF;
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// LSR
// ----------------------------------------------------------------------------
function sally_LSR() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  //sally_p &= ~SALLY_FLAG.C;
  sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  sally_p |= data & 1;

  //data >>>= 1;
  data = (data >>> 1) & 0xFF;
  //memory_Write(sally_address.w, data);
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// NOP
// ----------------------------------------------------------------------------
function sally_NOP() {
}

// ----------------------------------------------------------------------------
// ORA
// ----------------------------------------------------------------------------
function sally_ORA() {
  //sally_a |= memory_Read(sally_address.w);
  sally_a |= memory_Read(sally_address.getW());
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// PHA
// ----------------------------------------------------------------------------
function sally_PHA() {
  sally_Push(sally_a);
}

// ----------------------------------------------------------------------------
// PHP
// ----------------------------------------------------------------------------
function sally_PHP() {
  //var tmp = sally_p;
  //tmp |= SALLY_FLAG.B;
  //sally_Push(tmp);

  // Diagnosed by RevEng
  // Software instructions BRK & PHP will push the B flag as being 1
  // banksets changes
  sally_p |= SALLY_FLAG.B;
  sally_Push(sally_p);
}

// ----------------------------------------------------------------------------
// PLA
// ----------------------------------------------------------------------------
function sally_PLA() {
  sally_a = sally_Pop();
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// PLP
// ----------------------------------------------------------------------------
function sally_PLP() {
  sally_p = sally_Pop();
}

// ----------------------------------------------------------------------------
// ROLA
// ----------------------------------------------------------------------------
function sally_ROLA() {
  //byte temp = sally_p;
  var temp = sally_p;

  if (sally_a & 128) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //sally_a <<= 1;
  sally_a = (sally_a << 1) & 0xFF;
  sally_a |= temp & SALLY_FLAG.C;
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// ROL
// ----------------------------------------------------------------------------
function sally_ROL() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());
  //byte temp = sally_p;
  var temp = sally_p;

  if (data & 128) {
    sally_p |= SALLY_FLAG.C;
  }
  else {
    //sally_p &= ~SALLY_FLAG.C;
    sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  }

  //data <<= 1;
  data = (data << 1) & 0xFF;
  data |= temp & 1;
  //memory_Write(sally_address.w, data);
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// RORA
// ----------------------------------------------------------------------------
function sally_RORA() {
  //byte temp = sally_p;
  var temp = sally_p;

  //sally_p &= ~SALLY_FLAG.C;
  sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  sally_p |= sally_a & 1;

  //sally_a >>>= 1;
  sally_a = (sally_a >>> 1) & 0xFF;
  if (temp & SALLY_FLAG.C) {
    sally_a |= 128;
  }

  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// ROR
// ----------------------------------------------------------------------------
function sally_ROR() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());
  //byte temp = sally_p;
  var temp = sally_p;

  //sally_p &= ~SALLY_FLAG.C;
  sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
  sally_p |= data & 1;

  //data >>>= 1;
  data = (data >>> 1) & 0xFF;
  if (temp & 1) {
    data |= 128;
  }

  //memory_Write(sally_address.w, data);
  memory_Write(sally_address.getW(), data);
  sally_Flags(data);
}

// ----------------------------------------------------------------------------
// RTI
// ----------------------------------------------------------------------------
function sally_RTI() {
  sally_p = sally_Pop();
  //sally_pc.b.l = sally_Pop();
  sally_pc.setBL(sally_Pop());
  //sally_pc.b.h = sally_Pop();
  sally_pc.setBH(sally_Pop());
}

// ----------------------------------------------------------------------------
// RTS
// ----------------------------------------------------------------------------
function sally_RTS() {
  //sally_pc.b.l = sally_Pop();
  sally_pc.setBL(sally_Pop());
  //sally_pc.b.h = sally_Pop();
  sally_pc.setBH(sally_Pop());
  //sally_pc.w++;
  sally_pc.wPlusPlus();
}

// // ----------------------------------------------------------------------------
// SBC
// ----------------------------------------------------------------------------
function sally_SBC() {
  //byte data = memory_Read(sally_address.w);
  var data = memory_Read(sally_address.getW());

  if (sally_p & SALLY_FLAG.D) {
    // Set Z flag properly in decimal mode
    // Diagnosed by RevEng
    // The 6502 Z flag doesn't seem to understand decimal mode, so it gets set
    // as if you had added things without decimal mode enabled,
    // where $55+$AB=$00. So A7800 and visual 6502 both set Z,
    // but unfortunately z is clear in JS7800.
    // banksets changes
    var ztemp = new Pair();
    ztemp.setW(sally_a - data - !(sally_p & SALLY_FLAG.C));

    //word al = (sally_a & 15) - (data & 15) - !(sally_p & SALLY_FLAG.C);
    var al = ((sally_a & 15) - (data & 15) - !(sally_p & SALLY_FLAG.C)) & 0xFFFF;
    //word ah = (sally_a >> 4) - (data >> 4);
    var ah = ((sally_a >>> 4) - (data >>> 4)) & 0xFFFF;

    if (al > 9) {
      //al -= 6;
      al = (al - 6) & 0xFFFF;
      //ah--;
      ah = (ah - 1) & 0xFFFF;
    }

    if (ah > 9) {
      //ah -= 6;
      ah = (ah - 6) & 0xFFFF;
    }

    //pair temp;
    var temp = new Pair();
    //temp.w = sally_a - data - !(sally_p & SALLY_FLAG.C);
    temp.setW(sally_a - data - !(sally_p & SALLY_FLAG.C));

    //if(!temp.b.h) {
    if (!temp.getBH()) {
      sally_p |= SALLY_FLAG.C;
    }
    else {
      //sally_p &= ~SALLY_FLAG.C;
      sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
    }

    //if((sally_a ^ data) & (sally_a ^ temp.b.l) & 128) {
    if ((sally_a ^ data) & (sally_a ^ temp.getBL()) & 128) {
      sally_p |= SALLY_FLAG.V;
    }
    else {
      //sally_p &= ~SALLY_FLAG.V;
      sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
    }

    //sally_Flags(temp.b.l);
    sally_Flags(temp.getBL());

    // Z flag
    // banksets changes
    if (!ztemp.getBL()) {
      sally_p |= SALLY_FLAG.Z;
    }
    else {
      //sally_p &= ~SALLY_FLAG.Z;
      sally_p = (sally_p & ~SALLY_FLAG.Z) & 0xFF;
    }

    //sally_a = (ah << 4) | (al & 15);
    sally_a = ((ah << 4) | (al & 15)) & 0xFF;
  }
  else {
    //pair temp;
    var temp = new Pair();
    //temp.w = sally_a - data - !(sally_p & SALLY_FLAG.C);
    temp.setW(sally_a - data - !(sally_p & SALLY_FLAG.C));

    //if(!temp.b.h) {
    if (!temp.getBH()) {
      sally_p |= SALLY_FLAG.C;
    }
    else {
      //sally_p &= ~SALLY_FLAG.C;
      sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
    }

    //if((sally_a ^ data) & (sally_a ^ temp.b.l) & 128) {
    if ((sally_a ^ data) & (sally_a ^ temp.getBL()) & 128) {
      sally_p |= SALLY_FLAG.V;
    }
    else {
      //sally_p &= ~SALLY_FLAG.V;
      sally_p = (sally_p & ~SALLY_FLAG.V) & 0xFF;
    }

    //sally_Flags(temp.b.l);
    sally_Flags(temp.getBL());
    //sally_a = temp.b.l;
    sally_a = temp.getBL();
  }
}

// ----------------------------------------------------------------------------
// SEC
// ----------------------------------------------------------------------------
function sally_SEC() {
  sally_p |= SALLY_FLAG.C;
}

// ----------------------------------------------------------------------------
// SED
// ----------------------------------------------------------------------------
function sally_SED() {
  sally_p |= SALLY_FLAG.D;
}

// ----------------------------------------------------------------------------
// SEI
// ----------------------------------------------------------------------------
function sally_SEI() {
  sally_p |= SALLY_FLAG.I;
}

// ----------------------------------------------------------------------------
// STA
// ----------------------------------------------------------------------------
function sally_STA() {
  //memory_Write(sally_address.w, sally_a);
  memory_Write(sally_address.getW(), sally_a);
  if (sally_address.getW() < 0) {
    console.error("sally_STA: %d, %d", sally_address.getW(), sally_a);
    HALT = true;
  }
}

// ----------------------------------------------------------------------------
// STX
// ----------------------------------------------------------------------------
function sally_stx() {
  //memory_Write(sally_address.w, sally_x);
  memory_Write(sally_address.getW(), sally_x);
}

// ----------------------------------------------------------------------------
// STY
// ----------------------------------------------------------------------------
function sally_STY() {
  //memory_Write(sally_address.w, sally_y);
  memory_Write(sally_address.getW(), sally_y);
}

// ----------------------------------------------------------------------------
// TAX
// ----------------------------------------------------------------------------
function sally_TAX() {
  sally_x = sally_a;
  sally_Flags(sally_x);
}

// ----------------------------------------------------------------------------
// TAY
// ----------------------------------------------------------------------------
function sally_TAY() {
  sally_y = sally_a;
  sally_Flags(sally_y);
}

// ----------------------------------------------------------------------------
// TSX
// ----------------------------------------------------------------------------
function sally_TSX() {
  sally_x = sally_s;
  sally_Flags(sally_x);
}

// ----------------------------------------------------------------------------
// TXA
// ----------------------------------------------------------------------------
function sally_TXA() {
  sally_a = sally_x;
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// TXS
// ----------------------------------------------------------------------------
function sally_TXS() {
  sally_s = sally_x;
}

// ----------------------------------------------------------------------------
// TYA
// ----------------------------------------------------------------------------
function sally_TYA() {
  sally_a = sally_y;
  sally_Flags(sally_a);
}

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
function sally_Reset() {
  sally_a = 0;
  sally_x = 0;
  sally_y = 0;
  sally_p = SALLY_FLAG.R;
  sally_s = 0;
  //sally_pc.w = 0;
  sally_pc.setW(0);

  sally_debug_count = 0; // 100;
}

var sally_debug_count = 0; //100;

// ----------------------------------------------------------------------------
// ExecuteInstruction
// ----------------------------------------------------------------------------
function sally_ExecuteInstruction() {
  /*
    __label__
  l_0x00, l_0x01, l_0x02, l_0x03, l_0x04, l_0x05, l_0x06, l_0x07, l_0x08,
  l_0x09, l_0x0a, l_0x0b, l_0x0c, l_0x0d, l_0x0e, l_0x0f, l_0x10, l_0x11,
  l_0x12, l_0x13, l_0x14, l_0x15, l_0x16, l_0x17, l_0x18, l_0x19, l_0x1a,
  l_0x1b, l_0x1c, l_0x1d, l_0x1e, l_0x1f, l_0x20, l_0x21, l_0x22, l_0x23,
  l_0x24, l_0x25, l_0x26, l_0x27, l_0x28, l_0x29, l_0x2a, l_0x2b, l_0x2c,
  l_0x2d, l_0x2e, l_0x2f, l_0x30, l_0x31, l_0x32, l_0x33, l_0x34, l_0x35,
  l_0x36, l_0x37, l_0x38, l_0x39, l_0x3a, l_0x3b, l_0x3c, l_0x3d, l_0x3e,
  l_0x3f, l_0x40, l_0x41, l_0x42, l_0x43, l_0x44, l_0x45, l_0x46, l_0x47,
  l_0x48, l_0x49, l_0x4a, l_0x4b, l_0x4c, l_0x4d, l_0x4e, l_0x4f, l_0x50,
  l_0x51, l_0x52, l_0x53, l_0x54, l_0x55, l_0x56, l_0x57, l_0x58, l_0x59,
  l_0x5a, l_0x5b, l_0x5c, l_0x5d, l_0x5e, l_0x5f, l_0x60, l_0x61, l_0x62,
  l_0x63, l_0x64, l_0x65, l_0x66, l_0x67, l_0x68, l_0x69, l_0x6a, l_0x6b,
  l_0x6c, l_0x6d, l_0x6e, l_0x6f, l_0x70, l_0x71, l_0x72, l_0x73, l_0x74,
  l_0x75, l_0x76, l_0x77, l_0x78, l_0x79, l_0x7a, l_0x7b, l_0x7c, l_0x7d,
  l_0x7e, l_0x7f, l_0x80, l_0x81, l_0x82, l_0x83, l_0x84, l_0x85, l_0x86,
  l_0x87, l_0x88, l_0x89, l_0x8a, l_0x8b, l_0x8c, l_0x8d, l_0x8e, l_0x8f,
  l_0x90, l_0x91, l_0x92, l_0x93, l_0x94, l_0x95, l_0x96, l_0x97, l_0x98,
  l_0x99, l_0x9a, l_0x9b, l_0x9c, l_0x9d, l_0x9e, l_0x9f, l_0xa0, l_0xa1,
  l_0xa2, l_0xa3, l_0xa4, l_0xa5, l_0xa6, l_0xa7, l_0xa8, l_0xa9, l_0xaa,
  l_0xab, l_0xac, l_0xad, l_0xae, l_0xaf, l_0xb0, l_0xb1, l_0xb2, l_0xb3,
  l_0xb4, l_0xb5, l_0xb6, l_0xb7, l_0xb8, l_0xb9, l_0xba, l_0xbb, l_0xbc,
  l_0xbd, l_0xbe, l_0xbf, l_0xc0, l_0xc1, l_0xc2, l_0xc3, l_0xc4, l_0xc5,
  l_0xc6, l_0xc7, l_0xc8, l_0xc9, l_0xca, l_0xcb, l_0xcc, l_0xcd, l_0xce,
  l_0xcf, l_0xd0, l_0xd1, l_0xd2, l_0xd3, l_0xd4, l_0xd5, l_0xd6, l_0xd7,
  l_0xd8, l_0xd9, l_0xda, l_0xdb, l_0xdc, l_0xdd, l_0xde, l_0xdf, l_0xe0,
  l_0xe1, l_0xe2, l_0xe3, l_0xe4, l_0xe5, l_0xe6, l_0xe7, l_0xe8, l_0xe9,
  l_0xea, l_0xeb, l_0xec, l_0xed, l_0xee, l_0xef, l_0xf0, l_0xf1, l_0xf2,
  l_0xf3, l_0xf4, l_0xf5, l_0xf6, l_0xf7, l_0xf8, l_0xf9, l_0xfa, l_0xfb,
  l_0xfc, l_0xfd, l_0xfe, l_0xff;

      static const void* const a_jump_table[256] = {
  &&l_0x00, &&l_0x01, &&l_0x02, &&l_0x03, &&l_0x04, &&l_0x05, &&l_0x06, &&l_0x07, &&l_0x08,
  &&l_0x09, &&l_0x0a, &&l_0x0b, &&l_0x0c, &&l_0x0d, &&l_0x0e, &&l_0x0f, &&l_0x10, &&l_0x11,
  &&l_0x12, &&l_0x13, &&l_0x14, &&l_0x15, &&l_0x16, &&l_0x17, &&l_0x18, &&l_0x19, &&l_0x1a,
  &&l_0x1b, &&l_0x1c, &&l_0x1d, &&l_0x1e, &&l_0x1f, &&l_0x20, &&l_0x21, &&l_0x22, &&l_0x23,
  &&l_0x24, &&l_0x25, &&l_0x26, &&l_0x27, &&l_0x28, &&l_0x29, &&l_0x2a, &&l_0x2b, &&l_0x2c,
  &&l_0x2d, &&l_0x2e, &&l_0x2f, &&l_0x30, &&l_0x31, &&l_0x32, &&l_0x33, &&l_0x34, &&l_0x35,
  &&l_0x36, &&l_0x37, &&l_0x38, &&l_0x39, &&l_0x3a, &&l_0x3b, &&l_0x3c, &&l_0x3d, &&l_0x3e,
  &&l_0x3f, &&l_0x40, &&l_0x41, &&l_0x42, &&l_0x43, &&l_0x44, &&l_0x45, &&l_0x46, &&l_0x47,
  &&l_0x48, &&l_0x49, &&l_0x4a, &&l_0x4b, &&l_0x4c, &&l_0x4d, &&l_0x4e, &&l_0x4f, &&l_0x50,
  &&l_0x51, &&l_0x52, &&l_0x53, &&l_0x54, &&l_0x55, &&l_0x56, &&l_0x57, &&l_0x58, &&l_0x59,
  &&l_0x5a, &&l_0x5b, &&l_0x5c, &&l_0x5d, &&l_0x5e, &&l_0x5f, &&l_0x60, &&l_0x61, &&l_0x62,
  &&l_0x63, &&l_0x64, &&l_0x65, &&l_0x66, &&l_0x67, &&l_0x68, &&l_0x69, &&l_0x6a, &&l_0x6b,
  &&l_0x6c, &&l_0x6d, &&l_0x6e, &&l_0x6f, &&l_0x70, &&l_0x71, &&l_0x72, &&l_0x73, &&l_0x74,
  &&l_0x75, &&l_0x76, &&l_0x77, &&l_0x78, &&l_0x79, &&l_0x7a, &&l_0x7b, &&l_0x7c, &&l_0x7d,
  &&l_0x7e, &&l_0x7f, &&l_0x80, &&l_0x81, &&l_0x82, &&l_0x83, &&l_0x84, &&l_0x85, &&l_0x86,
  &&l_0x87, &&l_0x88, &&l_0x89, &&l_0x8a, &&l_0x8b, &&l_0x8c, &&l_0x8d, &&l_0x8e, &&l_0x8f,
  &&l_0x90, &&l_0x91, &&l_0x92, &&l_0x93, &&l_0x94, &&l_0x95, &&l_0x96, &&l_0x97, &&l_0x98,
  &&l_0x99, &&l_0x9a, &&l_0x9b, &&l_0x9c, &&l_0x9d, &&l_0x9e, &&l_0x9f, &&l_0xa0, &&l_0xa1,
  &&l_0xa2, &&l_0xa3, &&l_0xa4, &&l_0xa5, &&l_0xa6, &&l_0xa7, &&l_0xa8, &&l_0xa9, &&l_0xaa,
  &&l_0xab, &&l_0xac, &&l_0xad, &&l_0xae, &&l_0xaf, &&l_0xb0, &&l_0xb1, &&l_0xb2, &&l_0xb3,
  &&l_0xb4, &&l_0xb5, &&l_0xb6, &&l_0xb7, &&l_0xb8, &&l_0xb9, &&l_0xba, &&l_0xbb, &&l_0xbc,
  &&l_0xbd, &&l_0xbe, &&l_0xbf, &&l_0xc0, &&l_0xc1, &&l_0xc2, &&l_0xc3, &&l_0xc4, &&l_0xc5,
  &&l_0xc6, &&l_0xc7, &&l_0xc8, &&l_0xc9, &&l_0xca, &&l_0xcb, &&l_0xcc, &&l_0xcd, &&l_0xce,
  &&l_0xcf, &&l_0xd0, &&l_0xd1, &&l_0xd2, &&l_0xd3, &&l_0xd4, &&l_0xd5, &&l_0xd6, &&l_0xd7,
  &&l_0xd8, &&l_0xd9, &&l_0xda, &&l_0xdb, &&l_0xdc, &&l_0xdd, &&l_0xde, &&l_0xdf, &&l_0xe0,
  &&l_0xe1, &&l_0xe2, &&l_0xe3, &&l_0xe4, &&l_0xe5, &&l_0xe6, &&l_0xe7, &&l_0xe8, &&l_0xe9,
  &&l_0xea, &&l_0xeb, &&l_0xec, &&l_0xed, &&l_0xee, &&l_0xef, &&l_0xf0, &&l_0xf1, &&l_0xf2,
  &&l_0xf3, &&l_0xf4, &&l_0xf5, &&l_0xf6, &&l_0xf7, &&l_0xf8, &&l_0xf9, &&l_0xfa, &&l_0xfb,
  &&l_0xfc, &&l_0xfd, &&l_0xfe, &&l_0xff
  };
  */

  // Reset half cycle flag
  half_cycle = false;

  //sally_opcode = memory_Read(sally_pc.w++);
  var opcodeMem = sally_pc.wPlusPlus();
  sally_opcode = memory_Read(opcodeMem);
  sally_cycles = SALLY_CYCLES[sally_opcode];

  //goto *a_jump_table[sally_opcode];

  if (sally_cycles === undefined) {
    console.error("Unknown opcode, mem location: %d, %d", opcodeMem, sally_opcode.toString(16));
  } else if (sally_debug_count-- > 0) {
    console.log("Opcode:%s %d %d %d %d", sally_opcode.toString(16),
      sally_cycles,
      ProSystem.GetCycles(),
      ProSystem.CYCLES_PER_SCANLINE,
      ProSystem.GetMariaScanline());
  }

  switch (sally_opcode) {
    //l_0x00:
    case 0x00:
      sally_BRK();
      return sally_cycles;
    //l_0x01:
    case 0x01:
      sally_IndirectX();
      sally_ORA();
      return sally_cycles;
    //l_0x05:
    case 0x05:
      sally_ZeroPage();
      sally_ORA();
      return sally_cycles;
    //l_0x06:
    case 0x06:
      sally_ZeroPage();
      sally_ASL();
      return sally_cycles;
    //l_0x08:
    case 0x08:
      sally_PHP();
      return sally_cycles;
    //l_0x09:
    case 0x09:
      sally_Immediate();
      sally_ORA();
      return sally_cycles;
    //l_0x0a:
    case 0x0a:
      sally_ASLA();
      return sally_cycles;
    //l_0x0d:
    case 0x0d:
      sally_Absolute();
      sally_ORA();
      return sally_cycles;
    //l_0x0e:
    case 0x0e:
      sally_Absolute();
      sally_ASL();
      return sally_cycles;
    //l_0x10:
    case 0x10:
      sally_Relative();
      sally_BPL();
      return sally_cycles;
    //l_0x11:
    case 0x11:
      sally_IndirectY();
      sally_ORA();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x15:
    case 0x15:
      sally_ZeroPageX();
      sally_ORA();
      return sally_cycles;
    //l_0x16:
    case 0x16:
      sally_ZeroPageX();
      sally_ASL();
      return sally_cycles;
    //l_0x18:
    case 0x18:
      sally_CLC();
      return sally_cycles;
    //l_0x19:
    case 0x19:
      sally_AbsoluteY();
      sally_ORA();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x1d:
    case 0x1d:
      sally_AbsoluteX();
      sally_ORA();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0x1e:
    case 0x1e:
      sally_AbsoluteX();
      sally_ASL();
      return sally_cycles;
    // l_0x20:
    case 0x20:
      sally_Absolute();
      sally_JSR();
      return sally_cycles;
    //l_0x21:
    case 0x21:
      sally_IndirectX();
      sally_AND();
      return sally_cycles;
    //l_0x24:
    case 0x24:
      sally_ZeroPage();
      sally_BIT();
      // Add a half cycle if RIOT/TIA location is accessed. We only track
      // INPT4 since it is the only one that is accessed during the lightgun
      // hit detection loop. This should be extended to take into consideration
      // all RIOT and TIA accesses.
      //if (sally_address.w == INPT4) {
      if (sally_address.getW() == INPT4) {
        half_cycle = true;
      }
      return sally_cycles;
    //l_0x25:
    case 0x25:
      sally_ZeroPage();
      sally_AND();
      return sally_cycles;
    //l_0x26:
    case 0x26:
      sally_ZeroPage();
      sally_ROL();
      return sally_cycles;
    //l_0x28:
    case 0x28:
      sally_PLP();
      return sally_cycles;
    //l_0x29:
    case 0x29:
      sally_Immediate();
      sally_AND();
      return sally_cycles;
    //l_0x2a:
    case 0x2a:
      sally_ROLA();
      return sally_cycles;
    //l_0x2c:
    case 0x2c:
      sally_Absolute();
      sally_BIT();
      return sally_cycles;
    //l_0x2d:
    case 0x2d:
      sally_Absolute();
      sally_AND();
      return sally_cycles;
    //l_0x2e:
    case 0x2e:
      sally_Absolute();
      sally_ROL();
      return sally_cycles;
    //l_0x30:
    case 0x30:
      sally_Relative();
      sally_BMI();
      return sally_cycles;
    //l_0x31:
    case 0x31:
      sally_IndirectY();
      sally_AND();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x35:
    case 0x35:
      sally_ZeroPageX();
      sally_AND();
      return sally_cycles;
    //l_0x36:
    case 0x36:
      sally_ZeroPageX();
      sally_ROL();
      return sally_cycles;
    //l_0x38:
    case 0x38:
      sally_SEC();
      return sally_cycles;
    //l_0x39:
    case 0x39:
      sally_AbsoluteY();
      sally_AND();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x3d:
    case 0x3d:
      sally_AbsoluteX();
      sally_AND();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0x3e:
    case 0x3e:
      sally_AbsoluteX();
      sally_ROL();
      return sally_cycles;
    //l_0x40:
    case 0x40:
      sally_RTI();
      return sally_cycles;
    //l_0x41:
    case 0x41:
      sally_IndirectX();
      sally_EOR();
      return sally_cycles;
    //l_0x45:
    case 0x45:
      sally_ZeroPage();
      sally_EOR();
      return sally_cycles;
    //l_0x46:
    case 0x46:
      sally_ZeroPage();
      sally_LSR();
      return sally_cycles;
    //l_0x48:
    case 0x48:
      sally_PHA();
      return sally_cycles;
    //l_0x49:
    case 0x49:
      sally_Immediate();
      sally_EOR();
      return sally_cycles;
    //l_0x4a:
    case 0x4a:
      sally_LSRA();
      return sally_cycles;
    //l_0x4c:
    case 0x4c:
      sally_Absolute();
      sally_JMP();
      return sally_cycles;
    //l_0x4d:
    case 0x4d:
      sally_Absolute();
      sally_EOR();
      return sally_cycles;
    //l_0x4e:
    case 0x4e:
      sally_Absolute();
      sally_LSR();
      return sally_cycles;
    //l_0x50:
    case 0x50:
      sally_Relative();
      sally_BVC();
      return sally_cycles;
    //l_0x51:
    case 0x51:
      sally_IndirectY();
      sally_EOR();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x55:
    case 0x55:
      sally_ZeroPageX();
      sally_EOR();
      return sally_cycles;
    //l_0x56:
    case 0x56:
      sally_ZeroPageX();
      sally_LSR();
      return sally_cycles;
    //l_0x58:
    case 0x58:
      sally_CLI();
      return sally_cycles;
    //l_0x59:
    case 0x59:
      sally_AbsoluteY();
      sally_EOR();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x5d:
    case 0x5d:
      sally_AbsoluteX();
      sally_EOR();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0x5e:
    case 0x5e:
      sally_AbsoluteX();
      sally_LSR();
      return sally_cycles;
    //l_0x60:
    case 0x60:
      sally_RTS();
      return sally_cycles;
    //l_0x61:
    case 0x61:
      sally_IndirectX();
      sally_ADC();
      return sally_cycles;
    //l_0x65:
    case 0x65:
      sally_ZeroPage();
      sally_ADC();
      return sally_cycles;
    //l_0x66:
    case 0x66:
      sally_ZeroPage();
      sally_ROR();
      return sally_cycles;
    //l_0x68:
    case 0x68:
      sally_PLA();
      return sally_cycles;
    //l_0x69:
    case 0x69:
      sally_Immediate();
      sally_ADC();
      return sally_cycles;
    //l_0x6a:
    case 0x6a:
      sally_RORA();
      return sally_cycles;
    //l_0x6c:
    case 0x6c:
      sally_Indirect();
      sally_JMP();
      return sally_cycles;
    //l_0x6d:
    case 0x6d:
      sally_Absolute();
      sally_ADC();
      return sally_cycles;
    //l_0x6e:
    case 0x6e:
      sally_Absolute();
      sally_ROR();
      return sally_cycles;
    //l_0x70:
    case 0x70:
      sally_Relative();
      sally_BVS();
      return sally_cycles;
    //l_0x71:
    case 0x71:
      sally_IndirectY();
      sally_ADC();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x75:
    case 0x75:
      sally_ZeroPageX();
      sally_ADC();
      return sally_cycles;
    //l_0x76:
    case 0x76:
      sally_ZeroPageX();
      sally_ROR();
      return sally_cycles;
    //l_0x78:
    case 0x78:
      sally_SEI();
      return sally_cycles;
    //l_0x79:
    case 0x79:
      sally_AbsoluteY();
      sally_ADC();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0x7d:
    case 0x7d:
      sally_AbsoluteX();
      sally_ADC();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0x7e:
    case 0x7e:
      sally_AbsoluteX();
      sally_ROR();
      return sally_cycles;
    //l_0x81:
    case 0x81:
      sally_IndirectX();
      sally_STA();
      return sally_cycles;
    //l_0x84:
    case 0x84:
      sally_ZeroPage();
      sally_STY();
      return sally_cycles;
    //l_0x85:
    case 0x85:
      sally_ZeroPage();
      sally_STA();
      return sally_cycles;
    //l_0x86:
    case 0x86:
      sally_ZeroPage();
      sally_stx();
      return sally_cycles;
    //l_0x88:
    case 0x88:
      sally_DEY();
      return sally_cycles;
    //l_0x8a:
    case 0x8a:
      sally_TXA();
      return sally_cycles;
    //l_0x8c:
    case 0x8c:
      sally_Absolute();
      sally_STY();
      return sally_cycles;
    //l_0x8d:
    case 0x8d:
      sally_Absolute();
      sally_STA();
      return sally_cycles;
    //l_0x8e:
    case 0x8e:
      sally_Absolute();
      sally_stx();
      return sally_cycles;
    //l_0x90:
    case 0x90:
      sally_Relative();
      sally_BCC();
      return sally_cycles;
    //l_0x91:
    case 0x91:
      sally_IndirectY();
      sally_STA();
      return sally_cycles;
    //l_0x94:
    case 0x94:
      sally_ZeroPageX();
      sally_STY();
      return sally_cycles;
    //l_0x95:
    case 0x95:
      sally_ZeroPageX();
      sally_STA();
      return sally_cycles;
    //l_0x96:
    case 0x96:
      sally_ZeroPageY();
      sally_stx();
      return sally_cycles;
    //l_0x98:
    case 0x98:
      sally_TYA();
      return sally_cycles;
    //l_0x99:
    case 0x99:
      sally_AbsoluteY();
      sally_STA();
      return sally_cycles;
    //l_0x9a:
    case 0x9a:
      sally_TXS();
      return sally_cycles;
    //l_0x9d:
    case 0x9d:
      sally_AbsoluteX();
      sally_STA();
      return sally_cycles;
    //l_0xa0:
    case 0xa0:
      sally_Immediate();
      sally_LDY();
      return sally_cycles;
    //l_0xa1:
    case 0xa1:
      sally_IndirectX();
      sally_LDA();
      return sally_cycles;
    //l_0xa2:
    case 0xa2:
      sally_Immediate();
      sally_LDX();
      return sally_cycles;
    //l_0xa4:
    case 0xa4:
      sally_ZeroPage();
      sally_LDY();
      return sally_cycles;
    //l_0xa5:
    case 0xa5:
      sally_ZeroPage();
      sally_LDA();
      return sally_cycles;
    //l_0xa6:
    case 0xa6:
      sally_ZeroPage();
      sally_LDX();
      return sally_cycles;
    //l_0xa8:
    case 0xa8:
      sally_TAY();
      return sally_cycles;
    //l_0xa9:
    case 0xa9:
      sally_Immediate();
      sally_LDA();
      return sally_cycles;
    //l_0xaa:
    case 0xaa:
      sally_TAX();
      return sally_cycles;
    //l_0xac:
    case 0xac:
      sally_Absolute();
      sally_LDY();
      return sally_cycles;
    //l_0xad:
    case 0xad:
      sally_Absolute();
      sally_LDA();
      return sally_cycles;
    //l_0xae:
    case 0xae:
      sally_Absolute();
      sally_LDX();
      return sally_cycles;
    //l_0xb0:
    case 0xb0:
      sally_Relative();
      sally_BCS();
      return sally_cycles;
    //l_0xb1:
    case 0xb1:
      sally_IndirectY();
      sally_LDA();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xb4:
    case 0xb4:
      sally_ZeroPageX();
      sally_LDY();
      return sally_cycles;
    //l_0xb5:
    case 0xb5:
      sally_ZeroPageX();
      sally_LDA();
      return sally_cycles;
    //l_0xb6:
    case 0xb6:
      sally_ZeroPageY();
      sally_LDX();
      return sally_cycles;
    //l_0xb8:
    case 0xb8:
      sally_CLV();
      return sally_cycles;
    //l_0xb9:
    case 0xb9:
      sally_AbsoluteY();
      sally_LDA();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xba:
    case 0xba:
      sally_TSX();
      return sally_cycles;
    //l_0xbc:
    case 0xbc:
      sally_AbsoluteX();
      sally_LDY();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0xbd:
    case 0xbd:
      sally_AbsoluteX();
      sally_LDA();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0xbe:
    case 0xbe:
      sally_AbsoluteY();
      sally_LDX();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xc0:
    case 0xc0:
      sally_Immediate();
      sally_CPY();
      return sally_cycles;
    //l_0xc1:
    case 0xc1:
      sally_IndirectX();
      sally_CMP();
      return sally_cycles;
    //l_0xc4:
    case 0xc4:
      sally_ZeroPage();
      sally_CPY();
      return sally_cycles;
    //l_0xc5:
    case 0xc5:
      sally_ZeroPage();
      sally_CMP();
      return sally_cycles;
    //l_0xc6:
    case 0xc6:
      sally_ZeroPage();
      sally_DEC();
      return sally_cycles;
    //l_0xc8:
    case 0xc8:
      sally_INY();
      return sally_cycles;
    //l_0xc9:
    case 0xc9:
      sally_Immediate();
      sally_CMP();
      return sally_cycles;
    //l_0xca:
    case 0xca:
      sally_DEX();
      return sally_cycles;
    //l_0xcc:
    case 0xcc:
      sally_Absolute();
      sally_CPY();
      return sally_cycles;
    //l_0xcd:
    case 0xcd:
      sally_Absolute();
      sally_CMP();
      return sally_cycles;
    //l_0xce:
    case 0xce:
      sally_Absolute();
      sally_DEC();
      return sally_cycles;
    //l_0xd0:
    case 0xd0:
      sally_Relative();
      sally_BNE();
      return sally_cycles;
    //l_0xd1:
    case 0xd1:
      sally_IndirectY();
      sally_CMP();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xd5:
    case 0xd5:
      sally_ZeroPageX();
      sally_CMP();
      return sally_cycles;
    //l_0xd6:
    case 0xd6:
      sally_ZeroPageX();
      sally_DEC();
      return sally_cycles;
    //l_0xd8:
    case 0xd8:
      sally_CLD();
      return sally_cycles;
    //l_0xd9:
    case 0xd9:
      sally_AbsoluteY();
      sally_CMP();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xdd:
    case 0xdd:
      sally_AbsoluteX();
      sally_CMP();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0xde:
    case 0xde:
      sally_AbsoluteX();
      sally_DEC();
      return sally_cycles;
    //l_0xe0:
    case 0xe0:
      sally_Immediate();
      sally_CPX();
      return sally_cycles;
    //l_0xe1:
    case 0xe1:
      sally_IndirectX();
      sally_SBC();
      return sally_cycles;
    //l_0xe4:
    case 0xe4:
      sally_ZeroPage();
      sally_CPX();
      return sally_cycles;
    //l_0xe5:
    case 0xe5:
      sally_ZeroPage();
      sally_SBC();
      return sally_cycles;
    //l_0xe6:
    case 0xe6:
      sally_ZeroPage();
      sally_INC();
      return sally_cycles;
    //l_0xe8:
    case 0xe8:
      sally_INX();
      return sally_cycles;
    //l_0xe9:
    case 0xe9:
      sally_Immediate();
      sally_SBC();
      return sally_cycles;
    //l_0xea:
    case 0xea:
      sally_NOP();
      return sally_cycles;
    //l_0xec:
    case 0xec:
      sally_Absolute();
      sally_CPX();
      return sally_cycles;
    //l_0xed:
    case 0xed:
      sally_Absolute();
      sally_SBC();
      return sally_cycles;
    //l_0xee:
    case 0xee:
      sally_Absolute();
      sally_INC();
      return sally_cycles;
    //l_0xf0:
    case 0xf0:
      sally_Relative();
      sally_BEQ();
      return sally_cycles;
    //l_0xf1:
    case 0xf1:
      sally_IndirectY();
      sally_SBC();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xf5:
    case 0xf5:
      sally_ZeroPageX();
      sally_SBC();
      return sally_cycles;
    //l_0xf6:
    case 0xf6:
      sally_ZeroPageX();
      sally_INC();
      return sally_cycles;
    //l_0xf8:
    case 0xf8:
      sally_SED();
      return sally_cycles;
    //l_0xf9:
    case 0xf9:
      sally_AbsoluteY();
      sally_SBC();
      sally_Delay(sally_y);
      return sally_cycles;
    //l_0xfd:
    case 0xfd:
      sally_AbsoluteX();
      sally_SBC();
      sally_Delay(sally_x);
      return sally_cycles;
    //l_0xfe:
    case 0xfe:
      sally_AbsoluteX();
      sally_INC();
      return sally_cycles;
    case 0x4b: // ALR (ASR)
      //console.log("ALR (ASR)");
      sally_Immediate();
      sally_AND();
      sally_LSRA();
      return sally_cycles;
    case 0x0b: // ANC
    case 0x2b: // ANC
      sally_Immediate();
      sally_AND();
      var temp = sally_p;
      if (sally_a & 128) {
        sally_p |= SALLY_FLAG.C;
      }
      else {
        //sally_p &= ~SALLY_FLAG.C;
        sally_p = (sally_p & ~SALLY_FLAG.C) & 0xFF;
      }
      return sally_cycles;
    // LAX
    // banksets changes
    case 0xb3:
      sally_IndirectY();
      sally_LDA();
      sally_TAX();
      return sally_cycles;
    // SAX
    // banksets changes
    case 0x97:
      sally_ZeroPageY();
      sally_PHP();
      sally_PHA();
      sally_stx();
      sally_AND();
      sally_STA();
      sally_PLA();
      sally_PLP();
      return sally_cycles;
    // UNP
    // banksets changes
    case 0x64:
    // ???
    // banksets changes
    case 0x89:
      // No-op
      return sally_cycles;
    // UNP
    // banksets changes
    case 0x04:
      // TODO: raz
      // Fix for Popeye 2.3c
      // RevEng:
      // $04 is an illegal opcode "nop", but technically it's "nop zp",
      // which means the following byte is part of the instruction.
      // Nothing is done with the byte, but the PC counter will advance past
      // it.
      sally_pc.wPlusPlus();
      break;
    case 0x80:
      // Double no-op
      return sally_cycles;
    case 0xfc:
    case 0xfb:
    case 0xfa:
    case 0xf7:
    case 0xf4:
    case 0xf3:
    case 0xf2:
    case 0xef:
    case 0xeb:
    case 0xe7:
    case 0xe3:
    case 0xe2:
    case 0xdf:
    case 0xdc:
    case 0xdb:
    case 0xda:
    case 0xd7:
    case 0xd4:
    case 0xd3:
    case 0xd2:
    case 0xcf:
    case 0xcb:
    case 0xc7:
    case 0xc3:
    case 0xc2:
    case 0xbf:
    case 0xbb:
    case 0xb7:
    /*case 0xb3:*/
    case 0xb2:
    case 0xaf:
    case 0xab:
    case 0xa7:
    case 0xa3:
    case 0x9f:
    case 0x9e:
    case 0x9c:
    case 0x9b:
    /*case 0x97:*/
    case 0x93:
    case 0x92:
    case 0x8f:
    case 0x8b:
    /*case 0x89:*/
    case 0x87:
    case 0x83:
    case 0x82:
    /*case 0x80:*/
    case 0x7f:
    case 0x7c:
    case 0x7b:
    case 0x7a:
    case 0x77:
    case 0x74:
    case 0x73:
    case 0x72:
    case 0x6f:
    case 0x6b:
    case 0x67:
    /*case 0x64:*/
    case 0x63:
    case 0x62:
    case 0x5f:
    case 0x5c:
    case 0x5b:
    case 0x5a:
    case 0x57:
    case 0x54:
    case 0x53:
    case 0x52:
    case 0x4f:
    case 0x47:
    case 0x44:
    case 0x43:
    case 0x42:
    case 0x3f:
    case 0x3c:
    case 0x3b:
    case 0x3a:
    case 0x37:
    case 0x34:
    case 0x33:
    case 0x32:
    case 0x2f:
    case 0x27:
    case 0x23:
    case 0x22:
    case 0x1f:
    case 0x1c:
    case 0x1b:
    case 0x1a:
    case 0x17:
    case 0x14:
    case 0x13:
    case 0x12:
    case 0x0f:
    case 0x0c:
    case 0x07:
    /*case 0x04:*/
    case 0x03:
    case 0x02:
//console.log('unmapped opcode: 0x' + opcodeMem.toString(16) + ", 0x" + sally_opcode.toString(16));
      return sally_cycles;
    /*
          l_0xff:
          l_0xfc:
          l_0xfb:
          l_0xfa:
          l_0xf7:
          l_0xf4:
          l_0xf3:
          l_0xf2:
          l_0xef:
          l_0xeb:
          l_0xe7:
          l_0xe3:
          l_0xe2:
          l_0xdf:
          l_0xdc:
          l_0xdb:
          l_0xda:
          l_0xd7:
          l_0xd4:
          l_0xd3:
          l_0xd2:
          l_0xcf:
          l_0xcb:
          l_0xc7:
          l_0xc3:
          l_0xc2:
          l_0xbf:
          l_0xbb:
          l_0xb7:
          l_0xb3:
          l_0xb2:
          l_0xaf:
          l_0xab:
          l_0xa7:
          l_0xa3:
          l_0x9f:
          l_0x9e:
          l_0x9c:
          l_0x9b:
          l_0x97:
          l_0x93:
          l_0x92:
          l_0x8f:
          l_0x8b:
          l_0x89:
          l_0x87:
          l_0x83:
          l_0x82:
          l_0x80:
          l_0x7f:
          l_0x7c:
          l_0x7b:
          l_0x7a:
          l_0x77:
          l_0x74:
          l_0x73:
          l_0x72:
          l_0x6f:
          l_0x6b:
          l_0x67:
          l_0x64:
          l_0x63:
          l_0x62:
          l_0x5f:
          l_0x5c:
          l_0x5b:
          l_0x5a:
          l_0x57:
          l_0x54:
          l_0x53:
          l_0x52:
          l_0x4f:
          l_0x4b:
          l_0x47:
          l_0x44:
          l_0x43:
          l_0x42:
          l_0x3f:
          l_0x3c:
          l_0x3b:
          l_0x3a:
          l_0x37:
          l_0x34:
          l_0x33:
          l_0x32:
          l_0x2f:
          l_0x2b:
          l_0x27:
          l_0x23:
          l_0x22:
          l_0x1f:
          l_0x1c:
          l_0x1b:
          l_0x1a:
          l_0x17:
          l_0x14:
          l_0x13:
          l_0x12:
          l_0x0f:
          l_0x0c:
          l_0x0b:
          l_0x07:
          l_0x04:
          l_0x03:
          l_0x02:
    */
  }
  return sally_cycles;
}

// ----------------------------------------------------------------------------
// ExecuteRES
// ----------------------------------------------------------------------------
function sally_ExecuteRES() {
  sally_p = SALLY_FLAG.I | SALLY_FLAG.R | SALLY_FLAG.Z;
  //sally_pc.b.l = memory_ram[SALLY_RES.L];
  sally_pc.setBL(memory_ram[SALLY_RES.L]);
  //sally_pc.b.h = memory_ram[SALLY_RES.H];
  sally_pc.setBH(memory_ram[SALLY_RES.H]);
  //console.log("Execute RES: " + (memory_ram[SALLY_RES.L] | memory_ram[SALLY_RES.H] << 8))
  return 6;
}

// ----------------------------------------------------------------------------
// ExecuteNMI
// ----------------------------------------------------------------------------
function sally_ExecuteNMI() {
  //sally_Push(sally_pc.b.h);
  sally_Push(sally_pc.getBH());
  //sally_Push(sally_pc.b.l);
  sally_Push(sally_pc.getBL());
  //sally_p &= ~SALLY_FLAG.B;
  sally_p = (sally_p & ~SALLY_FLAG.B) & 0xFF;
  sally_Push(sally_p);
  sally_p |= SALLY_FLAG.I;
  //sally_pc.b.l = memory_ram[SALLY_NMI.L];
  sally_pc.setBL(memory_ram[SALLY_NMI.L]);
  //sally_pc.b.h = memory_ram[SALLY_NMI.H];
  sally_pc.setBH(memory_ram[SALLY_NMI.H]);
  //console.log("Execute NMI: " + (memory_ram[SALLY_NMI.L] | memory_ram[SALLY_NMI.H] << 8))
  return 7;
}

// ----------------------------------------------------------------------------
// Execute IRQ
// ----------------------------------------------------------------------------
function sally_ExecuteIRQ() {
  if (!(sally_p & SALLY_FLAG.I)) {
    //sally_Push(sally_pc.b.h);
    sally_Push(sally_pc.getBH());
    //sally_Push(sally_pc.b.l);
    sally_Push(sally_pc.getBL());
    //sally_p &= ~SALLY_FLAG.B;
    sally_p = (sally_p & ~SALLY_FLAG.B) & 0xFF;
    sally_Push(sally_p);
    sally_p |= SALLY_FLAG.I;
    //sally_pc.b.l = memory_ram[SALLY_IRQ.L];
    sally_pc.setBL(memory_ram[SALLY_IRQ.L]);
    //sally_pc.b.h = memory_ram[SALLY_IRQ.H];
    sally_pc.setBH(memory_ram[SALLY_IRQ.H]);
    //console.log("Execute IRQ: " + (memory_ram[SALLY_IRQ.L] | memory_ram[SALLY_IRQ.H] << 8))
  }
  return 7;
}

function GetSallyA() {
  return sally_a;
}

function SetSallyA(a) {
  sally_a = a;
}

function GetSallyX() {
  return sally_x;
}

function SetSallyX(x) {
  sally_x = x;
}

function GetSallyY() {
  return sally_y;
}

function SetSallyY(y) {
  sally_y = y;
}

function GetSallyP() {
  return sally_p;
}

function SetSallyP(p) {
  sally_p = p;
}

function GetSallyS() {
  return sally_s;
}

function SetSallyS(s) {
  sally_s = s;
}

function GetSallyPC() {
  return sally_pc;
}

function GetHalfCycle() {
  return half_cycle;
}

export {
  sally_Reset as Reset,
  sally_ExecuteRES as ExecuteRES,
  sally_ExecuteInstruction as ExecuteInstruction,
  sally_ExecuteNMI as ExecuteNMI,
  GetHalfCycle,
  GetSallyA,
  SetSallyA,
  GetSallyX,
  SetSallyX,
  GetSallyY,
  SetSallyY,
  GetSallyP,
  SetSallyP,
  GetSallyS,
  SetSallyS,
  GetSallyPC
}
