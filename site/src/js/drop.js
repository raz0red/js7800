import * as Events from "./events.js"

var errorHandler = null;
var loadFromUrl = null;
var romList = null;

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

Events.addListener(new Events.Listener("init", function (event) {
  loadFromUrl = event.loadFromUrl;
  errorHandler = event.errorHandler;
  romList = event.romList;

  // Register drop handlers
  var body = document.body;
  function ignore(event) { event.preventDefault(); }
  body.addEventListener("drop", fileDropHandler);
  body.addEventListener("dragdrop", fileDropHandler);
  body.addEventListener("dragenter", ignore);
  body.addEventListener("dragover", ignore);
}));

export { }