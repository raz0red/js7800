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

js7800.Database = (function () {
  'use strict';

  var ProSystemDat = js7800.ProSystemDat;
  var DATABASE = ProSystemDat.DATABASE;
  var Cartridge = js7800.Cartridge;

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

        var title = entry['title'];
        if (title !== undefined) {
          Cartridge.SetTitle(title);
        }
        var type = entry['type'];
        if (type !== undefined) {
          Cartridge.SetType(parseInt(type));          
        }
        var pokey = entry['pokey'];
        if (pokey !== undefined) {
          Cartridge.SetPokey(pokey == 'true');
        }
        var controller1 = entry['controller1'];
        if (controller1 !== undefined) {
          Cartridge.SetController1(parseInt(controller1));
        }
        var controller2 = entry['controller2'];
        if (controller2 !== undefined) {
          Cartridge.SetController2(parseInt(controller2));
        }
        var region = entry['region'];
        if (region !== undefined) {
          Cartridge.SetRegion(parseInt(region));
        }
        var flags = entry['flags'];
        if (flags !== undefined) {
          Cartridge.SetFlags(parseInt(flags));
        }
        var xm = entry['xm'];
        if (xm !== undefined) {
          Cartridge.SetXm(xm == 'true');
        }
        var hblank = entry['hblank'];
        if (hblank !== undefined) {
          Cartridge.SetHblank(parseInt(hblank));
        }
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
          Cartridge.SetDualAnalog(dualanalog == 'true');
        }
        var pokey450 = entry['pokey450'];
        if (pokey450 !== undefined) {
          var enabled = pokey450 == 'true';
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
        var swapbuttons = entry['swapbuttons'];
        if (swapbuttons !== undefined) {
          Cartridge.SetSwapButtons(swapbuttons == 'true');
        }
      }      
      return cart_in_db;
    }
  }

  return {
    Load: database_Load
  }
})();



