js7800.web.keys = (function () {
  'use strict';

  var Key = function (code, name) {
    return {
      code: code,
      name: name
    }
  }

  var Keys = {
    KEY_LEFT: new Key(37, "Left arrow"),
    KEY_UP: new Key(38, "Up arrow"),
    KEY_RIGHT: new Key(39, "Right arrow"),
    KEY_DOWN: new Key(40, "Down arrow"),
    KEY_X: new Key(88, "x"),
    KEY_Z: new Key(90, "z"),
    KEY_F1: new Key(112, "F1"),
    KEY_F2: new Key(113, "F2"),
    KEY_F3: new Key(114, "F3"),
    KEY_F4: new Key(115, "F4"),
    KEY_F5: new Key(116, "F5"),
    KEY_F6: new Key(117, "F6")    
  }

  return {
    Keys: Keys
  }
})();

