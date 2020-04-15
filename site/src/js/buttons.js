import * as Events from "./events.js"

import cloudDownloadImgSrc from "../images/cloud-download.svg"
import folderOpenImgSrc from "../images/folder-open.svg"

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

function init(event) {
  var romList = event.romList;
  var loadFromUrl = event.loadFromUrl;
  var startEmulation = event.startEmulation;

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
  var resetValueFunc = function() { fileInput.value = null; }
  label.onclick = resetValueFunc;
  fileInput.onclick = resetValueFunc;
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

Events.addListener(new Events.Listener("init",
  function (event) { init(event) }));

export { }