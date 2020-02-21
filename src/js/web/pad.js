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

function isDigitalLeft(index) { 
  return isPressed(index, LEFT);
}

function isDigitalRight(index) { 
  return isPressed(index, RIGHT);
}

function isDigitalUp(index) { 
  return isPressed(index, UP);
}

function isDigitalDown(index) { 
  return isPressed(index, DOWN);
}

function isButton1(index) { 
  return isPressed(index, B1);
}

function isButton2(index) { 
  return isPressed(index, B2);
}

function isReset(index) { 
  return isPressed(index, START);
}

function isSelect(index) { 
  return isPressed(index, BACK);
}

function isAnalogLeft(index, stickIndex) { 
  return (stickIndex !== undefined) && 
    isAnalogDir(index, stickIndex << 1, false, -.5);
 }
function isAnalogRight(index, stickIndex) { 
  return (stickIndex !== undefined) && 
    isAnalogDir(index, stickIndex << 1, true, .5); 
}

function isAnalogUp(index, stickIndex) { 
  return (stickIndex !== undefined) && 
    isAnalogDir(index, (stickIndex << 1) + 1, false, -.5); 
}

function isAnalogDown(index, stickIndex) { 
  return (stickIndex !== undefined) && 
    isAnalogDir(index, (stickIndex << 1) + 1, true, .5); 
}

function isLeft(index, stickIndex) {
  return isDigitalLeft(index) || isAnalogLeft(index, stickIndex);
}

function isRight(index, stickIndex) {
  return isDigitalRight(index) || isAnalogRight(index, stickIndex);
}

function isUp(index, stickIndex) {
  return isDigitalUp(index) || isAnalogUp(index, stickIndex);
}

function isDown(index, stickIndex) {
  return isDigitalDown(index) || isAnalogDown(index, stickIndex);
}  

export {
  poll,
  isDigitalLeft,
  isDigitalRight,
  isDigitalUp,
  isDigitalDown,
  isButton1,
  isButton2,
  isReset,
  isSelect,
  isAnalogLeft,
  isAnalogRight,
  isAnalogUp,
  isAnalogDown,
  isLeft,
  isRight,
  isUp,
  isDown  
};
