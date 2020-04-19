import { unzip } from "./zip-site.js"
import { RomList } from "./romlist.js"
import * as Message from "./message.js"
import * as Util from "./util.js"
import * as Events from "./events.js"
import * as Buttons from "./buttons.js"
import * as Drop from "./drop.js"
import { SettingsDialog } from "./settings-dialog.js"

import css from '../css/site.css'

var showMessage = Message.showMessage;
var hideMessage = Message.hideMessage;
var showErrorMessage = Message.showErrorMessage;
var getRequestParameter = Util.getRequestParameter;

var js7800 = null;
var romList = null;

var errorHandler = function (error, logToConsole) {
  if (logToConsole == undefined) {
    logToConsole = true;
  }
  if (logToConsole) {
    console.error(error);
  }
  showErrorMessage(error);
}

function startEmulation(blob) {
  unzip(blob,
    function (file) {
      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onloadend = function () {
        var result = reader.result;
        var len = result.length;
        var cart = new Array(len);
        for (var i = 0; i < len; i++) {
          cart[i] = result.charCodeAt(i);
        }
        js7800.Main.startEmulation(cart);
      }
    },
    errorHandler
  );
}

function loadFromUrl(url) {
  var start = Date.now()
  var minWait = 750;
  var urlLower = url.toLowerCase();
  var forceList = (
    urlLower.endsWith(".json") || (urlLower.indexOf(".json?") != -1));

  showMessage('Loading...')

  var xhr = new XMLHttpRequest();
  xhr.open('GET', Util.addUrlPrefix(url));
  xhr.responseType = 'blob';
  xhr.onload = function () {
    try {
      if (xhr.status >= 300 || xhr.stats < 200) {
        throw xhr.status + ": " + xhr.statusText;
      } else if (!romList.loadListFromFile(xhr.response) && !forceList) {
        startEmulation(xhr.response);
      }
    } catch (e) {
      errorHandler(url + " (" + e + ")");
    }

    var elapsed = Date.now() - start;
    var wait = elapsed > minWait ? 0 : minWait - elapsed;
    setTimeout(hideMessage, wait);
  }
  xhr.onerror = function () {
    errorHandler(
      'An error occurred during the load attempt.<br>(see console log for details)',
      false
    )
  };
  xhr.send();
}

function createFullscreenSelect() {
  var cbar = js7800.ControlsBar;
  
  // The js7800 module events vs. the site events
  var js7800Events = js7800.Events;

  // Create full screen cartridge select
  var fsSelect = document.createElement("div");
  var fsSelectSel = document.createElement("select");
  fsSelect.appendChild(fsSelectSel);

  // Create the component in the command bar
  var fsSelectComp = new cbar.Component();
  Util.addProps(fsSelectComp, {
    getClass: function () { return "fsselect"; },
    doCreateElement: function () { return fsSelect; }
  });
  cbar.getGroup(1).addChildAtIndex(2, fsSelectComp);

  // Listen for full screen change vents
  js7800Events.addListener(
    new js7800Events.Listener("fullscreen",
      function (isFullscreen) {
        fsSelect.style.display = isFullscreen ? "flex" : "none";
      }));

  return fsSelectSel;
}

function init(in7800) {
  js7800 = in7800;
  var main = js7800.Main;
  var cbar = js7800.ControlsBar;

  // Must be done prior to initializing js7800
  var fsSelect = createFullscreenSelect();

  // Configure and init js7800 module
  main.setMessageHandler(showMessage);
  main.setErrorHandler(errorHandler);
  main.init('js7800__target');

  // js7800 parent element
  var parent = document.getElementById('js7800__fullscreen-container');

  // Create the settings dialog  
  var settingsDialog = new SettingsDialog();  
  parent.appendChild(settingsDialog.createElement());
  cbar.settingsButton.onClick = function () { settingsDialog.show(); }

  // Rom list component
  romList = new RomList(
    [document.getElementById('cartselect__select'), fsSelect]);

  // Fire init event
  Events.fireEvent("init", {
    js7800: js7800,
    romList: romList,
    loadFromUrl: loadFromUrl,
    startEmulation: startEmulation,
    errorHandler: errorHandler
  });

  //
  // Handle request parameters
  //

  // ROM list
  var rlist = getRequestParameter("romlist");
  if (!rlist) {
    rlist = 'roms/romlist-homebrew.json';
  }
  romList.loadListFromUrl(rlist);

  // ROM
  var rom = getRequestParameter("rom");
  if (rom) {
    loadFromUrl(rom);
  }

  // Log FPS
  var logFps = getRequestParameter("fps");
  if (logFps) {
    logFps = logFps.toLowerCase();
    main.setLogFps(logFps === "1" || logFps == "true");
  }
}

export { init }
