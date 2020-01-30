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
// Region.h
// ----------------------------------------------------------------------------

var REGION_NTSC = 0;
var REGION_PAL = 1;
var REGION_AUTO = 2;


//byte region_type = REGION_AUTO;
var region_type = REGION_AUTO;

//static const rect REGION_DISPLAY_AREA_NTSC = {0, 16, 319, 258};
var REGION_DISPLAY_AREA_NTSC = new Rect(0, 16, 319, 258);
//static const rect REGION_VISIBLE_AREA_NTSC = {0, 26, 319, 250};
var REGION_VISIBLE_AREA_NTSC = new Rect(0, 26, 319, 250);

//static const byte REGION_FREQUENCY_NTSC = 60;
var REGION_FREQUENCY_NTSC = 60;
//static const word REGION_SCANLINES_NTSC = 262;
var REGION_SCANLINES_NTSC = 262;

//static const rect REGION_DISPLAY_AREA_PAL = {0, 16, 319, 308};
var REGION_DISPLAY_AREA_PAL = new Rect(0, 16, 319, 308);
//static const rect REGION_VISIBLE_AREA_PAL = {0, 26, 319, 297};
var REGION_VISIBLE_AREA_PAL = new Rect(0, 26, 319, 297);
//static const byte REGION_FREQUENCY_PAL = 50;
var REGION_FREQUENCY_PAL = 50;
//static const word REGION_SCANLINES_PAL = 312;
var REGION_SCANLINES_PAL = 312;

// ----------------------------------------------------------------------------
// PALETTE NTSC
// ----------------------------------------------------------------------------

