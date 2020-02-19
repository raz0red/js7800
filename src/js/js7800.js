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
  var Database = js7800.Database;

  var webPkg = js7800.web;
  var WebAudio = webPkg.audio;
  var WebVideo = webPkg.video;
  var WebInput = webPkg.input;
  var WebDrop = webPkg.drop;
  var updateInput = WebInput.updateInput;
  var flipImage = WebVideo.flipImage;
  var WebKb = webPkg.kb;
  var WebMouse = webPkg.mouse;

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

  function startEmu(cart) {

    Cartridge.Load(cart, cart.length);
    var digest = Cartridge.GetDigest();
    Database.Load(digest);

    console.log("Final values:");
    console.log("  Title: %s", Cartridge.GetTitle());
    console.log("  Size: %d", Cartridge.GetSize());
    console.log("  Digest: %s", digest);
    console.log("  Type: %d", Cartridge.GetType());
    console.log("  Pokey: %s", Cartridge.IsPokeyEnabled() ? "true" : "false");
    console.log("  Pokey450: %s", Cartridge.IsPokey450Enabled() ? "true" : "false");
    console.log("  Controller 1: %d", Cartridge.GetController1());
    console.log("  Controller 2: %d", Cartridge.GetController2());
    console.log("  Region: %s", Cartridge.GetRegion() == 1 ? "PAL" : "NTSC");
    console.log("  Flags: %d", Cartridge.GetFlags());
    console.log("  XM: %s", Cartridge.IsXmEnabled() ? "true" : "false");
    console.log("  Right switch: %d", Cartridge.GetRightSwitch());
    console.log("  Left switch: %d", Cartridge.GetLeftSwitch());
    console.log("  Swap buttons: %s", Cartridge.IsSwapButtons() ? "true" : "false");
    console.log("  Dual analog: %s", Cartridge.IsDualAnalog() ? "true" : "false");
    console.log("  Hblank: %d", Cartridge.GetHblank());
    console.log("  Crosshair X: %d", Cartridge.GetCrossX());
    console.log("  Crosshair Y: %d", Cartridge.GetCrossY());

    // ProSystem
    Memory.OnCartridgeLoaded();
    ProSystem.OnCartridgeLoaded();
    Sound.OnCartridgeLoaded();
    // Web
    WebVideo.onCartidgeLoaded();
    WebKb.onCartridgeLoaded();
    WebMouse.onCartridgeLoaded();
    // Reset keyboard data
    WebInput.resetKeyboardData();    

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

    // Enable mouse tracking if lightgun game
    WebMouse.enableMouseTracking(Cartridge.IsLightGunEnabled());

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

