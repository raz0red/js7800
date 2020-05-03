import { unzip } from "./zip-site.js"
import { RomList } from "./romlist.js"
import * as Message from "./message.js"
import * as Util from "./util.js"
import * as Events from "./events.js"
import * as Buttons from "./buttons.js"
import * as Drop from "./drop.js"
import * as Storage from "./storage.js"
import * as HighScore from "./highscore.js"
import { SettingsDialog } from "./settings-dialog.js"
import { HelpDialog } from "./help-dialog.js"

import css from '../css/site.css'

var showMessage = Message.showMessage;
var hideMessage = Message.hideMessage;
var showErrorMessage = Message.showErrorMessage;
var getRequestParameter = Util.getRequestParameter;
var debug = false;

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

var loadingMessageId = null;
var loadMessageTimeout = 750;
var onEmulationStartedCb = null; 

function loadFromUrl(url) {
  var urlLower = url.toLowerCase();
  var forceList = (
    urlLower.endsWith(".json") || (urlLower.indexOf(".json?") != -1));

  loadingMessageId = showMessage('Loading...')

  if (!onEmulationStartedCb) {
    onEmulationStartedCb = new Events.Listener("onEmulationStarted",
      function() { hideMessage(loadingMessageId, loadMessageTimeout); });
    Events.addListener(onEmulationStartedCb);
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', Util.addRomUrlPrefix(url));
  xhr.responseType = 'blob';
  xhr.onload = function () {
    try {
      if (xhr.status >= 300 || xhr.stats < 200) {
        throw xhr.status + ": " + xhr.statusText;
      } else if (romList.loadListFromFile(xhr.response) || forceList) {
        hideMessage(loadingMessageId, loadMessageTimeout);
      } else {
        startEmulation(xhr.response);
      }
    } catch (e) {
      errorHandler(url + " (" + e + ")");
    }
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
  Events.addListener(
    new Events.Listener("fullscreen",
      function (isFullscreen) {
        fsSelect.style.display = isFullscreen ? "flex" : "none";
      }));

  return fsSelectSel;
}

function handleRequestParameters() {
    var main = js7800.Main;
    
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
}

function checkDebugParam() {
  // Log FPS
  var debugParam = getRequestParameter("debug");
  if (debugParam) {
    debugParam = debugParam.toLowerCase();
   return (debugParam === "1" || debugParam == "true");
  }    
  return false;
}

function init(in7800) {
  js7800 = in7800;
  var main = js7800.Main;
  var cbar = js7800.ControlsBar;
  Events.setParentEvents(js7800.Events);

  // Must be done prior to initializing js7800
  var fsSelect = createFullscreenSelect();

  // Configure and init js7800 module
  main.setErrorHandler(errorHandler);
  main.init('js7800__target');

  // Create the description
  var desc = main.descriptionDiv;
  desc.className = "instructs";
  desc.innerHTML = 
    '<div>Press the <img id="ins_settings_img" src="' + cbar.cogsImgSrc  + '"></img><span id="ins_settings" class="ilink">Settings button</span> to view keyboard mappings.</div>';
  desc.innerHTML +=
    '<div class="ihelp">Press the <img id="ins_help_img" src="' + cbar.infoImgSrc  + '"></img><span id="ins_help" class="ilink">Help button</span> for usage instructions.</div>';
  
  var fSettings = function() { cbar.settingsButton.onClick(); };
  var fHelp = function() { cbar.helpButton.onClick(); };
  document.getElementById('ins_settings').onclick = fSettings;
  document.getElementById('ins_settings_img').onclick = fSettings;
  document.getElementById('ins_help').onclick = fHelp;
  document.getElementById('ins_help_img').onclick = fHelp;

  // js7800 parent element
  var parent = document.getElementById('js7800__fullscreen-container');

  // Create the settings dialog  
  var settingsDialog = new SettingsDialog();  
  cbar.settingsButton.onClick = function () { settingsDialog.show(); }

  // Create the help dialog  
  var helpDialog = new HelpDialog();  
  cbar.helpButton.onClick = function () { helpDialog.show(); }

  // Rom list component
  romList = new RomList(
    [document.getElementById('cartselect__select'), fsSelect]);

  // Check whether debug has been set
  debug = checkDebugParam();
  main.setLogFps(debug);

  // Fire init event
  Events.fireEvent("siteInit", {
    js7800: js7800,
    romList: romList,
    loadFromUrl: loadFromUrl,
    startEmulation: startEmulation,
    errorHandler: errorHandler,
    debug: debug,
    HighScore: HighScore,
  });

  // Build the dialogs
  parent.appendChild(settingsDialog.createElement());
  parent.appendChild(helpDialog.createElement());

  // Show error event listener
  Events.addListener(new Events.Listener("showError",
    function (message) { errorHandler(message); }));

  // Load preferences
  Storage.loadPrefs();

  // Handle request parameters
  handleRequestParameters();
}

export { init }
