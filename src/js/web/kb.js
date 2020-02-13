js7800.web.kb = (function () {
  'use strict';

  var Cartridge = js7800.Cartridge;
  var Keys = js7800.web.keys.Keys;

  var KeyboardMapping = function (leftKey, rightKey, upKey, downKey, b1Key, b2Key) {
    var leftKey = leftKey;
    var rightKey = rightKey;
    var upKey = upKey;
    var downKey = downKey;
    var b1Key = b1Key;
    var b2Key = b2Key;

    var leftHeld = false;
    var rightHeld = false;
    var upHeld = false;
    var downHeld = false;
    var b1Held = false;
    var b2Held = false;

    var leftLast = false;
    var upLast = false;

    return {
      isLeft: function () {
        return (leftHeld && !(rightHeld && !leftLast));
      },
      isRight: function () {
        return (rightHeld && !(leftHeld && leftLast));
      },
      isUp: function () {
        return (upHeld && !(downHeld && !upLast));
      },
      isDown: function () {
        return (downHeld && !(upHeld && upLast));
      },
      isButton1: function () { return b1Held; },
      isButton2: function () { return b2Held; },
      handleKeyCode: function (code, down) {
        switch (code) {
          case leftKey:
            leftHeld = down;
            if (down) leftLast = true;
            return true;
          case upKey:
            upHeld = down;
            if (down) upLast = true;
            return true;
          case rightKey:
            rightHeld = down;
            if (down) leftLast = false;
            return true;
          case downKey:
            downHeld = down;
            if (down) upLast = false;
            return true;
          case b1Key:
            b1Held = down;
            return true;
          case b2Key:
            b2Held = down;
            return true;
        }
        return false;
      },
      reset: function () {
        leftLast = false;
        upLast = false;
      }
    }
  }

  var p1KeyMap = new KeyboardMapping(
    Keys.KEY_LEFT.code, 
    Keys.KEY_RIGHT.code,
    Keys.KEY_UP.code,
    Keys.KEY_DOWN.code, 
    Keys.KEY_Z.code, 
    Keys.KEY_X.code);

  var resetHeld = false;
  var selectHeld = false;
  var pauseHeld = false;

  var leftDiffSet = false;
  var rightDiffSet = false;

  /** Cartridge shadow */
  var cartridgeLeftSwitch = 1;
  var cartridgeRightSwitch = 0;

  var f1Code = Keys.KEY_F1.code;
  var f2Code = Keys.KEY_F2.code;
  var f3Code = Keys.KEY_F3.code;
  var f4Code = Keys.KEY_F4.code;
  var f5Code = Keys.KEY_F5.code;
  var f6Code = Keys.KEY_F6.code;
  
  function keyEvent(event, down) {
    var code = event.keyCode;
    var handled = false;

    if (!p1KeyMap.handleKeyCode(code, down)) {
      switch (code) {
        case f2Code:
          resetHeld = down;
          handled = true;
          break;
        case f3Code:
          selectHeld = down;
          handled = true;
          break;
        case f4Code:
          pauseHeld = down;
          handled = true;
          break;
        case f5Code:
          if (!down) {
            leftDiffSet ^= 1;
          }
          handled = true;
          break;
        case f6Code:
          if (!down) {
            rightDiffSet ^= 1;
          }
          handled = true;
          break;
        case f1Code:
          // Ignore F1 keys, annoying to have browser open tab
          handled = true;
          break;
      }
    }

    if (handled && event.preventDefault) {
      event.preventDefault();
    }
  }

  return {
    init: function () {
      document.onkeydown =
        function (event) {
          keyEvent(event, true);
        };

      document.onkeyup =
        function (event) {
          keyEvent(event, false);
        };
    },
    isSelect: function () { return selectHeld },
    isReset: function () { return resetHeld },
    isPause: function () { return pauseHeld },
    isLeftDiffSet: function () { return leftDiffSet },
    isRightDiffSet: function () { return rightDiffSet },
    onCartridgeLoaded: function () {
      cartridgeLeftSwitch = Cartridge.GetLeftSwitch();
      cartridgeRightSwitch = Cartridge.GetRightSwitch();
    },
    reset: function () {
      // Reset player1 keyboard
      p1KeyMap.reset();

      // Left difficulty switch defaults to off
      leftDiffSet = cartridgeLeftSwitch;

      // Right difficulty switch defaults to on
      rightDiffSet = cartridgeRightSwitch;
    },
    p1KeyMap: p1KeyMap
  }
})();