//const byte REGION_PALETTE_NTSC[ ] = {
var REGION_PALETTE_NTSC = [
  0x00, 0x00, 0x00, 0x25, 0x25, 0x25, 0x34, 0x34, 0x34, 0x4F, 0x4F, 0x4F,
  0x5B, 0x5B, 0x5B, 0x69, 0x69, 0x69, 0x7B, 0x7B, 0x7B, 0x8A, 0x8A, 0x8A,
  0xA7, 0xA7, 0xA7, 0xB9, 0xB9, 0xB9, 0xC5, 0xC5, 0xC5, 0xD0, 0xD0, 0xD0,
  0xD7, 0xD7, 0xD7, 0xE1, 0xE1, 0xE1, 0xF4, 0xF4, 0xF4, 0xFF, 0xFF, 0xFF,
  0x4C, 0x32, 0x00, 0x62, 0x3A, 0x00, 0x7B, 0x4A, 0x00, 0x9A, 0x60, 0x00,
  0xB5, 0x74, 0x00, 0xCC, 0x85, 0x00, 0xE7, 0x9E, 0x08, 0xF7, 0xAF, 0x10,
  0xFF, 0xC3, 0x18, 0xFF, 0xD0, 0x20, 0xFF, 0xD8, 0x28, 0xFF, 0xDF, 0x30,
  0xFF, 0xE6, 0x3B, 0xFF, 0xF4, 0x40, 0xFF, 0xFA, 0x4B, 0xFF, 0xFF, 0x50,
  0x99, 0x25, 0x00, 0xAA, 0x25, 0x00, 0xB4, 0x25, 0x00, 0xD3, 0x30, 0x00,
  0xDD, 0x48, 0x02, 0xE2, 0x50, 0x09, 0xF4, 0x67, 0x00, 0xF4, 0x75, 0x10,
  0xFF, 0x9E, 0x10, 0xFF, 0xAC, 0x20, 0xFF, 0xBA, 0x3A, 0xFF, 0xBF, 0x50,
  0xFF, 0xC6, 0x6D, 0xFF, 0xD5, 0x80, 0xFF, 0xE4, 0x90, 0xFF, 0xE6, 0x99,
  0x98, 0x0C, 0x0C, 0x99, 0x0C, 0x0C, 0xC2, 0x13, 0x00, 0xD3, 0x13, 0x00,
  0xE2, 0x35, 0x00, 0xE3, 0x40, 0x00, 0xE4, 0x40, 0x20, 0xE5, 0x52, 0x30,
  0xFD, 0x78, 0x54, 0xFF, 0x8A, 0x6A, 0xFF, 0x98, 0x7C, 0xFF, 0xA4, 0x8B,
  0xFF, 0xB3, 0x9E, 0xFF, 0xC2, 0xB2, 0xFF, 0xD0, 0xBA, 0xFF, 0xD7, 0xC0,
  0x99, 0x00, 0x00, 0xA9, 0x00, 0x00, 0xC2, 0x04, 0x00, 0xD3, 0x04, 0x00,
  0xDA, 0x04, 0x00, 0xDB, 0x08, 0x00, 0xE4, 0x20, 0x20, 0xF6, 0x40, 0x40,
  0xFB, 0x70, 0x70, 0xFB, 0x7E, 0x7E, 0xFB, 0x8F, 0x8F, 0xFF, 0x9F, 0x9F,
  0xFF, 0xAB, 0xAB, 0xFF, 0xB9, 0xB9, 0xFF, 0xC9, 0xC9, 0xFF, 0xCF, 0xCF,
  0x7E, 0x00, 0x50, 0x80, 0x00, 0x50, 0x80, 0x00, 0x5F, 0x95, 0x0B, 0x74,
  0xAA, 0x22, 0x88, 0xBB, 0x2F, 0x9A, 0xCE, 0x3F, 0xAD, 0xD7, 0x5A, 0xB6,
  0xE4, 0x67, 0xC3, 0xEF, 0x72, 0xCE, 0xFB, 0x7E, 0xDA, 0xFF, 0x8D, 0xE1,
  0xFF, 0x9D, 0xE5, 0xFF, 0xA5, 0xE7, 0xFF, 0xAF, 0xEA, 0xFF, 0xB8, 0xEC,
  0x48, 0x00, 0x6C, 0x5C, 0x04, 0x88, 0x65, 0x0D, 0x90, 0x7B, 0x23, 0xA7,
  0x93, 0x3B, 0xBF, 0x9D, 0x45, 0xC9, 0xA7, 0x4F, 0xD3, 0xB2, 0x5A, 0xDE,
  0xBD, 0x65, 0xE9, 0xC5, 0x6D, 0xF1, 0xCE, 0x76, 0xFA, 0xD5, 0x83, 0xFF,
  0xDA, 0x90, 0xFF, 0xDE, 0x9C, 0xFF, 0xE2, 0xA9, 0xFF, 0xE6, 0xB6, 0xFF,
  0x1B, 0x00, 0x70, 0x22, 0x1B, 0x8D, 0x37, 0x30, 0xA2, 0x48, 0x41, 0xB3,
  0x59, 0x52, 0xC4, 0x63, 0x5C, 0xCE, 0x6F, 0x68, 0xDA, 0x7D, 0x76, 0xE8,
  0x87, 0x80, 0xF8, 0x93, 0x8C, 0xFF, 0x9D, 0x97, 0xFF, 0xA8, 0xA3, 0xFF,
  0xB3, 0xAF, 0xFF, 0xBC, 0xB8, 0xFF, 0xC4, 0xC1, 0xFF, 0xDA, 0xD1, 0xFF,
  0x00, 0x0D, 0x7F, 0x00, 0x12, 0xA7, 0x00, 0x18, 0xC0, 0x0A, 0x2B, 0xD1,
  0x1B, 0x4A, 0xE3, 0x2F, 0x58, 0xF0, 0x37, 0x68, 0xFF, 0x49, 0x79, 0xFF,
  0x5B, 0x85, 0xFF, 0x6D, 0x96, 0xFF, 0x7F, 0xA3, 0xFF, 0x8C, 0xAD, 0xFF,
  0x96, 0xB4, 0xFF, 0xA8, 0xC0, 0xFF, 0xB7, 0xCB, 0xFF, 0xC6, 0xD6, 0xFF,
  0x00, 0x29, 0x5A, 0x00, 0x38, 0x76, 0x00, 0x48, 0x92, 0x00, 0x5C, 0xAC,
  0x00, 0x71, 0xC6, 0x00, 0x86, 0xD0, 0x0A, 0x9B, 0xDF, 0x1A, 0xA8, 0xEC,
  0x2B, 0xB6, 0xFF, 0x3F, 0xC2, 0xFF, 0x45, 0xCB, 0xFF, 0x59, 0xD3, 0xFF,
  0x7F, 0xDA, 0xFF, 0x8F, 0xDE, 0xFF, 0xA0, 0xE2, 0xFF, 0xB0, 0xEB, 0xFF,
  0x00, 0x38, 0x39, 0x00, 0x3C, 0x48, 0x00, 0x3D, 0x5B, 0x02, 0x66, 0x7F,
  0x03, 0x73, 0x83, 0x00, 0x9C, 0xAA, 0x00, 0xA1, 0xBB, 0x01, 0xA4, 0xCC,
  0x03, 0xBB, 0xFF, 0x05, 0xDA, 0xE2, 0x18, 0xE5, 0xFF, 0x34, 0xEA, 0xFF,
  0x49, 0xEF, 0xFF, 0x66, 0xF2, 0xFF, 0x84, 0xF4, 0xFF, 0x9E, 0xF9, 0xFF,
  0x00, 0x4A, 0x00, 0x00, 0x5D, 0x00, 0x00, 0x70, 0x00, 0x00, 0x8B, 0x00,
  0x00, 0xA9, 0x00, 0x00, 0xBB, 0x05, 0x00, 0xBD, 0x00, 0x02, 0xD0, 0x05,
  0x1A, 0xD5, 0x40, 0x5A, 0xF1, 0x77, 0x82, 0xEF, 0xA7, 0x84, 0xED, 0xD1,
  0x89, 0xFF, 0xED, 0x7D, 0xFF, 0xFF, 0x93, 0xFF, 0xFF, 0x9B, 0xFF, 0xFF,
  0x22, 0x4A, 0x03, 0x27, 0x53, 0x04, 0x30, 0x64, 0x05, 0x3C, 0x77, 0x0C,
  0x45, 0x8C, 0x11, 0x5A, 0xA5, 0x13, 0x1B, 0xD2, 0x09, 0x1F, 0xDD, 0x00,
  0x3D, 0xCD, 0x2D, 0x3D, 0xCD, 0x30, 0x58, 0xCC, 0x40, 0x60, 0xD3, 0x50,
  0xA2, 0xEC, 0x55, 0xB3, 0xF2, 0x4A, 0xBB, 0xF6, 0x5D, 0xC4, 0xF8, 0x70,
  0x2E, 0x3F, 0x0C, 0x36, 0x4A, 0x0F, 0x40, 0x56, 0x15, 0x46, 0x5F, 0x17,
  0x57, 0x77, 0x1A, 0x65, 0x85, 0x1C, 0x74, 0x93, 0x1D, 0x8F, 0xA5, 0x25,
  0xAD, 0xB7, 0x2C, 0xBC, 0xC7, 0x30, 0xC9, 0xD5, 0x33, 0xD4, 0xE0, 0x3B,
  0xE0, 0xEC, 0x42, 0xEA, 0xF6, 0x45, 0xF0, 0xFD, 0x47, 0xF4, 0xFF, 0x6F,
  0x55, 0x24, 0x00, 0x5A, 0x2C, 0x00, 0x6C, 0x3B, 0x00, 0x79, 0x4B, 0x00,
  0xB9, 0x75, 0x00, 0xBB, 0x85, 0x00, 0xC1, 0xA1, 0x20, 0xD0, 0xB0, 0x2F,
  0xDE, 0xBE, 0x3F, 0xE6, 0xC6, 0x45, 0xED, 0xCD, 0x57, 0xF5, 0xDB, 0x62,
  0xFB, 0xE5, 0x69, 0xFC, 0xEE, 0x6F, 0xFD, 0xF3, 0x77, 0xFD, 0xF3, 0x7F,
  0x5C, 0x27, 0x00, 0x5C, 0x2F, 0x00, 0x71, 0x3B, 0x00, 0x7B, 0x48, 0x00,
  0xB9, 0x68, 0x20, 0xBB, 0x72, 0x20, 0xC5, 0x86, 0x29, 0xD7, 0x96, 0x33,
  0xE6, 0xA4, 0x40, 0xF4, 0xB1, 0x4B, 0xFD, 0xC1, 0x58, 0xFF, 0xCC, 0x55,
  0xFF, 0xD4, 0x61, 0xFF, 0xDD, 0x69, 0xFF, 0xE6, 0x79, 0xFF, 0xEA, 0x98
];

