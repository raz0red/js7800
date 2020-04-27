import * as Events from "./events.js"

var prefs = {}
var P1_MAP_NAME = "p1map";
var P2_MAP_NAME = "p2map";
var CONSOLE_MAP_NAME = "consoleMap";

var js7800 = null;
var kb = null;

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
  try {
    var prefsStr = localStorage.getItem("prefs");
    if (prefsStr) {
      prefs = JSON.parse(localStorage.getItem("prefs"));
      loadKeyboardMappings(P1_MAP_NAME, kb.p1KeyMap);
      loadKeyboardMappings(P2_MAP_NAME, kb.p2KeyMap);
      loadConsoleMappings();
    }
  } catch (e) {
    Events.fireEvent("showError", "An error occurred loading preferences: " + e);
    prefs = {};
  }
}

function savePrefs() {
  try {
    storeKeyboardMappings(P1_MAP_NAME, kb.p1KeyMap);
    storeKeyboardMappings(P2_MAP_NAME, kb.p2KeyMap);
    storeConsoleMappings();
    localStorage.setItem("prefs", JSON.stringify(prefs));
  } catch (e) {
    Events.fireEvent("showError", "An error occurred saving preferences: " + e);
  }
}

function writeValue(name, value) {
  try {
    localStorage.setItem(name, value);
  } catch (e) {
    Events.fireEvent("showError", 
      "An error occurred attempting to save '" + name + "': " + e);
  }
}

function readValue(name) {
  try {
    return localStorage.getItem(name);
  } catch (e) {
    Events.fireEvent("showError", 
    "An error occurred attempting to save '" + name + "': " + e);
  }
  return null;
}

Events.addListener(new Events.Listener("init",
  function (event) {
    js7800 = event.js7800;
    kb = js7800.Keyboard;
  }));

export {
  loadPrefs,
  savePrefs,
  writeValue,
  readValue
}
