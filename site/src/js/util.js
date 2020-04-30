import * as js7800Utils from '../../../src/js/common/util-common'

var addProps = js7800Utils.addProps;

var isGitHub = (window.location.hostname.toLowerCase() == 'raz0red.github.io');

if (!String.prototype.endsWith) {
  String.prototype.endsWith = function (search, this_len) {
    console.log('endswith!');
    if (this_len === undefined || this_len > this.length) {
      this_len = this.length;
    }
    return this.substring(this_len - search.length, this_len) === search;
  };
}

function getRequestParameter(name) {
  if (name = (new RegExp('[?&]' + encodeURIComponent(name) + '=([^&]*)')).exec(location.search))
    return decodeURIComponent(name[1]);
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

function generateUuid() { // Public Domain/MIT
  var d = new Date().getTime();//Timestamp
  var d2 = (performance && performance.now && (performance.now() * 1000)) || 0;//Time in microseconds since page-load or 0 if unsupported
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16;//random number between 0 and 16
    if (d > 0) {//Use timestamp until depleted
      r = (d + r) % 16 | 0;
      d = Math.floor(d / 16);
    } else {//Use microseconds since page-load if supported
      r = (d2 + r) % 16 | 0;
      d2 = Math.floor(d2 / 16);
    }
    return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
  });  
}

export {
  generateUuid,
  getRequestParameter,
  addUrlPrefix,
  addProps
}
