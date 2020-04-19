import * as Region from "../prosystem/Region.js"
import * as Cartridge from "../prosystem/Cartridge.js"
import * as Maria from "../prosystem/Maria.js"
import * as Events from "../events.js"

var ATARI_WIDTH = 320;
var ATARI_BLIT_HEIGHT = 300;
var NTSC_ATARI_BLIT_TOP_Y = 2;
var NTSC_ATARI_HEIGHT = 240;
var PAL_ATARI_BLIT_TOP_Y = 26;
var PAL_ATARI_HEIGHT = 240;
var ATARI_CANVAS_HEIGHT = 240;

var HxW_AR = 1.1416;
var WxH_AR = 0.876;
var DEFAULT_WIDTH = 548;
var DEFAULT_HEIGHT = 480;

/** Snow */
var displaySnow = true;

var blitSurface = new Array(ATARI_WIDTH * ATARI_BLIT_HEIGHT);

/** The atari canvas */
var canvas = null;
/** The atari context */
var context = null;
/** The controls div */
var controlsDiv = null;
/** The atari image data */
var image;
/** The atari image data */
var imageData;
/** The palette */
var palette8 = new Array(256);

/** Cartridge shadow */
var cartridgeRegion = 0;

function initPalette8() {
  var palette = null;
  if (cartridgeRegion == Region.REGION_PAL) {
    palette = Region.REGION_PALETTE_PAL;
  } else {
    palette = Region.REGION_PALETTE_NTSC;
  }

  for (var index = 0; index < 256; index++) {
    var r = palette[(index * 3) + 0];
    var g = palette[(index * 3) + 1];
    var b = palette[(index * 3) + 2];
    palette8[index] = [r, g, b];
  }
}

function flipImage() {
  var atariHeight =
    (cartridgeRegion == Region.REGION_PAL ? PAL_ATARI_HEIGHT : NTSC_ATARI_HEIGHT);
  var atariOffsety =
    (cartridgeRegion == Region.REGION_PAL ? PAL_ATARI_BLIT_TOP_Y
      : NTSC_ATARI_BLIT_TOP_Y);

  var offsetx = 0;
  var offsety = ((ATARI_CANVAS_HEIGHT - atariHeight) / 2) | 0;

  var src = 0, dst = 0, start = 0, x = 0, y = 0;
  var backpixels = imageData;
  var blitpixels = blitSurface;
  var startoffset = atariOffsety * ATARI_WIDTH;
  for (y = 0; y < atariHeight; y++) {
    start = startoffset + (y * ATARI_WIDTH);
    src = 0;
    dst = (((y + offsety) * ATARI_WIDTH) << 2) + (offsetx << 2);
    for (x = 0; x < ATARI_WIDTH; x++) {
      var cidx = blitpixels[start + src];
      var color = palette8[cidx];
      backpixels[dst++] = color[0];
      backpixels[dst++] = color[1];
      backpixels[dst++] = color[2];
      dst++;
      src++;
    }
  }
  context.putImageData(image, 0, 0);
}

function init(canvasIn, controlsDivIn) {
  Maria.SetSurface(blitSurface);
  if (!canvas) {
    canvas = canvasIn;
    controlsDiv = controlsDivIn;
    context = canvas.getContext('2d');
    image = context.getImageData(0, 0, ATARI_WIDTH, ATARI_CANVAS_HEIGHT);
    imageData = image.data;
  }
  clearCanvas();
  resizeCanvas();
}

Events.addListener(new Events.Listener("init",
  function (event) { init(event.canvas, event.controlsDiv); }));

function clearCanvas() {
  // set alpha to opaque 
  for (var i = 3; i < imageData.length; i += 4) {
    imageData[i - 3] = 0;
    imageData[i - 2] = 0;
    imageData[i - 1] = 0;
    imageData[i] = 0xFF;
  }
  context.putImageData(image, 0, 0);
}

function startSnow() {
  if (displaySnow) {
    (function loop() {
      if (!displaySnow) {
        clearCanvas();
        return;
      }
      snow(context);
      requestAnimationFrame(loop)
    })();

    function snow(ctx) {
      for (var i = 3; i < imageData.length; i += 4) {
        var v = Math.random() < 0.5 ? 0 : 255;
        imageData[i - 3] = v;
        imageData[i - 2] = v;
        imageData[i - 1] = v;
        imageData[i] = 0x25;
      }
      ctx.putImageData(image, 0, 0);
    }
  }
}

function resizeCanvas() {
  if (canvas) {
    var fullScreen = document.fullscreenElement;
    if (fullScreen) {
      var height = window.innerHeight - controlsDiv.offsetHeight;
      var width = window.innerWidth;

      var newHeight = height;
      var newWidth = newHeight * HxW_AR;
      if (newWidth > width) {
        newWidth = width;
        newHeight = newWidth * WxH_AR;
      }
      canvas.style.width = newWidth + "px";
      canvas.style.height = newHeight + "px";
    } else {
      canvas.style.width = DEFAULT_WIDTH + "px";
      canvas.style.height = DEFAULT_HEIGHT + "px";
    }
    Events.fireEvent("fullscreen", fullScreen ? true : false);
  }
}

window.addEventListener("resize", function () {
  resizeCanvas();
  setTimeout(resizeCanvas, 1000);
});

function getCanvas() { 
  return canvas; 
}

function stopScreenSnow() { 
  displaySnow = false; 
}

function fullScreen() {
  var fsContainer = document.getElementById("js7800__fullscreen-container");
  if (!isFullscreen()) {
    fsContainer.requestFullscreen();
    resizeCanvas();
    setTimeout(resizeCanvas, 1000);
  }  
}

function isFullscreen() {
  return document.fullscreenElement;
}

function exitFullScreen() {
  document.exitFullscreen();
}

function onCartridgeLoaded() {
  cartridgeRegion = Cartridge.GetRegion();
  initPalette8();
}

Events.addListener(
  new Events.Listener("onCartridgeLoaded", onCartridgeLoaded));

export {
  flipImage,
  startSnow as startScreenSnow,
  ATARI_WIDTH,
  ATARI_CANVAS_HEIGHT,
  NTSC_ATARI_BLIT_TOP_Y,
  PAL_ATARI_BLIT_TOP_Y,
  NTSC_ATARI_HEIGHT,
  PAL_ATARI_HEIGHT,
  DEFAULT_HEIGHT,
  DEFAULT_WIDTH,
  getCanvas,
  stopScreenSnow,
  fullScreen,
  exitFullScreen,
  isFullscreen
}
