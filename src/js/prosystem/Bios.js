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
// Bios.cpp
// ----------------------------------------------------------------------------

import * as Memory from "./Memory.js"

var bios_enabled = false;
var bios = null;

// var b = atob(NTSC_BIOS.split(',')[1]);
// var arr = new Array();
// for (var i = 0; i < b.length; i++) {
//   arr.push(b.charCodeAt(i));  
// }
// bios = arr;

function bios_Store() {
  if (bios != null && bios_enabled) {
    Memory.WriteROM(65536 - bios.length, bios.length, bios, 0);
  }
}

function bios_SetBios(b) {
  bios = b;
}

function bios_Size() {
  return bios_enabled ? bios.length : 0;
}

function IsEnabled() { 
  return bios_enabled;  
 }

 function SetEnabled(v) {
   bios_enabled = v;
 }

export {
  bios_Store as Store,
  bios_Size as Size,
  bios_SetBios as SetBios,
  SetEnabled,
  IsEnabled
}
