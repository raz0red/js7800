import * as Events from "./events.js"
import * as Util from "./util.js"
import * as Storage from "./storage.js"
import * as Message from "./message.js"
import highScoreRom64 from "../roms/Highscore.rom"
import highScorePalRom64 from "../roms/HighscorePAL.rom"

var addProps = Util.addProps;

var SRAM_SIZE = 2048;
var SRAM_OFFSET = 0x1000;
var SRAM_SCORE_OFFSET = 0x113D;

var WRITE_DELAY = 2000; // 2 seconds
var STORAGE_KEY = "highScoreSRAM";

var GLOBAL_DEFAULT = true;
var ENABLED_DEFAULT = true;
var FALLBACK_DEFAULT = true;

var js7800 = null;
var Main = null;
var debug = false;

var highScoreRom = null;
var highScorePalRom = null;
var hsNullCallback = null;
var hsCallback = null;

var pending = 0;
var timeoutId = null;
var sessionId = null;
var digest = null;
var isGlobal = GLOBAL_DEFAULT;
var curGlobal = isGlobal;
var isEnabled = ENABLED_DEFAULT;
var isFallbackEnabled = FALLBACK_DEFAULT;

var sram = new Array(SRAM_SIZE);

function generateDefaultSram(s) {
  for (var i = 0; i < s.length; i++) {
    s[i] = 0;
  }
  var h = "AABog6pVnAILDgIACx0LBAADBBEBDgARAx8AAAAAAAAAAAAAAAAAABE";
  for (var i = 0; i < 183; i++) h += "A";
  h += "B";
  for (var i = 0; i < 45; i++) h += '/f39';
  h += "/f38";
  base64toSram(h, s);
}

function sramToBase64(s) {
  var out = "";
  for (var i = 0; i < s.length; i++) {
    out += String.fromCharCode(s[i]);
  }
  return btoa(out);
}

function base64toSram(h, s) {
  var b = atob(h);
  for (var i = 0; i < b.length; i++) {
    s[i] = b.charCodeAt(i);
  }
}

function onCartLoaded() {
  // Save any pending writes
  saveSram();

  // Generate a new GUID
  sessionId = Util.generateUuid();

  // Store cartridge digest
  digest = js7800.Cartridge.GetDigest();

  // Set global
  curGlobal = isGlobal;

  // Set the high score callback appropriately
  Main.setHighScoreCallback(
    (isEnabled && (Storage.isLocalStorageEnabled() || curGlobal)) ?
      hsCallback : hsNullCallback);
}

function onSramWrite(address, data) {
  var change = false;
  if (sram[address - SRAM_OFFSET] != data) {
    sram[address - SRAM_OFFSET] = data;
    change = true;
  }

  if (change && (address >= SRAM_SCORE_OFFSET)) {
    pending++;
    if (timeoutId == null) {
      timeoutId = setTimeout(function () {
        timeoutId = null;
        saveSram();
      }, WRITE_DELAY);
    }
  }

  if (debug && (address >= SRAM_SCORE_OFFSET)) {
    if (change) {
      console.log("HSC pending write: 0x" + address.toString(16) +
        " = 0x" + data.toString(16) + ", " + pending);
    } else {
      console.log("HSC pending write ignored (no change): 0x" + address.toString(16) +
        " = 0x" + data.toString(16) + ", " + pending);
    }
  }
}

function loadSramGlobal(success, failure) {
  console.log("Reading High Score SRAM from global storage.");

  // Show message
  var startTime = Date.now();
  var mid = Message.showMessage("Loading global leaderboard...");

  var xhr = new XMLHttpRequest();
  xhr.open('GET', Util.getUrlPrefix() + "/load.php?d=" + digest);
  xhr.onload = function () {
    if (xhr.status == 200) {
      // Success
      console.log("Successfully read global leaderboard for game");
      try {
        base64toSram(xhr.responseText, sram);
      } catch (e) {
        failure("Error converting SRAM: " + e);
        return;
      }
      success(sram);

      // Hide message
      Message.hideMessage(mid, 1000);
    } else if(xhr.status == 204) {
      var localSram = null;
      // Attempt to use local storage (callbacks are synchronous)
      if (isFallbackEnabled) {
        loadSramLocal(
          function(sram) { localSram = sram; curGlobal = false; },
          function() {} );
      }

      // Rom not supported
      var msg = "Global loaderboard not currently supported for this game.";
      if (!curGlobal) {
        msg += "<br><br>Using local storage for high scores.";
      }

      mid = Message.showMessage(msg);
      console.log(msg);
      success(localSram);
      Message.hideMessage(mid, curGlobal ? 1500 : 3000);
    } else {
      failure("Error reading global leaderboard (" +
        xhr.status + ": " + xhr.statusText +")");
    }
  }
  xhr.onerror = function() {
    failure("Error reading global leaderboard.<br>(see console log for details)");
  }
  xhr.send();
}

