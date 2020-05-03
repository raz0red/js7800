import * as Util from "./util.js"
import * as Events from "./events.js"

var errorHandler = null;
var loadFromUrl = null;

function RomList(selects) {

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
          opt.text = file.name;
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
    opt.text = "Select Atari 7800 Cartridge...";
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
      xhr.open('GET', Util.addRomUrlPrefix(url));
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
      xhr.onerror = function() {
        console.log('Error attempting to read rom list.');
      }
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
      var that = this;
      reader.onload = function (event) {
        that.loadListFromJson(event.target.result);
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

Events.addListener(new Events.Listener("siteInit", function (event) {
  loadFromUrl = event.loadFromUrl;
  errorHandler = event.errorHandler;
}));

export { RomList }