var ATARI_WIDTH = 320;
var ATARI_BLIT_HEIGHT = 300;

var blit_surface = new Array(ATARI_WIDTH*ATARI_BLIT_HEIGHT);

/** The 7800 scanline that the lightgun is currently at */
//int lightgun_scanline = 0;
var lightgun_scanline = 0;
/** The 7800 cycle that the lightgun is currently at */
//float lightgun_cycle = 0;
var lightgun_cycle = 0;
/** Whether the lightgun is enabled for the current cartridge */
//bool lightgun_enabled = false; 
var lightgun_enabled = false; 
/** Tracks the first time the lightgun is fired for the current cartridge */
//bool lightgun_first_fire = true;
var lightgun_first_fire = true;

function js_get_blit_addr() {
  return blit_surface;
}

/*
static void wii_atari_init_palette8() {
  const byte* palette;
  if (cartridge_region == REGION_PAL) {
      palette = REGION_PALETTE_PAL;
  } else {
      palette = REGION_PALETTE_NTSC;
  }

  for (uint index = 0; index < 256; index++) {
      word r = palette[(index * 3) + 0];
      word g = palette[(index * 3) + 1];
      word b = palette[(index * 3) + 2];
      atari_pal8[index] = wii_sdl_rgb(r, g, b);
  }
}
*/
var atari_pal8 = new Array(1024);