// --------------------------------------------------------------------------------------
// PALETTE PAL
// --------------------------------------------------------------------------------------
//const byte REGION_PALETTE_PAL[ ] = {
var REGION_PALETTE_PAL = [
  0x00, 0x00, 0x00, 0x1c, 0x1c, 0x1c, 0x39, 0x39, 0x39, 0x59, 0x59, 0x59,
  0x79, 0x79, 0x79, 0x92, 0x92, 0x92, 0xab, 0xab, 0xab, 0xbc, 0xbc, 0xbc,
  0xcd, 0xcd, 0xcd, 0xd9, 0xd9, 0xd9, 0xe6, 0xe6, 0xe6, 0xec, 0xec, 0xec,
  0xf2, 0xf2, 0xf2, 0xf8, 0xf8, 0xf8, 0xff, 0xff, 0xff, 0xff, 0xff, 0xff,
  0x26, 0x30, 0x01, 0x24, 0x38, 0x03, 0x23, 0x40, 0x05, 0x51, 0x54, 0x1b,
  0x80, 0x69, 0x31, 0x97, 0x81, 0x35, 0xaf, 0x99, 0x3a, 0xc2, 0xa7, 0x3e,
  0xd5, 0xb5, 0x43, 0xdb, 0xc0, 0x3d, 0xe1, 0xcb, 0x38, 0xe2, 0xd8, 0x36,
  0xe3, 0xe5, 0x34, 0xef, 0xf2, 0x58, 0xfb, 0xff, 0x7d, 0xfb, 0xff, 0x7d,
  0x39, 0x17, 0x01, 0x5e, 0x23, 0x04, 0x83, 0x30, 0x08, 0xa5, 0x47, 0x16,
  0xc8, 0x5f, 0x24, 0xe3, 0x78, 0x20, 0xff, 0x91, 0x1d, 0xff, 0xab, 0x1d,
  0xff, 0xc5, 0x1d, 0xff, 0xce, 0x34, 0xff, 0xd8, 0x4c, 0xff, 0xe6, 0x51,
  0xff, 0xf4, 0x56, 0xff, 0xf9, 0x77, 0xff, 0xff, 0x98, 0xff, 0xff, 0x98,
  0x45, 0x19, 0x04, 0x72, 0x1e, 0x11, 0x9f, 0x24, 0x1e, 0xb3, 0x3a, 0x20,
  0xc8, 0x51, 0x22, 0xe3, 0x69, 0x20, 0xff, 0x81, 0x1e, 0xff, 0x8c, 0x25,
  0xff, 0x98, 0x2c, 0xff, 0xae, 0x38, 0xff, 0xc5, 0x45, 0xff, 0xc5, 0x59,
  0xff, 0xc6, 0x6d, 0xff, 0xd5, 0x87, 0xff, 0xe4, 0xa1, 0xff, 0xe4, 0xa1,
  0x4a, 0x17, 0x04, 0x7e, 0x1a, 0x0d, 0xb2, 0x1d, 0x17, 0xc8, 0x21, 0x19,
  0xdf, 0x25, 0x1c, 0xec, 0x3b, 0x38, 0xfa, 0x52, 0x55, 0xfc, 0x61, 0x61,
  0xff, 0x70, 0x6e, 0xff, 0x7f, 0x7e, 0xff, 0x8f, 0x8f, 0xff, 0x9d, 0x9e,
  0xff, 0xab, 0xad, 0xff, 0xb9, 0xbd, 0xff, 0xc7, 0xce, 0xff, 0xc7, 0xce,
  0x05, 0x05, 0x68, 0x3b, 0x13, 0x6d, 0x71, 0x22, 0x72, 0x8b, 0x2a, 0x8c,
  0xa5, 0x32, 0xa6, 0xb9, 0x38, 0xba, 0xcd, 0x3e, 0xcf, 0xdb, 0x47, 0xdd,
  0xea, 0x51, 0xeb, 0xf4, 0x5f, 0xf5, 0xfe, 0x6d, 0xff, 0xfe, 0x7a, 0xfd,
  0xff, 0x87, 0xfb, 0xff, 0x95, 0xfd, 0xff, 0xa4, 0xff, 0xff, 0xa4, 0xff,
  0x28, 0x04, 0x79, 0x40, 0x09, 0x84, 0x59, 0x0f, 0x90, 0x70, 0x24, 0x9d,
  0x88, 0x39, 0xaa, 0xa4, 0x41, 0xc3, 0xc0, 0x4a, 0xdc, 0xd0, 0x54, 0xed,
  0xe0, 0x5e, 0xff, 0xe9, 0x6d, 0xff, 0xf2, 0x7c, 0xff, 0xf8, 0x8a, 0xff,
  0xff, 0x98, 0xff, 0xfe, 0xa1, 0xff, 0xfe, 0xab, 0xff, 0xfe, 0xab, 0xff,
  0x35, 0x08, 0x8a, 0x42, 0x0a, 0xad, 0x50, 0x0c, 0xd0, 0x64, 0x28, 0xd0,
  0x79, 0x45, 0xd0, 0x8d, 0x4b, 0xd4, 0xa2, 0x51, 0xd9, 0xb0, 0x58, 0xec,
  0xbe, 0x60, 0xff, 0xc5, 0x6b, 0xff, 0xcc, 0x77, 0xff, 0xd1, 0x83, 0xff,
  0xd7, 0x90, 0xff, 0xdb, 0x9d, 0xff, 0xdf, 0xaa, 0xff, 0xdf, 0xaa, 0xff,
  0x05, 0x1e, 0x81, 0x06, 0x26, 0xa5, 0x08, 0x2f, 0xca, 0x26, 0x3d, 0xd4,
  0x44, 0x4c, 0xde, 0x4f, 0x5a, 0xee, 0x5a, 0x68, 0xff, 0x65, 0x75, 0xff,
  0x71, 0x83, 0xff, 0x80, 0x91, 0xff, 0x90, 0xa0, 0xff, 0x97, 0xa9, 0xff,
  0x9f, 0xb2, 0xff, 0xaf, 0xbe, 0xff, 0xc0, 0xcb, 0xff, 0xc0, 0xcb, 0xff,
  0x05, 0x1e, 0x81, 0x06, 0x26, 0xa5, 0x08, 0x2f, 0xca, 0x26, 0x3d, 0xd4,
  0x44, 0x4c, 0xde, 0x4f, 0x5a, 0xee, 0x5a, 0x68, 0xff, 0x65, 0x75, 0xff,
  0x71, 0x83, 0xff, 0x80, 0x91, 0xff, 0x90, 0xa0, 0xff, 0x97, 0xa9, 0xff,
  0x9f, 0xb2, 0xff, 0xaf, 0xbe, 0xff, 0xc0, 0xcb, 0xff, 0xc0, 0xcb, 0xff,
  0x0c, 0x04, 0x8b, 0x22, 0x18, 0xa0, 0x38, 0x2d, 0xb5, 0x48, 0x3e, 0xc7,
  0x58, 0x4f, 0xda, 0x61, 0x59, 0xec, 0x6b, 0x64, 0xff, 0x7a, 0x74, 0xff,
  0x8a, 0x84, 0xff, 0x91, 0x8e, 0xff, 0x99, 0x98, 0xff, 0xa5, 0xa3, 0xff,
  0xb1, 0xae, 0xff, 0xb8, 0xb8, 0xff, 0xc0, 0xc2, 0xff, 0xc0, 0xc2, 0xff,
  0x1d, 0x29, 0x5a, 0x1d, 0x38, 0x76, 0x1d, 0x48, 0x92, 0x1c, 0x5c, 0xac,
  0x1c, 0x71, 0xc6, 0x32, 0x86, 0xcf, 0x48, 0x9b, 0xd9, 0x4e, 0xa8, 0xec,
  0x55, 0xb6, 0xff, 0x70, 0xc7, 0xff, 0x8c, 0xd8, 0xff, 0x93, 0xdb, 0xff,
  0x9b, 0xdf, 0xff, 0xaf, 0xe4, 0xff, 0xc3, 0xe9, 0xff, 0xc3, 0xe9, 0xff,
  0x2f, 0x43, 0x02, 0x39, 0x52, 0x02, 0x44, 0x61, 0x03, 0x41, 0x7a, 0x12,
  0x3e, 0x94, 0x21, 0x4a, 0x9f, 0x2e, 0x57, 0xab, 0x3b, 0x5c, 0xbd, 0x55,
  0x61, 0xd0, 0x70, 0x69, 0xe2, 0x7a, 0x72, 0xf5, 0x84, 0x7c, 0xfa, 0x8d,
  0x87, 0xff, 0x97, 0x9a, 0xff, 0xa6, 0xad, 0xff, 0xb6, 0xad, 0xff, 0xb6,
  0x0a, 0x41, 0x08, 0x0d, 0x54, 0x0a, 0x10, 0x68, 0x0d, 0x13, 0x7d, 0x0f,
  0x16, 0x92, 0x12, 0x19, 0xa5, 0x14, 0x1c, 0xb9, 0x17, 0x1e, 0xc9, 0x19,
  0x21, 0xd9, 0x1b, 0x47, 0xe4, 0x2d, 0x6e, 0xf0, 0x40, 0x78, 0xf7, 0x4d,
  0x83, 0xff, 0x5b, 0x9a, 0xff, 0x7a, 0xb2, 0xff, 0x9a, 0xb2, 0xff, 0x9a,
  0x04, 0x41, 0x0b, 0x05, 0x53, 0x0e, 0x06, 0x66, 0x11, 0x07, 0x77, 0x14,
  0x08, 0x88, 0x17, 0x09, 0x9b, 0x1a, 0x0b, 0xaf, 0x1d, 0x48, 0xc4, 0x1f,
  0x86, 0xd9, 0x22, 0x8f, 0xe9, 0x24, 0x99, 0xf9, 0x27, 0xa8, 0xfc, 0x41,
  0xb7, 0xff, 0x5b, 0xc9, 0xff, 0x6e, 0xdc, 0xff, 0x81, 0xdc, 0xff, 0x81,
  0x02, 0x35, 0x0f, 0x07, 0x3f, 0x15, 0x0c, 0x4a, 0x1c, 0x2d, 0x5f, 0x1e,
  0x4f, 0x74, 0x20, 0x59, 0x83, 0x24, 0x64, 0x92, 0x28, 0x82, 0xa1, 0x2e,
  0xa1, 0xb0, 0x34, 0xa9, 0xc1, 0x3a, 0xb2, 0xd2, 0x41, 0xc4, 0xd9, 0x45,
  0xd6, 0xe1, 0x49, 0xe4, 0xf0, 0x4e, 0xf2, 0xff, 0x53, 0xf2, 0xff, 0x53,
];

