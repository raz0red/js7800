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
// Timer.cpp
// ----------------------------------------------------------------------------

//static uInt64 timer_currentTime;
var timer_currentTime = 0;
//static uInt64 timer_nextTime;
var timer_nextTime = 0;
//static uint timer_frameTime;
var timer_frameTime = 0;

// ----------------------------------------------------------------------------
// Initialize
// ----------------------------------------------------------------------------
//void timer_Initialize( ) {
timer_Initialize = function() {
  timer_Reset();
}

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void timer_Reset( ) {
timer_Reset = function () {
  //timer_frameTime = (1000.0 / (double)prosystem_frequency) * 1000;
  timer_frameTime = (1000.0 / prosystem_frequency) * 1000;
  //timer_currentTime = ((uInt64)SDL_GetTicks()) * 1000;
  timer_currentTime = (Date.now()) * 1000;
  timer_nextTime = timer_currentTime + timer_frameTime;
}

// ----------------------------------------------------------------------------
// IsTime
// ----------------------------------------------------------------------------
///bool timer_IsTime( ) {
timer_IsTime = function () {
  //timer_currentTime = ((uInt64)SDL_GetTicks()) * 1000;
  timer_currentTime = (Date.now()) * 1000;

  if (timer_currentTime >= timer_nextTime) {
    timer_nextTime += timer_frameTime;
    return true;
  }
  return false;
}

/*
timer_test = function() {
  prosystem_frequency = 60;
  timer_Reset();
  for (var i = 0; i < 10000; i++) {
    console.log(timer_IsTime());
  }
}
*/

