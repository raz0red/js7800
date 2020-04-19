
if (!Object.create) {
  Object.create = function (o) {
    function F() { }
    F.prototype = o;
    return new F();
  }
}

var isTouchDevice = ('ontouchstart' in window) || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0;
var isMobileDevice = isTouchDevice && (/android|blackberry|iemobile|ipad|iphone|ipod|opera mini|webos/i).test(navigator.userAgent);
var isIosDevice = (/ipad|iphone|ipod/i).test(navigator.userAgent) && !window.MSStream;

function addProps(dest, source) {
  for (var attrib in source) {
    dest[attrib] = source[attrib];
  }
}

export {
  isTouchDevice,
  isMobileDevice,
  isIosDevice,
  addProps
}
