import { zip } from "./zip.js"
import css from '../css/site.css'
import cloudDownloadImgSrc from "../images/cloud-download.svg"
import folderOpenImgSrc from "../images/folder-open.svg"

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

// Disable use of web workers for zip files
zip.useWebWorkers = false;

var js7800 = null;
var romList = null;
var snackbarEl = null;
var errorMessageEl = null;
var errorTextEl = null;

var isGitHub = (window.location.hostname.toLowerCase() == 'raz0red.github.io');

var errorHandler = function (error, logToConsole) {
  if (logToConsole == undefined) {
    logToConsole = true;
  }
  if (logToConsole) {
    console.error(error);
  }
  showErrorMessage(error);
}

function unzip(file, success, failure) {
  failure = failure || errorHandler;

  function entryProcessor(entries) {
    var romEntry = null;
    if (entries.length == 1) {
      romEntry = entries[0];
    } else if (entries.length > 0) {
      for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        var filename = entry.filename.toLowerCase();
        if (filename.endsWith(".a78") ||
          (filename.endsWith(".bin") && !romEntry)) {
          romEntry = entry;
        }
      }
    }
    if (romEntry) {
      var entry = entries[0];
      var writer = new zip.BlobWriter();
      entry.getData(writer, success);
    } else {
      failure("Unable to find valid ROM in zip file");
    }
  }

  function blobReader(zipReader) {
    zipReader.getEntries(
      entryProcessor,
      failure
    );
  }

  zip.createReader(
    new zip.BlobReader(file),
    blobReader,
    function () { success(file); } // Assume is not a zip file
  );
}

