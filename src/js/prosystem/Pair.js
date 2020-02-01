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
// Pair.h
// ----------------------------------------------------------------------------

/*
typedef unsigned char byte;
typedef unsigned short word;
typedef unsigned int uint;

union Pair { 
  word w;
  struct Join {
#ifndef WII
    byte l; 
    byte h;
#else
    byte h; 
    byte l;
#endif
  } b;
};

typedef Pair pair;
#endif
*/

// TODO: Handle overflow (plus plus, plus equal, minus equal, set)
Pair = function () {
    this._w = 0;
    this.wPlusPlus = function() {
        var curr = this._w;
        this._w++;
        return curr;
    }
    this.wMinusMinus = function() {
        var curr = this._w;
        this._w--;
        return curr;        
    }
    this.wPlusEqual = function(val) {
        this._w += val;
    }
    this.wMinusEqual = function(val) {
        this._w -= val;
    }
    this.setW = function (val) {
        this._w = val & 0xFFFF;
    }
    this.getW = function () {
        return this._w;
    }
    this.getBL = function () {
        return this._w & 0x00FF;
    }
    this.getBLSigned = function() {
        var bl = this.getBL();
        if((bl & 0x80) > 0) {
            return bl - 0x100;
        }
        return bl;
    }
    this.setBL = function(val) {
        this._w = ((this._w & 0xFF00) | (val & 0x00FF));
    }
    this.blPlusEqual = function(val) {
        var v = this.getBL() + val;
        if(v > 255) {
            //console.log("blPlusEqual > 255: %d", v);
            v -= 256;
        } 
        this.setBL(v);
    }
    this.getBH = function () {
        return (this._w & 0xFF00) >>> 8;
    }
    this.setBH = function(val) {
        this._w = ((this._w & 0x00FF) | ((val << 8) & 0xFF00));
    }
    this.bhPlusEqual = function(val) {
        var v = this.getBH() + val;
        if(v > 255) {
            //console.log("bhPlusEqual > 255: %d", v);
            v -= 256;
        } 
        this.setBH(v);
    }
    this.clone = function () {
        var c = new Pair();
        c._w = this._w;
        return c;
    }
}
