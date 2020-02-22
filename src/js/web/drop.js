import * as js7800 from "../js7800.js"

function dropHandler(ev) {
  ev.preventDefault();
  var file = null;
  if (ev.dataTransfer.items) {
    for (var i = 0; i < ev.dataTransfer.items.length; i++) {
      if (ev.dataTransfer.items[i].kind === 'file') {
        file = ev.dataTransfer.items[i].getAsFile();
        break;
      }
    }
  } else {
    for (var i = 0; i < ev.dataTransfer.files.length; i++) {
      file = ev.dataTransfer.files[i];
      break;
    }
  }

  if (file) {
    if (file.size <= 1024 * 1024) /* 1mb max */ {
      var reader = new FileReader();
      reader.readAsBinaryString(file);
      reader.onloadend = function () {
        var cart = new Array();
        for (var i = 0; i < reader.result.length; i++) {
          cart[i] = reader.result.charCodeAt(i);
        }
        js7800.startEmulation(cart);
      }
    } else {
      //$("#status").text("File too large.");
      alert('File too large'); // TODO: How to handle this?
    }
  }
}

function init() {
  jQuery('body').on('drop dragdrop', function (evt) {
    evt.dataTransfer = evt.originalEvent.dataTransfer
    dropHandler(evt);
    event.preventDefault();
  });
  jQuery('body').on('dragenter', function (event) {
    event.preventDefault();
  });
  jQuery('body').on('dragover', function (event) {
    event.preventDefault();
  });
}

export {
  init  
};