function addUrlPrefix(url) {
  var urlLower = url.toLowerCase();
  var prefix = "";
  if (isGitHub) {
    if (urlLower.startsWith("http://") || urlLower.startsWith("https://")) {
      prefix = "https" + atob("Oi8vdHdpdGNoYXN5bHVtLmNvbS94Lz95PQ==");
    }
  }
  return prefix + url;
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
  var forceList  = (
    urlLower.endsWith(".json") || (urlLower.indexOf(".json?") != -1));

  showMessage('Loading...')

  var xhr = new XMLHttpRequest();
  xhr.open('GET', addUrlPrefix(url));
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

var RomList = function (selects) {
  for (var idx = 0; idx < selects.length; idx++) {
    (function () {
      var iidx = idx;
      var select = selects[iidx];
      select.onchange = function () {
        var value = select.value;
        loadFromUrl(value);
        this.blur();
        for (var i = 0; i < selects.length; i++) {
          if (selects[i] != select) {
            selects[i].value = value;
          }
        }
      }
    })();
  }

  function clearSelect(select) {
    var len, groups, par;
    groups = select.getElementsByTagName('optgroup');
    len = groups.length;
    for (var i = len; i; i--) {
      select.removeChild(groups[i - 1]);
    }
    len = select.options.length;
    for (var i = len; i; i--) {
      par = select.options[i - 1].parentNode;
      par.removeChild(select.options[i - 1]);
    }
  }

  function populateSelect(select, romList) {
    var depth = 0;

    function addChildren(parentEl, parent) {
      depth++;
      try {
        var files = parent.files;
        for (var i = 0; i < files.length; i++) {
          var file = files[i];
          var opt = document.createElement('option');
          opt.appendChild(document.createTextNode(file.name));
          opt.value = file.path;
          parentEl.appendChild(opt);
        }

        if (depth < 2) {
          var folders = parent.folders;
          for (var i = 0; i < folders.length; i++) {
            var folder = folders[i];
            var group = document.createElement("optgroup");
            group.setAttribute("label", folder.name);
            parentEl.appendChild(group);
            addChildren(group, folder);
          }
        }
      } finally {
        depth--;
      }
    }

    clearSelect(select);
    var opt = document.createElement('option');
    opt.appendChild(document.createTextNode("Select Atari 7800 Cartridge..."));
    opt.disabled = true;
    opt.selected = true;
    select.appendChild(opt);

    addChildren(select, romList);
  }

  function ReadList(ctx, current) {
    function getPath(prefix, path) {
      return path.indexOf('//') != -1 ? path : prefix + "/" + path;
    }

    function walkResults(ctx, result, url, current) {
      var urlPrefix = result.pathPrefix;
      if (!urlPrefix) {
        var slash = url ? url.lastIndexOf('/') : -1;
        urlPrefix = slash == -1 ? '' : url.substring(0, slash);
      }

      // Walk files
      var outFiles = [];
      var files = result.files;
      if (files) {
        for (var i = 0; i < files.length; i++) {
          outFiles[i] = files[i];
          outFiles[i].path = getPath(urlPrefix, files[i].path);
        }
      }
      current.files = outFiles;

      // Walk folders
      var outFolders = [];
      var folders = result.folders;
      if (folders) {
        for (var i = 0; i < folders.length; i++) {
          outFolders[i] = folders[i];
          if (folders[i].children) {
            new ReadList(ctx, outFolders[i]).fromList(folders[i].children, urlPrefix + "/");
          } else {
            outFolders[i].path = getPath(urlPrefix, folders[i].path);
            new ReadList(ctx, outFolders[i]).fromUrl(outFolders[i].path);
          }
        }
      }
      current.folders = outFolders;
    }

    function postRead() {
      ctx.loadCount--;
      if (ctx.loadCount == 0) {
        if (ctx.error) {
          errorHandler(ctx.errorMessage);
        } else {
          for (var idx = 0; idx < selects.length; idx++) {
            var select = selects[idx];
            populateSelect(select, ctx.root);
          }
        }
      }
    }

    this.fromList = function (result, baseUrl) {
      ctx.loadCount++;
      walkResults(ctx, result, baseUrl, current);
      postRead();
    }

    this.fromUrl = function (url) {
      ctx.loadCount++;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', addUrlPrefix(url));
      xhr.onload = function () {
        try {
          if (xhr.status >= 300 || xhr.stats < 200) {
            throw xhr.status + ": " + xhr.statusText;
          } else {
            var result = JSON.parse(xhr.responseText);
            walkResults(ctx, result, url, current);
          }
        } catch (e) {
          ctx.error = true;
          ctx.errorMessage = url + " (" + e + ")";
        }
        postRead();
      };
      xhr.send();
    }
  }

  function loadList(source, isUrl) {
    var ctx = {
      loadCount: 0,
      error: false,
      errorMessage: "",
      root: {}
    };

    if (isUrl) {
      new ReadList(ctx, ctx.root).fromUrl(source);
    } else {
      try {
        var result = JSON.parse(source);
        new ReadList(ctx, ctx.root).fromList(result, null);
      } catch (e) {
        errorHandler(e);
      }
    }
  }

  this.loadListFromJson = function (json) {
    loadList(json, false);
  }

  this.loadListFromFile = function (file) {
    var fname = file.name ? file.name.toLowerCase() : "";
    var ftype = file.type ? file.type.toLowerCase() : "";
    if (fname.endsWith(".json") ||
      ftype.includes("text") || ftype.includes("json")) {
      var reader = new FileReader();
      reader.onload = function (event) {
        romList.loadListFromJson(event.target.result);
      };
      reader.readAsText(file);
      return true;
    } else {
      return false;
    }
  }

  this.loadListFromUrl = function (romShareUrl) {
    loadList(romShareUrl, true);
  }
}

function fileDropHandler(ev) {
  ev.preventDefault();
  var file = null;

  if (ev.dataTransfer.items) {
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      var item = ev.dataTransfer.items[i];
      if (item.kind === 'file') {
        file = item.getAsFile();
        if (romList.loadListFromFile(file)) {
          // Don't start emulation, was a rom list
          file = null;
        }
        break;
      } else if (item.kind === 'string' &&
        (item.type.match('^text/uri-list') || item.type.match('^text/plain'))) {
        item.getAsString(function (url) {
          loadFromUrl(url);
        });
      }
    }
  }

  if (file) {
    startEmulation(file);
  }
}

function showMessage(message) {
  hideErrorMessage();
  snackbarEl.innerHTML = message;
  snackbarEl.classList.add('show');
  snackbarEl.classList.remove('hide');
}

function hideMessage() {
  snackbarEl.classList.add('hide');
  snackbarEl.classList.remove('show');
}

function showErrorMessage(message) {
  hideMessage();
  errorTextEl.innerHTML = message;
  errorMessageEl.classList.add('show');
  errorMessageEl.classList.remove('hide');
}

function hideErrorMessage() {
  errorMessageEl.classList.add('hide');
  errorMessageEl.classList.remove('show');
}

