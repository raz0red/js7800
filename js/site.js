"use strict";

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search, this_len) {
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

var js7800Site = (function () {

  // Disable use of web workers for zip files
  zip.useWebWorkers = false;

  var js7800 = null;
  var romList = null;

  var isGitHub = (
    window.location.hostname.toLowerCase() == 'raz0red.github.io');

  var errorHandler = function (error) {
    console.error(error);
    alert(error);
  }

  function unzip(file, success, failure) {
    var error = null;
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

  function loadRomFromUrl(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', addUrlPrefix(url));
    xhr.responseType = 'blob';
    xhr.onload = function () {
      try {
        if (xhr.status >= 300 || xhr.stats < 200) {
          throw xhr.status + ": " + xhr.statusText;
        } else {
          startEmulation(xhr.response);
        }
      } catch (e) {
        errorHandler(url + " (" + e + ")");
      }
    }
    xhr.send();
  }

  var RomList = function (selectId) {
    var select = document.getElementById(selectId);
    if (!select) {
      throw "Unable to find select element with id: " + selectId;
    }
    select.onchange = function () {
      loadRomFromUrl(select.value); this.blur();
    }

    function clearSelect() {
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

    function populateSelect(romList) {
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

      clearSelect();
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
            populateSelect(ctx.root);
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

    this.loadListFromUrl = function (romShareUrl) {
      loadList(romShareUrl, true);
    }
  }

  function getRequestParameter(name) {
    if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
      return decodeURIComponent(name[1]);
  }

  function fileDropHandler(ev) {
    ev.preventDefault();
    var file = null;

    if (ev.dataTransfer.items) {
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        var item = ev.dataTransfer.items[i];
        if (item.kind === 'file') {
          file = item.getAsFile();
          if (file.name.toLowerCase().endsWith(".json")) {
            var reader = new FileReader();
            reader.onload = function (event) {
              romList.loadListFromJson(event.target.result);
            };
            reader.readAsText(file);
            file = null; // not a rom
          }
          break;
        } else if (item.kind === 'string' &&
          (item.type.match('^text/uri-list') || item.type.match('^text/plain'))) {
          item.getAsString(function (url) {
            var urlLower = url.toLowerCase();
            if (urlLower.endsWith(".json") || (urlLower.indexOf(".json?") != -1)) {
              romList.loadListFromUrl(url);
            } else {
              loadRomFromUrl(url);
            }
          });
        }
      }
    }

    if (file) {
      startEmulation(file);
    }
  }

  function init(in7800, selectId) {
    js7800 = in7800;
    romList = new RomList(selectId);

    var ignore = function (event) {
      event.preventDefault();
    }

    var body = document.body;
    body.addEventListener("drop", fileDropHandler);
    body.addEventListener("dragdrop", fileDropHandler);
    body.addEventListener("dragenter", ignore);
    body.addEventListener("dragover", ignore);
  }

  return {
    init: init,
    loadRomFromUrl: loadRomFromUrl,
    loadListFromUrl: function (url) { romList.loadListFromUrl(url); },
    getRequestParameter: getRequestParameter,
    SetErrorHandler: function (handler) { errorHandler = handler },
  }
})();