// ----------------------------------------------------------------------------
// Reset
// ----------------------------------------------------------------------------
//void region_Reset( ) {
var region_Reset = function () {
  if (region_type == REGION_PAL || (region_type == REGION_AUTO && cartridge_region == REGION_PAL)) {
    maria_displayArea = REGION_DISPLAY_AREA_PAL;
    maria_visibleArea = REGION_VISIBLE_AREA_PAL;
    if (palette_default)
      palette_Load(REGION_PALETTE_PAL);  // Added check for default - bberlin
    prosystem_frequency = REGION_FREQUENCY_PAL;
    prosystem_scanlines = REGION_SCANLINES_PAL;
    //#ifndef WII    
    //tia_size = 624;
    //pokey_size = 624;
    //#endif    
  }
  else {
    maria_displayArea = REGION_DISPLAY_AREA_NTSC;
    maria_visibleArea = REGION_VISIBLE_AREA_NTSC;
    if (palette_default)
      palette_Load(REGION_PALETTE_NTSC);  // Added check for default - bberlin
    prosystem_frequency = REGION_FREQUENCY_NTSC;
    prosystem_scanlines = REGION_SCANLINES_NTSC;
    //#ifndef WII    
    //tia_size = 524;
    //pokey_size = 524;
    //#endif    
  }
  pokey_setSampleRate((prosystem_scanlines * prosystem_frequency) << 1);
}
