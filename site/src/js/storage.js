import * as Events from "./events.js"

var prefs = {}
var P1_MAP_NAME = "p1map";
var P2_MAP_NAME = "p2map";
var CONSOLE_MAP_NAME = "consoleMap";
var DISPLAY_FILTER = "displayFilter";
var DISPLAY_RATIO = "displayRatio";
var DISPLAY_SIZE = "displaySize";
var HS_ENABLED = "hsEnabled";
var HS_GLOBAL = "hsGlobal";
var PALETTE = "palette";
var FS = "fullscreen";
var XM_MODE = "xmMode";

var js7800 = null;
var kb = null;
var video = null;
var region = null;
var HighScore = null;
var Cartridge = null;

var localStorageEnabled = false;

function checkLocalStorageAvailable(){
  var test = 'test';
  try {
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      localStorageEnabled = true;
      console.log("Local storage is available.");
  } catch(e) {
    console.log("Local storage is not available.");
  }
}

function storeKeyboardMappings(name, map) {
  prefs[name] = {
    left: map.getLeft(),
    right: map.getRight(),
    up: map.getUp(),
    down: map.getDown(),
    b1: map.getButton1(),
    b2: map.getButton2()
  };
}

function loadKeyboardMappings(name, map) {
  var mapIn = prefs[name];
  if (mapIn != undefined) {
    for (var k in mapIn) {
      var v = mapIn[k];
      switch (k) {
        case "left": map.setLeft(v);
        case "right": map.setRight(v);
        case "up": map.setUp(v);
        case "down": map.setDown(v);
        case "b1": map.setButton1(v);
        case "b2": map.setButton2(v);
      }
    }
  }
}

function storeConsoleMappings() {
  prefs[CONSOLE_MAP_NAME] = {
    pause: kb.getPauseKey(),
    select: kb.getSelectKey(),
    reset: kb.getResetKey()
  };
}

function loadConsoleMappings() {
  var mapIn = prefs[CONSOLE_MAP_NAME];
  if (mapIn != undefined) {
    for (var k in mapIn) {
      var v = mapIn[k];
      switch (k) {
        case "pause": kb.setPauseKey(v);
        case "select": kb.setSelectKey(v);
        case "reset": kb.setResetKey(v);
      }
    }
  }
}

function loadPrefs() {
  if (!localStorageEnabled) {
    console.log("Unable to load preferences, local storage disabled.");
    return;
  }

  try {
    var prefsStr = localStorage.getItem("prefs");
    if (prefsStr) {
      prefs = JSON.parse(localStorage.getItem("prefs"));
      loadKeyboardMappings(P1_MAP_NAME, kb.p1KeyMap);
      loadKeyboardMappings(P2_MAP_NAME, kb.p2KeyMap);
      loadConsoleMappings();
      var filter = prefs[DISPLAY_FILTER];
      if (filter !== undefined ) video.setFilterEnabled(filter);
      var ratio = prefs[DISPLAY_RATIO];
      if (ratio !== undefined ) video.setScreenRatio(ratio);
      var size = prefs[DISPLAY_SIZE];
      if (size !== undefined ) video.setScreenSize(size);
      var hsEnabled = prefs[HS_ENABLED];
      if (hsEnabled !== undefined ) HighScore.setEnabled(hsEnabled);
      var hsGlobal = prefs[HS_GLOBAL];
      if (hsGlobal !== undefined ) HighScore.setGlobal(hsGlobal);
      var palette = prefs[PALETTE];
      if (palette !== undefined ) region.setPaletteIndex(palette);
      var xmMode = prefs[XM_MODE];
      if (xmMode !== undefined ) Cartridge.SetXmMode(xmMode);
      var fs = prefs[FS];
      if (fs !== undefined ) video.setFullscreenMode(fs);
    }
  } catch (e) {
    Events.fireEvent("showError", "An error occurred loading preferences: " + e);
    prefs = {};
  }
}

function savePrefs() {
  if (!localStorageEnabled) {
    console.log("Unable to save preferences, local storage disabled.");
    return;
  }

  try {
    storeKeyboardMappings(P1_MAP_NAME, kb.p1KeyMap);
    storeKeyboardMappings(P2_MAP_NAME, kb.p2KeyMap);
    storeConsoleMappings();
    prefs[DISPLAY_FILTER] = video.isFilterEnabled();
    prefs[DISPLAY_SIZE] = video.getScreenSize();
    prefs[DISPLAY_RATIO] = video.getScreenRatio();
    prefs[HS_ENABLED] = HighScore.getEnabled();
    prefs[HS_GLOBAL] = HighScore.getGlobal();
    prefs[PALETTE] = region.getPaletteIndex();
    prefs[FS] = video.getFullscreenMode();
    prefs[XM_MODE] = Cartridge.GetXmMode();

    localStorage.setItem("prefs", JSON.stringify(prefs));
  } catch (e) {
    Events.fireEvent("showError", "An error occurred saving preferences: " + e);
  }
}

function writeValue(name, value, throwError) {
  if (!localStorageEnabled) {
    var message = "Unable to write '" + name + "', local storage disabled.";
    if (throwError) {
      throw message;
    } else {
      console.log(message);
      return false;
    }
  }

  try {
    localStorage.setItem(name, value);
  } catch (e) {
    var message = "An error occurred attempting to save '" + name + "': " + e;
    if (throwError) {
      throw message;
    } else {
      Events.fireEvent("showError", message);
      return false;
    }
  }
  return true;
}

function readValue(name, throwError) {
  if (!localStorageEnabled) {
    var message = "Unable to read '" + name + "', local storage disabled.";
    if (throwError) {
      throw message;
    } else {
      console.log(message);
      return;
    }
  }

  try {
    return localStorage.getItem(name);
  } catch (e) {
    var message = "An error occurred attempting to load '" + name + "': " + e;
    if (throwError) {
      throw message;
    } else {
      Events.fireEvent("showError", message);
    }
  }
  return null;
}

function isLocalStorageEnabled() {
  return localStorageEnabled;
}

Events.addListener(new Events.Listener("siteInit",
  function (event) {
    js7800 = event.js7800;
    kb = js7800.Keyboard;
    video = js7800.Video;
    region = js7800.Region;
    Cartridge = js7800.Cartridge;
    HighScore = event.HighScore;
    checkLocalStorageAvailable();    
  }));

export {
  loadPrefs,
  savePrefs,
  writeValue,
  readValue,
  isLocalStorageEnabled
}
