import * as Util from "../util.js"

function StandardMapping(props) {
  Util.addProps(this, {
    isAnalogDir: function (pad, axesIndex, pos) {
      if (pad && pad.axes) {
        var axes = pad.axes;
        if (axes.length > axesIndex) {
          return pos ? axes[axesIndex] > 0.5 : axes[axesIndex] < -0.5;
        }
      }
      return false;
    },
    isPressed: function (pad, buttonIndex) {
      if (pad && pad.buttons) {
        var buttons = pad.buttons;
        if (buttons.length > buttonIndex) {
          var button = buttons[buttonIndex];
          return button.pressed || button.value == 1.0;
        }
      }
      return false;
    },
    isAnalogLeft: function (pad, stickIndex) {
      return this.isAnalogDir(pad, stickIndex << 1, false);
    },
    isAnalogRight: function (pad, stickIndex) {
      return this.isAnalogDir(pad, stickIndex << 1, true);
    },
    isAnalogUp: function (pad, stickIndex) {
      return this.isAnalogDir(pad, (stickIndex << 1) + 1, false);
    },
    isAnalogDown: function (pad, stickIndex) {
      return this.isAnalogDir(pad, (stickIndex << 1) + 1, true);
    },
    isDigitalLeft: function (pad) { return this.isPressed(pad, 14); },
    isDigitalRight: function (pad) { return this.isPressed(pad, 15); },
    isDigitalUp: function (pad) { return this.isPressed(pad, 12); },
    isDigitalDown: function (pad) { return this.isPressed(pad, 13); },
    isButton1: function (pad) { return this.isPressed(pad, 0); },
    isButton2: function (pad) { return this.isPressed(pad, 1); },
    isReset: function (pad) { return this.isPressed(pad, 9); },
    isSelect: function (pad) { return this.isPressed(pad, 8); },
    isPause: function (pad) { return this.isPressed(pad, 4) || this.isPressed(pad, 5); }
  });

  if (props) {
    Util.addProps(this, props);
  }
};

var stdMapping = new StandardMapping();
var iosMapping = new StandardMapping({
  isAnalogLeft: function (pad, stickIndex) { 
    return this.isAnalogDir(pad, stickIndex ? 2 : 0, false); 
  },
  isAnalogRight: function (pad, stickIndex) {
    return this.isAnalogDir(pad, stickIndex ? 2 : 0, true);
  },
  isAnalogUp: function (pad, stickIndex) {
    return this.isAnalogDir(pad, stickIndex ? 3 : 1, true);
  },
  isAnalogDown: function (pad, stickIndex) {
    return this.isAnalogDir(pad, stickIndex ? 3 : 1, false);
  },
  isDigitalLeft: function (pad) { return this.isAnalogDir(pad, 4, false); },
  isDigitalRight: function (pad) { return this.isAnalogDir(pad, 4, true); },
  isDigitalUp: function (pad) { return this.isAnalogDir(pad, 5, true); },
  isDigitalDown: function (pad) { return this.isAnalogDir(pad, 5, false); },
  isReset: function (pad) { return this.isPressed(pad, 5); },
  isSelect: function (pad) {  return this.isPressed(pad, 4); },
  isPause: function (pad) { return false; }  
});

function PadMapping(padIn, mappingIn) {
  var pad = padIn;
  var mapping = mappingIn;

  function isLeft(stickIndex) {
    if (!pad) return false;
    return mapping.isDigitalLeft(pad) || 
      ((stickIndex !== undefined) &&
        mapping.isAnalogLeft(pad, stickIndex));
  }

  function isRight(stickIndex) {
    if (!pad) return false;
    return mapping.isDigitalRight(pad) || 
      ((stickIndex !== undefined) &&
        mapping.isAnalogRight(pad, stickIndex));
  }

  function isUp(stickIndex) {
    if (!pad) return false;
    return mapping.isDigitalUp(pad) || 
      ((stickIndex !== undefined) &&
        mapping.isAnalogUp(pad, stickIndex));
  }

  function isDown(stickIndex) {    
    if (!pad) return false;
    return mapping.isDigitalDown(pad) || 
      ((stickIndex !== undefined) &&
        mapping.isAnalogDown(pad, stickIndex));
  }

  function isAnalogLeft(stickIndex) {
    if (!pad || (stickIndex === undefined)) return false;
    return mapping.isAnalogLeft(pad, stickIndex);
  }
    
  function isAnalogRight(stickIndex) {
    if (!pad || (stickIndex === undefined)) return false;
    return mapping.isAnalogRight(pad, stickIndex);
  }

  function isAnalogUp(stickIndex) {
    if (!pad || (stickIndex === undefined)) return false;
    return mapping.isAnalogUp(pad, stickIndex);
  }

  function isAnalogDown(stickIndex) {
    if (!pad || (stickIndex === undefined)) return false;
    return mapping.isAnalogDown(pad, stickIndex);
  }  

  function isButton1() {
    if (!pad) return false;
    return mapping.isButton1(pad);
  }

  function isButton2() {
    if (!pad) return false;
    return mapping.isButton2(pad);
  } 

  function isReset() {
    if (!pad) return false;
    return mapping.isReset(pad);
  }

  function isSelect() {
    if (!pad) return false;
    return mapping.isSelect(pad);
  }

  function isPause() {
    if (!pad) return false;
    return mapping.isPause(pad);
  }

  return {
    setPad: function(padIn) { pad = padIn; },
    getPad: function() { return pad; },
    setMapping: function(mappingIn) { mapping = mappingIn; },
    isLeft: isLeft,
    isRight: isRight,
    isUp: isUp,
    isDown: isDown,
    isAnalogLeft: isAnalogLeft,
    isAnalogRight: isAnalogRight,
    isAnalogUp: isAnalogUp,
    isAnalogDown: isAnalogDown,
    isButton1: isButton1,
    isButton2: isButton2,
    isReset: isReset,
    isSelect: isSelect,
    isPause: isPause
  }
};

var pads = [
  new PadMapping(null, stdMapping),
  new PadMapping(null, stdMapping)
];

function poll() {
  var gamepads = navigator.getGamepads ? navigator.getGamepads() :
    (navigator.webkitGetGamepads ? navigator.webkitGetGamepads() : []);

  var padIdx = 0;
  for (var idx = 0; padIdx < 2 && idx < gamepads.length; idx++) {
    var pad = gamepads[idx];
    if (pad) {
      pads[padIdx].setPad(pad);
      pads[padIdx].setMapping(stdMapping);

      var standard = (pad.mapping && (pad.mapping == "standard"));
      if (!standard && Util.isIosDevice) {
        pads[padIdx].setMapping(iosMapping);
      } 
      
      padIdx++;
    }
  }
  for (; padIdx < 2; padIdx++) {
    pads[padIdx].setPad(null);
  }
}

function getMapping(index) {
  return pads[index];  
}

export {
  poll,
  getMapping
}
