var Example = (function () {

  var js7800 = null;

  function loadRom(url) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', url);
    xhr.responseType = 'arraybuffer';
    xhr.onload = function () {
      try {
        if (xhr.status >= 300 || xhr.stats < 200) {
          throw xhr.status + ": " + xhr.statusText;
        } else {
          var uInt8Array = new Uint8Array(xhr.response);
          var len = uInt8Array.length;
          var cart = new Array(len);
          for (var i = 0; i < len; i++) {
            cart[i] = uInt8Array[i];
          }
          js7800.Main.startEmulation(cart);
        }
      } catch (e) {
        error = true;
        alert(url + " (" + e + ")");
      }
    }
    xhr.send();
  }

  var RomList = function(selectId) {
    var select = document.getElementById(selectId);
    if (!select) {
      throw "Unable to find select element with id: " + selectId;
    }
    select.onchange = function() { loadRom(select.value); this.blur(); }

    this.loadList = function (romShareUrl) {
      var loadCount = 0;
      var error = false;
      var errorMessage = "";
      var root = {};

      function getPath(prefix, path) {
        return path.indexOf('//') != -1 ? path : prefix + "/" + path;
      }

      function clear() {
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

      function populate(romList) {
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

        clear();
        var opt = document.createElement('option');
        opt.appendChild(document.createTextNode("Select Atari 7800 Cartridge..."));
        opt.disabled = true;
        opt.selected = true;
        select.appendChild(opt);

        addChildren(select, romList);
      }

      var ReadList = function (url, root, current) {        
        var xhr = new XMLHttpRequest();
        xhr.open('GET', url);
        xhr.onload = function () {
          try {
            if (xhr.status >= 300 || xhr.stats < 200) {
              throw xhr.status + ": " + xhr.statusText;
            } else {
              var result = JSON.parse(xhr.responseText);
              var slash = url.lastIndexOf('/');
              var urlPrefix = slash == -1 ? '' : url.substring(0, slash);

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
                  outFolders[i].path = getPath(urlPrefix, folders[i].path);
                  loadCount++;
                  new ReadList(outFolders[i].path, root, outFolders[i]);
                }
              }
              current.folders = outFolders;
            }
          } catch (e) {
            error = true;
            errorMessage = url + " (" + e + ")";
          }

          loadCount--;
          if (loadCount == 0) {
            if (error) {
              console.error(errorMessage);
              alert(errorMessage);
            } else {
              populate(root);
            }
          }
        };
        xhr.send();
      }
      loadCount++;
      new ReadList(romShareUrl, root, root);
    }
  }

  return {
    set7800: function (in7800) { js7800 = in7800 },
    RomList: RomList,
    loadRom: loadRom
  }
})();