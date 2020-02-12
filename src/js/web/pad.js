js7800.web.pad = (function () {
  'use strict';

  var B1 = 0;
  var B2 = 1;
  var BACK = 8;
  var START = 9;
  var UP = 12;
  var DOWN = 13;
  var LEFT = 14;
  var RIGHT = 15;

  var gamepads = [];

  function isPressed(index, buttonIndex) {
    var index = 0;
    if (gamepads.length > index) {
      var pad = gamepads[index];
      if (pad && pad.buttons) {
        var buttons = pad.buttons;
        if (buttons.length > buttonIndex) {
          var button = buttons[buttonIndex];
          return button.pressed || button.value == 1.0;
        }
      }
    }
    return false;
  }

  function poll() {
    gamepads = navigator.getGamepads ? navigator.getGamepads() :
      (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);
  }

  return {
    poll: poll,
    isLeft: function(index) { return isPressed(index, LEFT)},
    isRight: function(index) { return isPressed(index, RIGHT)},
    isUp: function(index) { return isPressed(index, UP)},
    isDown: function(index) { return isPressed(index, DOWN)},
    isButton1: function(index) { return isPressed(index, B1)},
    isButton2: function(index) { return isPressed(index, B2)},
    isReset: function(index) { return isPressed(index, START)},
    isSelect: function(index) { return isPressed(index, BACK)}
  }
})();





