js7800.web.input = (function () {
  'use strict';

  var Cartridge = js7800.Cartridge;
  var Pad = js7800.web.pad;

  /** Cartridge shadow */
  var cartridgeLeftSwitch = 1;
  var cartridgeRightSwitch = 0;

  var leftLast = false;
  var leftHeld = false;
  var rightHeld = false;
  var upLast = false;
  var upHeld = false;
  var downHeld = false;
  var aHeld = false;
  var bHeld = false;
  var resetHeld = false;
  var selectHeld = false;
  var pauseHeld = false;
  var leftDiffSet = false;
  var rightDiffSet = false;

  var keyboardData = null;

  function updateInput() {
    Pad.poll();

    // | 12       | Console      | Reset
    keyboardData[12] = resetHeld || Pad.isReset(0);
    // | 13       | Console      | Select
    keyboardData[13] = selectHeld || Pad.isSelect(0);
    // | 14       | Console      | Pause
    keyboardData[14] = pauseHeld;
    // | 15       | Console      | Left Difficulty
    keyboardData[15] = leftDiffSet;
    // | 16       | Console      | Right Difficulty
    keyboardData[16] = rightDiffSet;

    updateJoystick(0, keyboardData);
    updateJoystick(1, keyboardData);
  }

  function updateJoystick(joyIndex, keyboardData) {
    var offset = (joyIndex == 0 ? 0 : 6);

    // | 00 06     | Joystick 1 2 | Right
    keyboardData[0 + offset] = !joyIndex ? (rightHeld || Pad.isRight(joyIndex)) && !(leftHeld && leftLast) : 0;
    // | 01 07     | Joystick 1 2 | Left
    keyboardData[1 + offset] = !joyIndex ? (leftHeld || Pad.isLeft(joyIndex)) && !(rightHeld && !leftLast) : 0;
    // | 02 08     | Joystick 1 2 | Down
    keyboardData[2 + offset] = !joyIndex ? (downHeld || Pad.isDown(joyIndex)) && !(upHeld && upLast) : 0;
    // | 03 09     | Joystick 1 2 | Up
    keyboardData[3 + offset] = !joyIndex ? (upHeld || Pad.isUp(joyIndex)) && !(downHeld && !upLast) : 0;
    // | 04 10     | Joystick 1 2 | Button 1
    keyboardData[4 + offset] = !joyIndex ? (aHeld || Pad.isButton1(joyIndex)) : 0;
    // | 05 11     | Joystick 1 2 | Button 2
    keyboardData[5 + offset] = !joyIndex ? (bHeld || Pad.isButton2(joyIndex)) : 0;
  }

  function resetKeyboardData() {
    for (var idx = 0; idx < keyboardData.length; idx++) {
      keyboardData[idx] = 0;
    }

    // Left difficulty switch defaults to off
    leftDiffSet = cartridgeLeftSwitch;

    // Right difficulty switch defaults to on
    rightDiffSet = cartridgeRightSwitch;

    leftLast = false;
    upLast = false;
  }

  function keyEvent(event, down) {
    var code = event.keyCode;
    var handled = true;

    switch (code) {
      case 0x25:
        leftHeld = down;
        if (down) leftLast = true;
        break;
      case 0x26:
        upHeld = down;
        if (down) upLast = true;
        break;
      case 0x27:
        rightHeld = down;
        if (down) leftLast = false;
        break;
      case 0x28:
        downHeld = down;
        if (down) upLast = false;
        break;
      case 0x5A:
        aHeld = down;
        break;
      case 0x58:
        bHeld = down;
        break;
      case 0x71:
        resetHeld = down;
        break;
      case 0x72:
        selectHeld = down;
        break;
      case 0x73:
        pauseHeld = down;
        break;
      case 0x74:
        if (!down) {
          leftDiffSet ^= 1;
        }
        break;
      case 0x75:
        if (!down) {
          rightDiffSet ^= 1;
        }
        break;
      case 0x70:
        // Ignore F1 keys, annoying to have browser open tab
        break;
      default:
        handled = false;
    }

    if (handled && event.preventDefault) {
      event.preventDefault();
    }
  }

  return {
    init: function (kbData) {
      keyboardData = kbData;
      document.onkeydown =
        function (event) {
          keyEvent(event, true);
        };

      document.onkeyup =
        function (event) {
          keyEvent(event, false);
        };
    },
    onCartridgeLoaded: function () {
      cartridgeLeftSwitch = Cartridge.GetLeftSwitch();
      cartridgeRightSwitch = Cartridge.GetRightSwitch();
    },
    resetKeyboardData: resetKeyboardData,
    updateInput: updateInput
  }
})();



