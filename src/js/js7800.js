import * as WebMouse from "./web/mouse.js"
import * as WebInput from "./web/input.js"
import * as ProSystem from "./prosystem/ProSystem.js"
import * as WebVideo from "./web/video.js"
import * as Sound from "./prosystem/Sound.js"
import * as WebAudio from "./web/audio.js"
import * as WebKb from "./web/kb.js"
import * as Memory from "./prosystem/Memory.js"
import * as Cartridge from "./prosystem/Cartridge.js"
import * as Database from "./prosystem/Database.js"
import * as Riot from "./prosystem/Riot.js"

import 'fullscreen-api-polyfill'

import css from '../css/js7800.css'
import logoImageSrc from '../images/Atari_7800_Logo.png'

var executeFrame = ProSystem.ExecuteFrame;
var soundStore = Sound.Store;
var updateInput = WebInput.updateInput;
var flipImage = WebVideo.flipImage;
var canvas = null;
var controlsDiv = null;
var logoDiv = null;
var starting = false;

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
  starting = false;

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
  if (starting) {
    return;
  }

  // Mark that emulation is starting
  starting = true;

  if (ProSystem.IsActive()) {
    ProSystem.Close();
  }

  //jQuery("#logo").fadeOut("slow");
  logoDiv.style.display = "none";

  setTimeout(function () {
    WebVideo.stopScreenSnow();
    startEmu(cart);
  }, 200);
}

function addElements(id) {
  var container = document.getElementById(id);
  if (!container) {
    throw "Unable to find element with id: " + id;
  }

  // border-container
  var mainContainer = document.createElement("div");
  mainContainer.className = mainContainer.id = "js7800";
  mainContainer.style.width = WebVideo.DEFAULT_WIDTH + "px";
  container.appendChild(mainContainer);

  // fullscreen-container
  var fullscreenContainer = document.createElement("div");
  fullscreenContainer.id = "js7800__fullscreen-container";
  mainContainer.appendChild(fullscreenContainer);

  // inner-container
  var innerContainer = document.createElement("div");
  innerContainer.id = innerContainer.className = "js7800__inner-container";
  fullscreenContainer.appendChild(innerContainer);

  // no-select (wrapper)
  var noSelectWrapper = document.createElement("div");
  noSelectWrapper.className = "js7800_noselect";
  innerContainer.appendChild(noSelectWrapper);

  // canvas
  canvas = document.createElement("canvas");
  canvas.id = canvas.className = "js7800__screen";
  canvas.width = WebVideo.ATARI_WIDTH;
  canvas.height = WebVideo.ATARI_CANVAS_HEIGHT;
  noSelectWrapper.appendChild(canvas);  

  // logo
  logoDiv = document.createElement("div");
  logoDiv.id = logoDiv.className = "js7800__logo";
  innerContainer.appendChild(logoDiv);

  // image
  var logoImage = document.createElement("img");
  logoImage.src = logoImageSrc;
  logoImage.alt = "Atari 7800";
  logoDiv.appendChild(logoImage);

  // controls
  controlsDiv = document.createElement("div");
  controlsDiv.id = controlsDiv.className = "js7800__controls";
  fullscreenContainer.appendChild(controlsDiv);
}

function init(id) {
  if (!initialized) {
    initialized = true;

    // Add the HTML elements
    addElements(id);

    // ProSystem
    Sound.init();
    Riot.init();
    Cartridge.init();
    // Web
    WebAudio.init();
    WebVideo.init(canvas, controlsDiv);
    WebKb.init();
    WebInput.init(keyboardData);

    WebVideo.startScreenSnow();
    //jQuery("#logo").fadeIn("slow");
    logoDiv.style.display = "block";
  }
}

export { init, startEmulation };