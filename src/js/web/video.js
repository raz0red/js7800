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

  /** Snow */
  var displaySnow = true;

  var blitSurface = new Array(ATARI_WIDTH * ATARI_BLIT_HEIGHT);

  /** The atari canvas */
  var canvas = null;
  /** The atari context */
  var context = null;
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
    }
    clearCanvas();
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

  // function fakeCRT() {
  //   var glcanvas, source, srcctx, texture, w, h, hw, hh, w75;

  //   // Try to create a WebGL canvas (will fail if WebGL isn't supported)
  //   try {
  //     glcanvas = fx.canvas();
  //   } catch (e) { return; }

  //   // Assumes the first canvas tag in the document is the 2D game, but
  //   // obviously we could supply a specific canvas element here.
  //   source = canvas;
  //   srcctx = context;

  //   // This tells glfx what to use as a source image
  //   texture = glcanvas.texture(source);

  //   // Just setting up some details to tweak the bulgePinch effect
  //   w = source.width;
  //   h = source.height;
  //   hw = w / 2;
  //   hh = h / 2;
  //   w75 = w * 0.75;

  //   // Hide the source 2D canvas and put the WebGL Canvas in its place
  //   source.parentNode.insertBefore(glcanvas, source);
  //   source.style.display = 'none';
  //   glcanvas.className = source.className;
  //   glcanvas.id = source.id;
  //   source.id = 'old_' + source.id;

  //   // It is pretty silly to setup a separate animation timer loop here, but
  //   // this lets us avoid monkeying with the source game's code.
  //   // It would make way more sense to do the following directly in the source
  //   // game's draw function in terms of performance.
  //   setInterval(function () {
  //     // Give the source scanlines
  //     //srcctx.drawImage(lines, 0, 0, w, h);

  //     // Load the latest source frame
  //     texture.loadContentsOf(source);

  //     // Apply WebGL magic
  //     glcanvas.draw(texture)
  //       .bulgePinch(hw, hh, w75, 0.12)
  //       .vignette(0.25, 0.74)
  //       .update();
  //   }, Math.floor(1000 / 40));
  // }  

  return {
    init: init,
    flipImage: flipImage,
    startScreenSnow: startSnow,
    stopScreenSnow: function() { 
      displaySnow = false; },
    onCartidgeLoaded: function() {
      cartridgeRegion = Cartridge.GetRegion();
      initPalette8();
    }
  }
})();