function createImageButton(divId, imgSrc, title, allowTab, callback) {
  var div = document.getElementById(divId);
  div.className = "controls-button";
  if (callback) {
    div.onclick = callback;
  }
  var label = document.createElement("label");
  div.appendChild(label);
  if (allowTab) {
    label.setAttribute("tabindex", "0");
    label.onmousedown = function (e) { e.preventDefault(); };
    if (callback) {
      div.onkeydown = function (e) {
        var code = e.which;
        if ((code === 13) || (code === 32)) {
          callback();
        }
      };
    }
  }
  var img = document.createElement("img");
  label.appendChild(img);
  img.className = "controls-button__img";
  img.setAttribute("draggable", "false");
  img.setAttribute("src", imgSrc);
  img.setAttribute("title", title);

  return { "div": div, "label": label, "img": img };
}

function addElements() {
  // The fullscreen container
  var parent = document.getElementById('js7800__fullscreen-container');

  // Snackbar (Loading messages, etc.)
  snackbarEl = document.createElement('div');
  snackbarEl.id = 'snackbar';
  snackbarEl.classList.add('message');
  parent.appendChild(snackbarEl);

  // Error message
  errorMessageEl = document.createElement('div');
  errorMessageEl.id = 'errormsg';
  errorMessageEl.classList.add('message');
  errorMessageEl.onclick = hideErrorMessage;
  parent.appendChild(errorMessageEl);
  var closeButtonEl = document.createElement('span');
  closeButtonEl.classList.add('closebtn');
  closeButtonEl.onclick = hideErrorMessage;
  errorMessageEl.appendChild(closeButtonEl);
  closeButtonEl.innerHTML = '&times;';
  errorTextEl = document.createElement('span');
  errorMessageEl.appendChild(errorTextEl);

  //
  // Buttons
  //

  // Remote file button
  createImageButton("select-remote-file", cloudDownloadImgSrc,
    "Select Remote File", true,
    function () { 
      var url = prompt("Enter the URL of a remote ROM file or ROM list");
      if (url) {
        var trimmed = url.trim();
        if (trimmed.length > 0) {
          loadFromUrl(trimmed);
        }
      }    
    });

  // Local file button
  var localFileButton = createImageButton("select-local-file", folderOpenImgSrc,
    "Select Local File", false, null);  
  var label = localFileButton.label;
  var fileInput = document.createElement("input");
  label.className = "controls-button__upload";
  label.appendChild(fileInput);
  fileInput.setAttribute("type", "file");
  fileInput.setAttribute("accept", ".a78, .bin, .zip, .json");
  fileInput.addEventListener("change", function () {
    var fileList = this.files;
    for (var i = 0; i < fileList.length; i++) {
      var f = fileList[i];
      if (!romList.loadListFromFile(f)) {
        startEmulation(f);
      }
      break;
    }
  }, false);
}

function createFullscreenSelect() {
  var cbar = js7800.ControlsBar;
  var util = js7800.Util;
  var events = js7800.Events;

  // Create full screen cartridge select
  var fsSelect = document.createElement("div");
  var fsSelectSel = document.createElement("select");
  fsSelect.appendChild(fsSelectSel);

  // Create the component in the command bar
  var fsSelectComp = new cbar.Component();
  util.addProps(fsSelectComp, {
    getClass: function () { return "fsselect"; },
    doCreateElement: function () { return fsSelect; }
  });
  cbar.getGroup(1).addChildAtIndex(2, fsSelectComp);

  // Listen for full screen change vents
  var fullscreenListener = new events.Listener("fullscreen");
  fullscreenListener.onEvent = function (isFullscreen) {
    fsSelect.style.display = isFullscreen ? "flex" : "none";
  }
  events.addListener(fullscreenListener);

  return fsSelectSel;
}

function getRequestParameter(name) {
  if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
    return decodeURIComponent(name[1]);
}

function init(in7800) {
  js7800 = in7800;
  var main = js7800.Main;

  // Set message handlers for js7800 component
  main.setMessageHandler(showMessage);
  main.setErrorHandler(errorHandler);

  // Rom list component
  romList = new RomList([
    document.getElementById('cartselect__select'), 
    createFullscreenSelect()]);

  // Initialize js7800
  main.init('js7800__target');

  // Add display elements
  addElements();

  // Register drop handlers
  var ignore = function (event) { event.preventDefault(); }
  var body = document.body;
  body.addEventListener("drop", fileDropHandler);
  body.addEventListener("dragdrop", fileDropHandler);
  body.addEventListener("dragenter", ignore);
  body.addEventListener("dragover", ignore);

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

export {
  init
};