function loadSramLocal(success, failure) {
  console.log("Reading High Score SRAM from local storage.");
  try {
    var h = Storage.readValue(STORAGE_KEY, true);
    if (h) {
      console.log("Found High Score SRAM in local storage.");
      try {
        base64toSram(h, sram);
      } catch (e) {
        failure("Error converting SRAM: " + e);
        return;
      }
    } else {
      console.log("Not able to find High Score SRAM in local storage.");
    }
    success(sram);
  } catch (e) {
    failure(e);
  }
}

function loadSram(postLoadCallback) {
  var fSuccess = function (sram) {
    postLoadCallback(sram);
  };
  var fFailure = function(message) {
    console.log(message);
    Events.fireEvent("showError", message);
    postLoadCallback(null);
  };

  if (curGlobal) {
    loadSramGlobal(fSuccess, fFailure);
  } else {
    loadSramLocal(fSuccess, fFailure);
  }
}

function saveSramGlobal() {
  console.log("Writing High Score SRAM to global storage.");
  var xhr = new XMLHttpRequest();
  xhr.open('POST', Util.getUrlPrefix() + "/save.php?sid=" + sessionId + "&d=" + digest);
  xhr.onload = function () {
    if (xhr.status == 200) {
      console.log("Successfully saved global high scores for game");
    } else {
      console.log(e);
      Events.fireEvent("showError",
        "Error saving global high scores (" +
          xhr.status + ": " + xhr.statusText +")");
    }
  }
  xhr.onerror = function() {
    Events.fireEvent("showError",
      "Error saving global high scores.<br>(see console log for details)");
  }
  xhr.send(sramToBase64(sram));
}

function saveSramLocal() {
  console.log("Writing High Score SRAM to local storage.");
  Storage.writeValue(STORAGE_KEY, sramToBase64(sram), true);
}

function saveSram() {
  if (timeoutId != null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (pending) {
    pending = 0;
    console.log("HSC Scores have changed, saving.");

    try {
      if (curGlobal) {
        saveSramGlobal()
      } else {
        saveSramLocal();
      }
    } catch (e) {
      console.log(e);
      Events.fireEvent("showError", e);
    }
  } else {
    console.log("HSC Scores have not changed, ignoring.");
  }
}

function init(event) {
  js7800 = event.js7800;
  Main = js7800.Main;

  // Set the debug flag
  debug = event.debug;

  // Generate the default SRAM
  generateDefaultSram(sram);

  // Get high score ROM
  highScoreRom = atob(highScoreRom64.split(',')[1]);
  console.log("High score rom: " + js7800.md5(highScoreRom));
  highScorePalRom = atob(highScorePalRom64.split(',')[1]);
  console.log("High score rom (PAL): " + js7800.md5(highScorePalRom));


  // Register listener for onCartridgeLoaded
  Events.addListener(new Events.Listener("onCartridgeLoaded", onCartLoaded));

  // Create and set high score callback
  hsNullCallback = new Main.HighScoreCallback();
  hsCallback = new Main.HighScoreCallback();
  addProps(hsCallback, {
    getRom: function () { return highScoreRom; },
    getPalRom: function() { return highScorePalRom; },
    write: function (address, data) { onSramWrite(address, data); },
    loadSram: function (postLoadCallback) { loadSram(postLoadCallback); }
  });

  // Add ability to dump state if in debug mode
  if (debug) {
    document.addEventListener('keydown', function (e) {
      if (e.keyCode == 119 /* F8 */) {
        console.log(sramToBase64(sram));
      }
    });
  }
}

function setEnabled(val) {
  isEnabled = val;
}

function getEnabled() {
  return isEnabled;
}

function getEnabledDefault() {
  return ENABLED_DEFAULT;
}

function setGlobal(val) {
  isGlobal = val;
}

function getGlobal() {
  return isGlobal;
}

function getGlobalDefault() {
  return GLOBAL_DEFAULT;
}

function setLocalFallback(val) {
  isFallbackEnabled = val;
}

function isLocalFallback() {
  return isFallbackEnabled;
}

function getLocalFallbackDefault() {
  return FALLBACK_DEFAULT;
}

function getDigest() {
  return digest;
}

Events.addListener(
  new Events.Listener("siteInit", function (event) { init(event) }));

export {
  SRAM_SIZE,
  generateDefaultSram,
  sramToBase64,
  base64toSram,
  setEnabled,
  getEnabled,
  getEnabledDefault,
  getGlobal,
  setGlobal,
  getGlobalDefault,
  isLocalFallback,
  setLocalFallback,
  getLocalFallbackDefault,
  getDigest
}
