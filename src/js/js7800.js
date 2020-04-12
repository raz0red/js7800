import * as Mouse from "./web/mouse.js"
import * as Input from "./web/input.js"
import * as ProSystem from "./prosystem/ProSystem.js"
import * as Video from "./web/video.js"
import * as Sound from "./prosystem/Sound.js"
import * as Audio from "./web/audio.js"
import * as Kb from "./web/kb.js"
import * as Memory from "./prosystem/Memory.js"
import * as Cartridge from "./prosystem/Cartridge.js"
import * as Database from "./prosystem/Database.js"
import * as Riot from "./prosystem/Riot.js"
import * as ControlsBar from "./web/cbar.js"
import * as Events from "./events.js"

import 'fullscreen-api-polyfill'

import css from '../css/js7800.css'
import logoImageSrc from '../images/Atari_7800_Logo.png'

var executeFrame = ProSystem.ExecuteFrame;
var soundStore = Sound.Store;
var updateInput = Input.updateInput;
var flipImage = Video.flipImage;

var canvas = null;
var controlsDiv = null;
var logoDiv = null;
var starting = false;
var currentCart = null;

var messageHandler = function (message) {
  alert(message);
}

var errorHandler = function (message) {
  alert(message);
}

/** The keyboard data */
var keyboardData = new Array(19);

var initialized = false;
var forceAdjustTimestamp = false;

function startEmu(cart, isRestart) {
  currentCart = cart;

  var leftSwitch = 0;
  var rightSwitch = 0;
  if (isRestart) {
    leftSwitch = Kb.isLeftDiffSet();
    rightSwitch = Kb.isRightDiffSet();
  }

  Cartridge.Load(cart, cart.length);
  var digest = Cartridge.GetDigest();
  Database.Load(digest);

  if (isRestart) {
    Cartridge.SetLeftSwitch(leftSwitch);
    Cartridge.SetRightSwitch(rightSwitch);
  }

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

  // Fire on cartridge loaded event
  Events.fireEvent("onCartridgeLoaded");

  // Reset keyboard data
  Input.resetKeyboardData();

  init();
  ProSystem.Reset();
  starting = false;

  var start = Date.now();
  var fc = 0;
  var frequency = ProSystem.GetFrequency();
  var debugFrequency = frequency * 10;
  var frameTicks = (1000.0 / frequency) /*| 0*/;
  var adjustTolerance = (frameTicks * frequency * 2); // 2 secs
  var isActive = ProSystem.IsActive;
  var isPaused = ProSystem.IsPaused;

  // Enable mouse tracking if lightgun game
  Mouse.enableMouseTracking(Cartridge.IsLightGunEnabled());

  console.log("Frame ticks: " + frameTicks);
  console.log("Frequency: " + frequency);

  var f = function () {
    if (isActive()) {

      if (!isPaused()) {
        updateInput();
        executeFrame(keyboardData);
        flipImage();
        soundStore();

        nextTimestamp += frameTicks;
        var now = Date.now();
        if (((nextTimestamp + adjustTolerance) < now) || forceAdjustTimestamp) {
          forceAdjustTimestamp = false;
          nextTimestamp = now;
          fc = 0;
          start = now;
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
      } else {
        setTimeout(function () {
          forceAdjustTimestamp = true;
          requestAnimationFrame(f);
        }, 100);
      }
    }
  };
  var nextTimestamp = Date.now() + frameTicks;
  setTimeout(function () { requestAnimationFrame(f) }, frameTicks);
}

function restart() {
  if (currentCart) {
    startEmulation(currentCart, true);
  }
}

function startEmulation(cart, isRestart) {
  if (starting) {
    return;
  }

  // Mark that emulation is starting
  starting = true;

  if (ProSystem.IsActive()) {
    ProSystem.Close();
  }

  if (!logoDiv.classList.contains('js7800__logo--hide')) {
    logoDiv.classList.add('js7800__logo--hide');
    logoDiv.classList.remove('js7800__logo--show');

    // Should not be necessary, but makes sure is not displayed
    setTimeout(function () {
      logoDiv.style.display = 'none';
    }, 1000);
  }

  setTimeout(function () {
    Video.stopScreenSnow();
    startEmu(cart, isRestart);
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
  mainContainer.style.width = Video.DEFAULT_WIDTH + "px";
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
  canvas.width = Video.ATARI_WIDTH;
  canvas.height = Video.ATARI_CANVAS_HEIGHT;
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

    // Fire init event
    Events.fireEvent("init", {
      "canvas": canvas,
      "controlsDiv": controlsDiv,
      "keyboardData": keyboardData
    });

    Video.startScreenSnow();
    logoDiv.classList.add('js7800__logo--show');

    var restartListener = new Events.Listener("restart");
    restartListener.onEvent = function () {
      restart();
    }
    Events.addListener(restartListener);
  }
}

function setMessageHandler(handler) {
  messageHandler = handler;
}

function setErrorHandler(handler) {
  errorHandler = handler;
}

var showMessageListener = new Events.Listener("showMessage");
showMessageListener.onEvent = function (message) { messageHandler(message); }
Events.addListener(showMessageListener);

var showErrorListener = new Events.Listener("showError");
showErrorListener.onEvent = function (message) { errorHandler(message); }
Events.addListener(showErrorListener);

var hidden, visibilityChange;
if (typeof document.hidden !== "undefined") { // Opera 12.10 and Firefox 18 and later support 
  hidden = "hidden";
  visibilityChange = "visibilitychange";
} else if (typeof document.msHidden !== "undefined") {
  hidden = "msHidden";
  visibilityChange = "msvisibilitychange";
} else if (typeof document.webkitHidden !== "undefined") {
  hidden = "webkitHidden";
  visibilityChange = "webkitvisibilitychange";
}

function handleVisibilityChange() {
  if (document[hidden]) {
    console.log("page is no longer visible.");
    ProSystem.Pause(true);
    forceAdjustTimestamp = true;
  } else {
    console.log("page visible.");
    if (!ControlsBar.isPauseButtonDown()) {
      ProSystem.Pause(false);
    }
  }
}

document.addEventListener(visibilityChange, handleVisibilityChange, false);

export {
  init,
  startEmulation,
  restart,
  setMessageHandler,
  setErrorHandler
};