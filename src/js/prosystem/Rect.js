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
// Rect.h
// ----------------------------------------------------------------------------
Rect = function (left, top, right, bottom) {
  this.left = left;
  this.top = top;
  this.right = right;
  this.bottom = bottom;
  this.length = (this.right - this.left) + 1;
  this.height = (this.bottom - this.top) + 1;
  this.area = this.length * this.height;

  this.GetArea = function () {
    return this.area;
  }

  this.GetLength = function () {
    return this.length;
  }

  this.GetHeight = function () {
    return this.height;
  }
};
