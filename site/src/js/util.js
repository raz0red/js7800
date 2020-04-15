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

export {
  getRequestParameter,
  addUrlPrefix
}
