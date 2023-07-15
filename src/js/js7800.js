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
import * as Region from "./prosystem/Region.js"

import 'fullscreen-api-polyfill'

import css from '../css/js7800.css'
import logoImageSrc from '../images/Atari_7800_Logo.png'

function HighScoreCallback() {}
HighScoreCallback.prototype = {
  getRom: function () { return null; },
  write: function (address, data) { },
  loadSram: function (postLoadCallback) { postLoadCallback(null); }
};

var executeFrame = ProSystem.ExecuteFrame;
var soundStore = Sound.Store;
var updateInput = Input.updateInput;
var flipImage = Video.flipImage;

var mainContainer = null;
var innerContainer = null;
var descriptionDiv = null;
var canvas = null;
var controlsDiv = null;
var logoDiv = null;
var starting = false;
var currentCart = null;
var highScoreCallback = new HighScoreCallback();
var debug = false;
var VSYNC_DEFAULT = true;
var vsync = VSYNC_DEFAULT;
var SKIP_LEVEL_DEFAULT = 0;
var skipLevel = SKIP_LEVEL_DEFAULT;
var fskip = 0;
var fskipcount = 0;

var errorHandler = function (message) {
  alert(message);
}

/** The keyboard data */
var keyboardData = new Array(19);

var initialized = false;
var forceAdjustTimestamp = false;

function sync(callback, afterTimeout) {
  if (vsync) {
    requestAnimationFrame(callback);
  } else {
    if (!afterTimeout) {
      setTimeout(callback, 0);
    } else {
      callback();
    }
  }
}

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
  console.log("  XM: %s, mode: %s",
    Cartridge.IsXmEnabled() ? "true" : "false",
    (Cartridge.GetXmMode() == 2 ? "Automatic" : (Cartridge.GetXmMode() ? "Enabled" : "Disabled"))
  );
  console.log("  Right switch: %d", Cartridge.GetRightSwitch());
  console.log("  Left switch: %d", Cartridge.GetLeftSwitch());
  console.log("  Swap buttons: %s", Cartridge.IsSwapButtons() ? "true" : "false");
  console.log("  Dual analog: %s", Cartridge.IsDualAnalog() ? "true" : "false");
  console.log("  Hblank: %d", Cartridge.GetHblank());
  console.log("  Crosshair X: %d", Cartridge.GetCrossX());
  console.log("  Crosshair Y: %d", Cartridge.GetCrossY());
  console.log("  High score cart enabled: %s", Cartridge.IsHighScoreCartEnabled() ? "true" : "false");

  // Fire on cartridge loaded event
  Events.fireEvent("onCartridgeLoaded", Cartridge);

  // Reset keyboard data
  Input.resetKeyboardData();

  init();

  // Callback after reset
  var postResetCallback = function() {
    Events.fireEvent("onEmulationStarted", null);

    starting = false;

    // Update frame skip
    updateFrameSkip();

    var start = Date.now();
    var fc = 0;
    var frequency = ProSystem.GetFrequency();
    var debugFrequency = frequency * 10;
    var frameTicks = (1000.0 / frequency) /*| 0*/;
    var adjustTolerance = (frameTicks * frequency * 2); // 2 secs
    var isActive = ProSystem.IsActive;
    var isPaused = ProSystem.IsPaused;
    var fs = 0;
    var avgWait = 0;

    // Enable mouse tracking if lightgun game
    Mouse.enableMouseTracking(Cartridge.IsLightGunEnabled());

    console.log("Frame ticks: " + frameTicks);
    console.log("Frequency: " + frequency);

    var f = function () {
      if (isActive()) {

        if (!isPaused()) {
          updateInput();
          executeFrame(keyboardData);

          // Frame skipping
          if ((fskip == 0) || (fs >= fskip)) {
            flipImage();
          }
          if (++fs >= fskipcount) {
            fs = 0;
          }

          soundStore();

          nextTimestamp += frameTicks;
          var now = Date.now();
          if (((nextTimestamp + adjustTolerance) < now) || forceAdjustTimestamp) {
            forceAdjustTimestamp = false;
            nextTimestamp = now;
            fc = 0;
            start = now;
            avgWait = 0;
            console.log("adjusted next timestamp.");
          }
          var wait = (nextTimestamp - now);
          avgWait += wait;
          if (wait > 0) {
            setTimeout(function () { sync(f, true); }, wait);
          } else {
            sync(f, false);
          }

          fc++;
          if ((fc % debugFrequency) == 0) {
            var elapsed = Date.now() - start;
            if (debug) {
              console.log("v:%s, vsync: %d, %stimer: %d, wsync: %d, %d, stl: %d, mar: %d, cpu: %d, ext: %d",
                (1000.0 / (elapsed / fc)).toFixed(2),
                vsync ? 1 : 0,
                (vsync ? "" : ("wait: " + ((avgWait / fc) * frequency).toFixed(2) + ", ")),
                (Riot.GetTimerCount() % 1000),
                ProSystem.GetDebugWsync() ? 1 : 0,
                ProSystem.GetDebugWsyncCount(),
                ProSystem.GetDebugCycleStealing() ? 1 : 0,
                ProSystem.GetDebugMariaCycles(),
                ProSystem.GetDebug6502Cycles(),
                ProSystem.GetDebugSavedCycles());
            }
            start = Date.now();
            fc = 0;
            avgWait = 0;
          }
        } else {
          setTimeout(function () {
            forceAdjustTimestamp = true;
            sync(f, true);
          }, 100);
        }
      }
    };
    var nextTimestamp = Date.now() + frameTicks;
    setTimeout(function () { sync(f, true) }, frameTicks);
  };
  // Reset w/ callback
  ProSystem.Reset(postResetCallback);
}

