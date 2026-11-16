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
import messageCss from '../css/common/message-common.css'

var showMessage = Message.showMessage;
var hideMessage = Message.hideMessage;
var showErrorMessage = Message.showErrorMessage;
var getRequestParameter = Util.getRequestParameter;
var getRequestParameterToEnd = Util.getRequestParameterToEnd;
var highScoreCartEnabled = false;
var debug = false;
var embed = false;

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

function startEmulation(blob, fromSelect) {
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
        if (!fromSelect) {
          romList.resetSelection();
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

function loadFromUrl(url, fromSelect) {
  var urlLower = url.toLowerCase();
  var forceList = (
    urlLower.endsWith(".json") || (urlLower.indexOf(".json?") != -1));

  loadingMessageId = showMessage('Loading...')

  if (!onEmulationStartedCb) {
    onEmulationStartedCb = new Events.Listener("onEmulationStarted",
      function () { hideMessage(loadingMessageId, loadMessageTimeout); });
    Events.addListener(onEmulationStartedCb);
  }

  const tryPrefix2 = function(url) {
    var url2 = Util.addRomUrlPrefix2(url);
    if (!url2) {
      throw xhr.status + ": " + xhr.statusText;
    } else {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url2);
      xhr.responseType = 'blob';
      xhr.onload = function () {
        try {
          if (xhr.status >= 300 || xhr.stats < 200) {
            throw xhr.status + ": " + xhr.statusText;
          } else if (romList.loadListFromFile(xhr.response) || forceList) {
            hideMessage(loadingMessageId, loadMessageTimeout);
          } else {
            startEmulation(xhr.response, fromSelect);
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
  }

  var xhr = new XMLHttpRequest();
  xhr.open('GET', Util.addRomUrlPrefix(url));
  xhr.responseType = 'blob';
  xhr.onload = function () {
    try {
      if (xhr.status >= 300 || xhr.stats < 200) {
        tryPrefix2(url);
      } else if (romList.loadListFromFile(xhr.response) || forceList) {
        hideMessage(loadingMessageId, loadMessageTimeout);
      } else {
        startEmulation(xhr.response, fromSelect);
      }
    } catch (e) {
      errorHandler(url + " (" + e + ")");
    }
  }
  xhr.onerror = function () {
    tryPrefix2(url);
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

  return fsSelectSel;
}

function isParamTrue(name) {
  var value = getRequestParameter(name);
  if (value) {
    value = value.toLowerCase();
    return (value === "1" || value === "true");
  }
  return false;
}

// Request parameters (cart must be the last one: its value runs to the end of the URL)
//   embed=1      just the player, scaled to fit the window (for showing js7800 in an iframe)
//   twinstick=1  force twin stick (dual analog) mode, as the "Force twin stick" setting
function handleRequestParameters() {
  var main = js7800.Main;

  if (isParamTrue("twinstick")) {
    js7800.Cartridge.SetForceDualAnalog(true);
  }

  // ROM list (not shown when embedded)
  if (!embed) {
    var rlist = getRequestParameter("cartlist");
    if (!rlist) {
      rlist = 'roms/romlist-homebrew.json';
    }
    romList.loadListFromUrl(rlist);
  }

  // ROM
  var rom = getRequestParameterToEnd("cart");
  if (rom) {
    loadFromUrl(rom);
  }
}

// Embedded: no page header, cartridge controls or instructions; the player is centred and scaled to fill the
// window. Its settings and help dialogs are moved out of the scaled player (a transformed ancestor would trap
// them) and each is centred and scaled to fit the window as it shows. Transforms only: CSS zoom measures and
// positions differently between browser versions.
function setupEmbed() {
  embed = isParamTrue("embed");
  if (!embed) return;
  document.documentElement.classList.add("js7800-embed");
  var scaleTo = function (el, w, h, maxScale) {
    var s = Math.min(maxScale, (window.innerWidth - 16) / w, (window.innerHeight - 16) / h);
    var t = "translate(-50%, -50%) scale(" + s.toFixed(4) + ")";
    if (el.style.transform !== t) el.style.transform = t;
  };
  var fit = function () {
    var player = document.querySelector("#js7800__target .js7800");
    if (!player || !player.offsetWidth || !player.offsetHeight) return;
    var s = Math.min(window.innerWidth / player.offsetWidth, window.innerHeight / player.offsetHeight);
    var t = "translate(-50%, -50%) scale(" + s.toFixed(4) + ")";
    if (player.style.transform !== t) player.style.transform = t;
  };
  var fitDialogs = function () {
    var modals = document.querySelectorAll(".modal");
    for (var i = 0; i < modals.length; i++) {
      if (modals[i].parentNode !== document.body) document.body.appendChild(modals[i]);
    }
    var dialogs = document.querySelectorAll(".modal-content");
    for (var j = 0; j < dialogs.length; j++) {
      var d = dialogs[j];
      if (d.offsetParent && d.offsetWidth && d.offsetHeight) scaleTo(d, d.offsetWidth, d.offsetHeight, 1);
    }
  };
  // dialogs show and switch tabs by changing styles and classes: refit then (but not on the transforms written here)
  new MutationObserver(function (changes) {
    for (var i = 0; i < changes.length; i++) {
      var t = changes[i].target;
      if (t.classList && (t.classList.contains("modal-content") || t.classList.contains("js7800"))) continue;
      setTimeout(fitDialogs, 0);
      return;
    }
  }).observe(document.body, { attributes: true, childList: true, subtree: true, attributeFilter: ["style", "class"] });
  window.addEventListener("resize", function () { fit(); fitDialogs(); });
  window.addEventListener("load", function () { fit(); fitDialogs(); });
  setTimeout(fit, 0);
  // the controls bar and the screen size can arrive after start-up: fit again whenever the player changes size
  if (window.ResizeObserver) {
    var watch = function () {
      var player = document.querySelector("#js7800__target .js7800");
      if (player) new ResizeObserver(fit).observe(player); else setTimeout(watch, 100);
    };
    watch();
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

  // Check whether debug has been set
  debug = checkDebugParam();

  // Embedded in another page?
  setupEmbed();

  // Configure and init js7800 module
  main.setErrorHandler(errorHandler);
  main.init('js7800__target', { debug: debug });

  // Create the description
  var desc = main.descriptionDiv;
  desc.className = "instructs";
  desc.innerHTML =
    '<div>Click<img id="ins_settings_img" src="' + cbar.cogsImgSrc + '"></img><span id="ins_settings" class="ilink">Settings</span> to view current keyboard mappings.</div>';
  desc.innerHTML +=
    '<div class="ihelp">Click<img id="ins_help_img" src="' + cbar.infoImgSrc + '"></img><span id="ins_help" class="ilink">Help</span> for detailed usage instructions.</div>';
  desc.innerHTML +=
    '<div class="ihelp">Load a cartridge using the drop-down menu or buttons below (you can also drag and drop a local file or remote file link onto the emulator).</div>';

  // js7800 parent element
  var parent = document.getElementById('js7800__fullscreen-container');

  Events.addListener(
    new Events.Listener("onHighScoreCartLoaded",
      function (loaded) {
        highScoreCartEnabled = loaded;
      }
    ));

  // Set the leaderboard button
  var lbBUtton = cbar.leaderboardButton;
  lbBUtton.onClick = function () {
    var url = "leaderboard";
    if (highScoreCartEnabled) {
      url += "?d=" + HighScore.getDigest();
    }
    window.open(url, '_blank'/*,'noopener'*/);
  }
  // No leaderboard link when embedded
  if (embed) lbBUtton.getElement().style.display = "none";

  // Listen for full screen change events
  Events.addListener(
    new Events.Listener("fullscreen",
      function (isFullscreen) {
        lbBUtton.getElement().style.display =
          isFullscreen || embed ? "none" : "block";
        fsSelect.parentElement.style.display =
          isFullscreen ? "flex" : "none";
      }));

  // Create the settings dialog
  var settingsDialog = new SettingsDialog();
  cbar.settingsButton.onClick = function () { settingsDialog.show(); }

  // Create the help dialog
  var helpDialog = new HelpDialog();
  cbar.helpButton.onClick = function () { helpDialog.show(); }

  // Description buttons
  var fSettings = function () { settingsDialog.selectKeyboardTab(); cbar.settingsButton.onClick(); };
  var fHelp = function () { cbar.helpButton.onClick(); };
  document.getElementById('ins_settings').onclick = fSettings;
  document.getElementById('ins_settings_img').onclick = fSettings;
  document.getElementById('ins_help').onclick = fHelp;
  document.getElementById('ins_help_img').onclick = fHelp;

  // Rom list component
  romList = new RomList(
    [document.getElementById('cartselect__select'), fsSelect]);

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

  // Cartridge list loaded listener
  Events.addListener(new Events.Listener("romlistLoaded", function () {
    var id = showMessage("Succesfully loaded cartridge list.");
    hideMessage(id, 1000);
  }));

  // Load preferences
  Storage.loadPrefs();

  // Handle request parameters
  handleRequestParameters();
}

export { init }
