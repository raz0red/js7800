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

  function isAnalogDir(index, axesIndex, gt, value) {
    if (gamepads.length > index) {
      var pad = gamepads[index];
      if (pad && pad.axes) {
        var axes = pad.axes;
        if(axes.length > axesIndex) {
          return gt ? axes[axesIndex] > value : axes[axesIndex] < value;
        }
      }
    }

    return false;
  }

  function isPressed(index, buttonIndex) {
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
    isDigitalLeft: function(index) { return isPressed(index, LEFT)},
    isDigitalRight: function(index) { return isPressed(index, RIGHT)},
    isDigitalUp: function(index) { return isPressed(index, UP)},
    isDigitalDown: function(index) { return isPressed(index, DOWN)},
    isButton1: function(index) { return isPressed(index, B1)},
    isButton2: function(index) { return isPressed(index, B2)},
    isReset: function(index) { return isPressed(index, START)},
    isSelect: function(index) { return isPressed(index, BACK)},
    isAnalogLeft: function(index, stickIndex) { 
      return (stickIndex !== undefined) && 
        isAnalogDir(index, stickIndex << 1, false, -.5);
     },
    isAnalogRight: function(index, stickIndex) { 
      return (stickIndex !== undefined) && 
        isAnalogDir(index, stickIndex << 1, true, .5); 
    },
    isAnalogUp: function(index, stickIndex) { 
      return (stickIndex !== undefined) && 
        isAnalogDir(index, (stickIndex << 1) + 1, false, -.5); 
    },
    isAnalogDown: function(index, stickIndex) { 
      return (stickIndex !== undefined) && 
        isAnalogDir(index, (stickIndex << 1) + 1, true, .5); 
    },
    isLeft: function(index, stickIndex) {
      return this.isDigitalLeft(index) || this.isAnalogLeft(index, stickIndex);
    },
    isRight: function(index, stickIndex) {
      return this.isDigitalRight(index) || this.isAnalogRight(index, stickIndex);
    },
    isUp: function(index, stickIndex) {
      return this.isDigitalUp(index) || this.isAnalogUp(index, stickIndex);
    },
    isDown: function(index, stickIndex) {
      return this.isDigitalDown(index) || this.isAnalogDown(index, stickIndex);
    }
  }
})();





