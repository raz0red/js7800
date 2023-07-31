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
// Database.cpp
// ----------------------------------------------------------------------------

import * as Cartridge from "./Cartridge.js"
import * as ProSystemDat from "./ProSystemDat.js"

var DATABASE = ProSystemDat.DATABASE;

var cart_in_db = false;
var database_enabled = true;

// ----------------------------------------------------------------------------
// Load
// ----------------------------------------------------------------------------
//bool database_Load(std::string digest) {
function database_Load(digest) {
  cart_in_db = false;
  if (database_enabled) {
    var entry = DATABASE[digest];
    if (entry) {
      cart_in_db = true;
      console.log(entry);

      var title = entry['t'];
      if (title !== undefined) {
        Cartridge.SetTitle(title);
      }
      var type = entry['ty'];
      if (type !== undefined) {
        Cartridge.SetType(parseInt(type));
      }
      var pokey = entry['p'];
      if (pokey !== undefined) {
        Cartridge.SetPokey(pokey == 't');
      }
      var controller1 = entry['c1'];
      if (controller1 !== undefined) {
        Cartridge.SetController1(parseInt(controller1));
      }
      var controller2 = entry['c2'];
      if (controller2 !== undefined) {
        Cartridge.SetController2(parseInt(controller2));
      }
      var region = entry['r'];
      if (region !== undefined) {
        Cartridge.SetRegion(parseInt(region));
      }
      /*
      var flags = entry['f'];
      if (flags !== undefined) {
        Cartridge.SetFlags(parseInt(flags));
      }
      */
      var xm = entry['xm'];
      if (xm !== undefined) {
        Cartridge.SetXm(xm == 't');
      }
      /*
      var hblank = entry['hblank'];
      if (hblank !== undefined) {
        Cartridge.SetHblank(parseInt(hblank));
      }
      */
      var crossx = entry['crossx'];
      if (crossx !== undefined) {
        Cartridge.SetCrossX(parseInt(crossx));
      }
      var crossy = entry['crossy'];
      if (crossy !== undefined) {
        Cartridge.SetCrossY(parseInt(crossy));
      }
      var dualanalog = entry['dualanalog'];
      if (dualanalog !== undefined) {
        Cartridge.SetDualAnalog(dualanalog == 't');
      }
      var pokey450 = entry['p4'];
      if (pokey450 !== undefined) {
        var enabled = pokey450 == 't';
        Cartridge.SetPokey450(enabled);
        if (enabled) {
          Cartridge.SetPokey(true);
        }
      }
      var leftswitch = entry['leftswitch'];
      if (leftswitch !== undefined) {
        Cartridge.SetLeftSwitch(parseInt(leftswitch));
      }
      var rightswitch = entry['rightswitch'];
      if (rightswitch !== undefined) {
        Cartridge.SetRightSwitch(parseInt(rightswitch));
      }
      var swapbuttons = entry['sb'];
      if (swapbuttons !== undefined) {
        Cartridge.SetSwapButtons(swapbuttons == 't');
      }
      var highscorecart = entry['hs'];
      if (highscorecart !== undefined ) {
        Cartridge.SetHighScoreCartEnabled(highscorecart == 't');
      }
    }
    return cart_in_db;
  }
}

export {
  database_Load as Load
}


