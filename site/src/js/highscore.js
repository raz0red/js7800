import * as Events from "./events.js"
import * as Util from "./util.js"
import * as Storage from "./storage.js"
import highScoreRom64 from "../roms/Highscore.rom"

var addProps = Util.addProps;

var SRAM_SIZE = 2048;
var SRAM_OFFSET = 0x1000;
var SRAM_SCORE_START = 0x113D;
var WRITE_DELAY = 5000; // 5 seconds
var STORAGE_KEY = "highScoreSRAM";

var js7800 = null;
var debug = false;

var highScoreRom = null;
var hsCallback = null;
var sram = new Array(SRAM_SIZE);
var pending = 0;
var timeoutId = null;

function generateDefaultSram() {
  for (var i = 0; i < sram.length; i++) {
    sram[i] = 0;
  }
  var h = "AABog6pVnAILDgIACx0LBAADBBEBDgARAx8AAAAAAAAAAAAAAAAAABE";
  //var h = "AABog6pVnAIJEhsSBBUEDRsECAYHExsODhwLDgIACx8AAAAAAAAAABc";
  for (var i = 0; i < 183; i++) h += "A";
  h += "B";
  for (var i = 0; i < 45; i++) h += '/f39';
  h += "/f38";
  base64toSram(h);
}

function sramToBase64() {
  var out = "";
  for (var i = 0; i < SRAM_SIZE; i++) {
    out += String.fromCharCode(sram[i]);
  }      
  return btoa(out);
}

function base64toSram(h) {
  var b = atob(h);
  for (var i = 0; i < b.length; i++) {
    sram[i] = b.charCodeAt(i);
  }
}

function onCartLoaded() {
  saveSram();
}

function onSramWrite(address, data) {
  //console.log("HSC Write: 0x" + address.toString(16) + " = 0x" + data.toString(16));  
  sram[address - SRAM_OFFSET] = data;

  if (address >= SRAM_SCORE_START) {
    pending++;
    if (debug) {
      console.log("HSC pending write: 0x" + address.toString(16) + " = 0x" + data.toString(16));  
    }
    if (timeoutId == null) {
      timeoutId = setTimeout( function() {
          timeoutId = null;
          saveSram();
        }, WRITE_DELAY);
    }
  }
}

function loadSram() {
  console.log("Reading High Score SRAM from local storage.");
  var h = Storage.readValue(STORAGE_KEY);
  if (h) {
    console.log("Found High Score SRAM in local storage.");
    base64toSram(h);
  } else {
    console.log("Not able to find High Score SRAM in local storage.");
  }
  return sram;
}

function saveSram() {
  if (timeoutId != null) {
    clearTimeout(timeoutId);
    timeoutId = null;
  }

  if (pending > 0) {
    console.log("Writing High Score SRAM to local storage.");
    Storage.writeValue(STORAGE_KEY, sramToBase64());
    pending = 0;
  }
}

function init(event) {
  js7800 = event.js7800;
  var Main = js7800.Main;

  // Set the debug flag 
  debug = event.debug;

  // Generate the default SRAM
  generateDefaultSram();

  // Get high score ROM
  highScoreRom = atob(highScoreRom64.split(',')[1]);
  console.log("High score rom: " + js7800.md5(highScoreRom));

  // Register listener for onCartridgeLoaded
  js7800.Events.addListener(
    new js7800.Events.Listener( "onCartridgeLoaded", onCartLoaded));

  // Create and set high score callback
  hsCallback = new Main.HighScoreCallback();
  addProps(hsCallback, {
    getRom: function () { return highScoreRom; },
    write: function (address, data) { onSramWrite(address, data); },
    loadSram: function () { return loadSram(); }
  });
  Main.setHighScoreCallback(hsCallback);

  // Add ability to dump state if in debug mode
  if (debug) {
    document.addEventListener('keydown',
      function (e) {
        if (e.keyCode == 119 /* F8 */) {
          console.log(sramToBase64());
        }
      });
  }
}

Events.addListener(
  new Events.Listener( "init", function (event) {init(event) }));
