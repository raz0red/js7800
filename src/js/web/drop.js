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
  var dropEl = document.getElementById("drop-div");
  var ignore = function (event) {
    event.preventDefault();
  }
  var els = [body, dropEl];
  for (var i = 0; i < els.length; i++) {
    var el = els[i];
    el.addEventListener("drop", dropHandler);
    el.addEventListener("dragdrop", dropHandler);
    el.addEventListener("dragenter", ignore);
    el.addEventListener("dragover", ignore);
  }
}

export { init };
