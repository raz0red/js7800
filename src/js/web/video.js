js7800.web.video = (function () {
  'use strict';

  var Maria = js7800.Maria;
  var Region = js7800.Region;
  var Cartridge = js7800.Cartridge;  

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

  function init() {
    Maria.SetSurface(blitSurface);
    if (!canvas) {
      canvas = document.getElementById('screen');
      context = canvas.getContext('2d');
      image = context.getImageData(0, 0, ATARI_WIDTH, ATARI_CANVAS_HEIGHT);
      imageData = image.data;
      controlsDiv = document.getElementById('controls');
    }
    clearCanvas();
    resizeCanvas();
  }

  function clearCanvas() {
    // set alpha to opaque 
    for (var i = 3; i < imageData.length - 3; i += 4) {
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
        for (var i = 3; i < imageData.length - 3; i += 4) {
          var v = Math.random() < 0.5 ? 0 : 255;
          imageData[i - 3] = v;
          imageData[i - 2] = v;
          imageData[i - 1] = v;
          imageData[i] = 0x30;
        }
        ctx.putImageData(image, 0, 0);
      }
    }
  }

  function resizeCanvas() {
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
  }

  window.addEventListener("resize", function() {
    resizeCanvas();
  });

  return {
    init: init,
    flipImage: flipImage,
    startScreenSnow: startSnow,
    stopScreenSnow: function() { displaySnow = false; },
    fullScreen: function () {
      var fsContainer = document.getElementById("fullscreen-container");
      if (document.fullscreenElement) {
        document.exitFullscreen();
      } else {
        fsContainer.requestFullscreen();
      }
      resizeCanvas();
    },
    onCartidgeLoaded: function() {
      cartridgeRegion = Cartridge.GetRegion();
      initPalette8();
    }
  }
})();

