(function () {
  'use strict';

  var Sound = js7800.Sound;
  var Riot = js7800.Riot;
  var ProSystem = js7800.ProSystem;
  var executeFrame = ProSystem.ExecuteFrame;
  var Cartridge = js7800.Cartridge;
  var Memory = js7800.Memory;
  var Sound = js7800.Sound;
  var soundStore = Sound.Store;

  var webPkg = js7800.web;
  var WebAudio = webPkg.audio;
  var WebVideo = webPkg.video;
  var WebInput = webPkg.input;
  var WebDrop = webPkg.drop;
  var updateInput = WebInput.updateInput;
  var flipImage = WebVideo.flipImage;
  var WebKb = webPkg.kb;

  /** The 7800 scanline that the lightgun is currently at */
  //int lightgun_scanline = 0;
  var lightgunScanline = 0;
  /** The 7800 cycle that the lightgun is currently at */
  //float lightgun_cycle = 0;
  var lightgunCycle = 0;
  /** Whether the lightgun is enabled for the current cartridge */
  //bool lightgun_enabled = false; 
  var lightgunEnabled = false;
  /** Tracks the first time the lightgun is fired for the current cartridge */
  //bool lightgun_first_fire = true;
  var lightgunFirstFire = true;
  /** Lightgun flash */
  var lightgunFlash = false;
  /** The refresh callback id */
  var atariRefreshCallbackId = null;

  /** The keyboard data */
  var keyboardData = new Array(19);

  var initialized = false;

  /* Function to open fullscreen mode */
  /*  
    function openFullscreen(elem) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { // Firefox 
        elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { // Chrome, Safari & Opera 
        elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { // IE/Edge 
        elem.msRequestFullscreen();
      }    
    }
  */

  function startEmu(cart) {

    WebInput.resetKeyboardData();
    Cartridge.Load(cart, cart.length);

    // ProSystem
    Memory.OnCartridgeLoaded();
    ProSystem.OnCartridgeLoaded();
    Sound.OnCartridgeLoaded();
    // Web
    WebVideo.onCartidgeLoaded();
    WebKb.onCartridgeLoaded();

    init();
    ProSystem.Reset();

    var start = Date.now();
    var fc = 0;
    var frequency = ProSystem.GetFrequency();
    var debugFrequency = frequency * 10;
    var frameTicks = (1000.0 / frequency) | 0;
    var adjustTolerance = (frameTicks * 1000);
    var isActive = ProSystem.IsActive;
    var isPaused = ProSystem.IsPaused;

    var f = function () {
      if (isActive() && !isPaused()) {

        updateInput();
        executeFrame(keyboardData);
        flipImage();
        soundStore();

        nextTimestamp += frameTicks;
        var now = Date.now();
        if ((nextTimestamp + adjustTolerance) < now) {
          nextTimestamp = now;
          console.log("adjusted next timestamp.");
        }
        var wait = (nextTimestamp - now);
        if (wait > 0) {
          setTimeout(function () { requestAnimationFrame(f); }, wait);
        } else {
          requestAnimationFrame(f);
        }

        fc++;
        if ((fc % debugFrequency) == 0) {
          var elapsed = Date.now() - start;
          console.log("v:%s, timer: %d, wsync: %d, %d, stl: %d, mar: %d, cpu: %d, ext: %d",
            (1000.0 / (elapsed / fc)).toFixed(2),
            (Riot.GetTimerCount() % 1000),
            ProSystem.GetDebugWsync() ? 1 : 0,
            ProSystem.GetDebugWsyncCount(),
            ProSystem.GetDebugCycleStealing() ? 1 : 0,
            ProSystem.GetDebugMariaCycles(),
            ProSystem.GetDebug6502Cycles(),
            ProSystem.GetDebugSavedCycles());
          start = Date.now();
          fc = 0;
        }
      }
    };
    var nextTimestamp = Date.now() + frameTicks;
    setTimeout(function () { requestAnimationFrame(f) }, frameTicks);
  }

  function startEmulation(cart) {
    if (atariRefreshCallbackId) {
      clearTimeout(atariRefreshCallbackId);
      atariRefreshCallbackId = null;
    }
    if (ProSystem.IsActive()) {
      ProSystem.Close();
    }

    $("#logo").fadeOut("slow");
    setTimeout(function () {
      WebVideo.stopScreenSnow();
      startEmu(cart);
    }, 200);
  }

  function init() {
    if (!initialized) {
      initialized = true;

      // ProSystem
      Sound.init();
      Riot.init();
      Cartridge.init();
      // Web
      WebAudio.init();
      WebVideo.init();
      WebDrop.init();
      WebKb.init();
      WebInput.init(keyboardData);         

      WebVideo.startScreenSnow();
      $("#logo").fadeIn("slow");
    }
  }

  js7800.init = init;
  js7800.startEmulation = startEmulation;
})();