function restart() {
  if (currentCart) {
    startEmulation(currentCart, true);
  }
}

var hideTitleCb = null;
function startEmulation(cart, isRestart) {
  if (starting) {
    return;
  }

  // Mark that emulation is starting
  starting = true;

  if (ProSystem.IsActive()) {
    ProSystem.Close();
  }

  if (!hideTitleCb) {
    hideTitleCb = new Events.Listener("onEmulationStarted",
      function() {
        Video.stopScreenSnow();
        if (!logoDiv.classList.contains('js7800__logo--hide')) {
          logoDiv.classList.add('js7800__logo--hide');
          logoDiv.classList.remove('js7800__logo--show');

          // Should not be necessary, but makes sure is not displayed
          setTimeout(function () {
            logoDiv.style.display = 'none';
          }, 1000);
        }
      }
    );
    Events.addListener(hideTitleCb);
  }

  setTimeout(function () {
    startEmu(cart, isRestart);
  }, 200);
}

function addElements(id) {
  var container = document.getElementById(id);
  if (!container) {
    throw "Unable to find element with id: " + id;
  }

  // border-container
  mainContainer = document.createElement("div");
  mainContainer.className = mainContainer.id = "js7800";
  container.appendChild(mainContainer);

  // fullscreen-container
  var fullscreenContainer = document.createElement("div");
  fullscreenContainer.id = "js7800__fullscreen-container";
  mainContainer.appendChild(fullscreenContainer);

  // inner-container
  innerContainer = document.createElement("div");
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
  logoImage.className = 'atari7800';
  logoDiv.appendChild(logoImage);

  // controls
  controlsDiv = document.createElement("div");
  controlsDiv.id = controlsDiv.className = "js7800__controls";
  fullscreenContainer.appendChild(controlsDiv);
}

function init(id, props) {
  if (!initialized) {
    initialized = true;

    // Add the HTML elements
    addElements(id);

    debug = false;
    if (props) {
      if (props.debug) {
        debug = props.debug;
      }
    }

    // Fire init event
    Events.fireEvent("init", {
      canvas: canvas,
      mainContainer: mainContainer,
      innerContainer: innerContainer,
      controlsDiv: controlsDiv,
      keyboardData: keyboardData,
      Region: Region,
      debug: debug
    });

    // Description
    descriptionDiv = document.createElement("div");
    logoDiv.appendChild(descriptionDiv);

    Video.startScreenSnow();
    logoDiv.classList.add('js7800__logo--show');

    // Restart event listener
    Events.addListener(new Events.Listener("restart", restart));
  }
}

function setErrorHandler(handler) {
  errorHandler = handler;
}

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

function setHighScoreCallback(cb) {
  highScoreCallback = cb;

  // Fire hs callback changed event
  Events.fireEvent("highScoreCallbackChanged", highScoreCallback);
}

function isVsyncEnabled() {
  return vsync;
}

function setVsyncEnabled(val) {
  vsync = val;
}

function getVsyncEnabledDefault() {
  return VSYNC_DEFAULT;
}

function updateFrameSkip() {
  var freq = ProSystem.GetFrequency();
  if (freq == 60) {
    switch (skipLevel) {
      case 0:
        fskip = 0; fskipcount = 0;
        break;
      case 1:
        fskip = 1; fskipcount = 4;
        break;
      case 2:
        fskip = 1; fskipcount = 2;
        break;
      case 3:
        fskip = 3; fskipcount = 4;
        break;
    }
  } else {
    switch (skipLevel) {
      case 0:
        fskip = 0; fskipcount = 0;
        break;
      case 1:
        fskip = 1; fskipcount = 5;
        break;
      case 2:
        fskip = 1; fskipcount = 2;
        break;
      case 3:
        fskip = 4; fskipcount = 5;
        break;
    }
  }
  console.log("Updated skip count: "+ fskip + ", " + fskipcount);
}

function getSkipLevelDefault() {
  return SKIP_LEVEL_DEFAULT;
}

function getSkipLevel() {
  return skipLevel;
}

function setSkipLevel(val) {
  skipLevel = val;
  updateFrameSkip();
}

function saveState() {
  return ProSystem.ProSystemSave();
}

function loadState(buffer) {
  return ProSystem.ProSystemLoad(buffer);
}

document.addEventListener(visibilityChange, handleVisibilityChange, false);

export {
  init,
  startEmulation,
  saveState,
  loadState,
  restart,
  setErrorHandler,
  setHighScoreCallback,
  HighScoreCallback,
  descriptionDiv,
  isVsyncEnabled,
  setVsyncEnabled,
  getVsyncEnabledDefault,
  getSkipLevelDefault,
  getSkipLevel,
  setSkipLevel
}