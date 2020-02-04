var ATARI_WIDTH = 320;
var ATARI_BLIT_HEIGHT = 300;
var NTSC_ATARI_BLIT_TOP_Y = 2;
var NTSC_ATARI_HEIGHT = 240;
var PAL_ATARI_BLIT_TOP_Y = 26;
var PAL_ATARI_HEIGHT = 240;

var blit_surface = new Array(ATARI_WIDTH * ATARI_BLIT_HEIGHT);

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
/** Lightgun flash */
var lightgun_flash = false;
/** The atari canvas */
var atari_canvas = null;
/** The atari context */
var atari_ctx = null;
/** The atari image data */
var atari_image;
/** The atari image data */
var atari_image_data;
/** The palette */
var atari_pal8 = new Array(256);
/** The keyboard data */
var atari_keyboard_data = new Array(19);
/** The refresh callback id */
var atari_refresh_callback_id = null;

function start_emu(cart) {  
  js_reset_keyboard_data();
  cartridge_Load(cart, cart.length);
  js_atari_init();
  js_atari_init_palette8();
  prosystem_Reset();
  var start = Date.now();
  var fc = 0;

  timer_Reset();
  var f = function () {    
    if (prosystem_active && !prosystem_paused) {

      js_atari_update_keys(atari_keyboard_data);
      prosystem_ExecuteFrame(atari_keyboard_data);
      
      //VIDEO_WaitVSync();
      js_atari_flip_image();
      //sound_Store();
      
      timer_IsTime();
      var wait = ((timer_nextTime - timer_currentTime) / 1000)>>0;
      atari_refresh_callback_id = 
        setTimeout(function () { f(); }, (wait > 0 ? wait : 0));

      fc++;      
      if ((fc % 240) == 0) {
        var elapsed = Date.now() - start;
        console.log("v:%s, timer: %d, wsync: %d, %d, stl: %d, mar: %d, cpu: %d, ext: %d", 
          (1000.0 / (elapsed / fc)).toFixed(2),     
          (riot_timer_count % 1000),     
          dbg_wsync ? 1 : 0,
          dbg_wsync_count,
          dbg_cycle_stealing ? 1 : 0,
          dbg_maria_cycles, dbg_p6502_cycles, dbg_saved_cycles);
        start = Date.now();
        fc = 0;
      }
    }
  };
  atari_refresh_callback_id = setTimeout(f, 15);
}

function js_atari_start_emulation(cart) {  
  if (atari_refresh_callback_id) {
    clearTimeout(atari_refresh_callback_id);
  }    
  if (prosystem_active) {
    prosystem_Close();
  }
  start_emu(cart);
}

function js_atari_flip_image() {
  var atari_height =
    (cartridge_region == REGION_PAL ? PAL_ATARI_HEIGHT : NTSC_ATARI_HEIGHT);
  var atari_offsety =
    (cartridge_region == REGION_PAL ? PAL_ATARI_BLIT_TOP_Y
                                    : NTSC_ATARI_BLIT_TOP_Y);

  var offsetx = 0;
  var offsety = ((ATARI_BLIT_HEIGHT - atari_height) / 2) >> 0;

  var src = 0, dst = 0, start = 0, x = 0, y = 0;
  var backpixels = atari_image_data;
  var blitpixels = blit_surface;
  var startoffset = atari_offsety * ATARI_WIDTH;
  for (y = 0; y < atari_height; y++) {
    start = startoffset + (y * ATARI_WIDTH);
    src = 0;
    dst = (((y + offsety) * ATARI_WIDTH)*4) + (offsetx*4);
    for (x = 0; x < ATARI_WIDTH; x++) {
        var cidx = blitpixels[start + src];
        var color = atari_pal8[cidx];     
        backpixels[dst++] = color[0];
        backpixels[dst++] = color[1];
        backpixels[dst++] = color[2];
        dst++;
        src++;
    }
  }
  atari_ctx.putImageData(atari_image, 0, 0);
}

function js_atari_init() {
  // Graphics
  atari_canvas = document.getElementById('screen');
  atari_ctx = atari_canvas.getContext('2d');
  atari_image = atari_ctx.getImageData(0, 0, ATARI_WIDTH, ATARI_BLIT_HEIGHT);
  atari_image_data = atari_image.data;

  // set alpha to opaque 
  for (var i = 3; i < atari_image_data.length - 3; i += 4) {
    atari_image_data[i - 3] = 0x11;
    atari_image_data[i - 2] = 0x11;
    atari_image_data[i - 1] = 0x11;
    atari_image_data[i] = 0xFF;
  }
  atari_ctx.putImageData(atari_image, 0, 0);
}

function js_atari_init_palette8() {
  var palette = null;
  if (cartridge_region == REGION_PAL) {
    palette = REGION_PALETTE_PAL;
  } else {
    palette = REGION_PALETTE_NTSC;
  }

  for (var index = 0; index < 256; index++) {
    var r = palette[(index * 3) + 0];
    var g = palette[(index * 3) + 1];
    var b = palette[(index * 3) + 2];
    atari_pal8[index] = [r, g, b];
  }
}

function js_atari_get_blit_addr() {
  return blit_surface;
}

function js_atari_update_keys(keyboard_data) {
  // | 12       | Console      | Reset
  keyboard_data[12] = 0;
  // | 13       | Console      | Select
  keyboard_data[13] = 0;
  // | 14       | Console      | Pause
  keyboard_data[14] = 0;

  js_atari_update_joystick(0, keyboard_data);
  js_atari_update_joystick(1, keyboard_data);
}

function js_atari_update_joystick(joyIndex, keyboard_data) {
  var offset = (joyIndex == 0 ? 0 : 6);

  // | 00 06     | Joystick 1 2 | Right
  keyboard_data[0 + offset] = 0;
  // | 01 07     | Joystick 1 2 | Left
  keyboard_data[1 + offset] = 0;
  // | 02 08     | Joystick 1 2 | Down
  keyboard_data[2 + offset] = 0;
  // | 03 09     | Joystick 1 2 | Up
  keyboard_data[3 + offset] = 0;
  // | 04 10     | Joystick 1 2 | Button 1
  keyboard_data[5 + offset] = 0;
  // | 05 11     | Joystick 1 2 | Button 2
  keyboard_data[4 + offset] = 0;
  // | 15       | Console      | Left Difficulty
  //keyboard_data[15] = 0;
  // | 16       | Console      | Right Difficulty
  //keyboard_data[16] = 0; 
}

function js_reset_keyboard_data() {
  for (var idx = 0; idx < atari_keyboard_data.length; idx++) {
    atari_keyboard_data[idx] = 0;
  }

  // Left difficulty switch defaults to off
  atari_keyboard_data[15] = cartridge_left_switch;

  // Right difficulty switch defaults to on
  atari_keyboard_data[16] = cartridge_right_switch;
}
