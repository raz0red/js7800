js7800.web.input = (function () {
  'use strict';

  var Pad = js7800.web.pad;
  var Mouse = js7800.web.mouse;
  var Cartridge = js7800.Cartridge;
  var isLightGunEnabled = Cartridge.IsLightGunEnabled;
  var isLeftButtonDown = Mouse.isLeftButtonDown;
  var Kb = js7800.web.kb;

  var p1KeyMap = Kb.p1KeyMap;
  var p2KeyMap = Kb.p2KeyMap;
  var keyboardData = null;
  var lightGunFirstFire = true;

  function updateInput() {

    if (isLightGunEnabled()) {
      if (lightGunFirstFire) {
        lightGunFirstFire = false;
        keyboardData[3] = true;
      } else {
        keyboardData[3] = !isLeftButtonDown();
      }
    } else {
      Pad.poll();
      updateJoystick(0, keyboardData);
      updateJoystick(1, keyboardData);
    }

    // | 12       | Console      | Reset
    keyboardData[12] = Kb.isReset() || Pad.isReset(0);
    // | 13       | Console      | Select
    keyboardData[13] = Kb.isSelect() || Pad.isSelect(0);
    // | 14       | Console      | Pause
    keyboardData[14] = Kb.isPause();
    // | 15       | Console      | Left Difficulty
    keyboardData[15] = Kb.isLeftDiffSet();
    // | 16       | Console      | Right Difficulty
    keyboardData[16] = Kb.isRightDiffSet();
  }

  function updateJoystick(joyIndex, keyboardData) {
    var offset = (joyIndex == 0 ? 0 : 6);
    var swap = Cartridge.IsSwapButtons();
    var dualanalog = Cartridge.IsDualAnalog();

    // | 00 06     | Joystick 1 2 | Right
    keyboardData[0 + offset] =
      (joyIndex ? p2KeyMap.isRight() : p1KeyMap.isRight()) ||
      Pad.isRight(joyIndex, 0) ||
      (dualanalog && joyIndex && Pad.isAnalogRight(0, 1)); // Dual analog
    // | 01 07     | Joystick 1 2 | Left
    keyboardData[1 + offset] =
      (joyIndex ? p2KeyMap.isLeft() : p1KeyMap.isLeft()) ||
      Pad.isLeft(joyIndex, 0) ||
      (dualanalog && joyIndex && Pad.isAnalogLeft(0, 1)); // Dual analog
    // | 02 08     | Joystick 1 2 | Down
    keyboardData[2 + offset] =
      (joyIndex ? p2KeyMap.isDown() : p1KeyMap.isDown()) ||
      Pad.isDown(joyIndex, 0) ||
      (dualanalog && joyIndex && Pad.isAnalogDown(0, 1)); // Dual analog
    // | 03 09     | Joystick 1 2 | Up
    keyboardData[3 + offset] =
      (joyIndex ? p2KeyMap.isUp() : p1KeyMap.isUp()) ||
      Pad.isUp(joyIndex, 0) ||
      (dualanalog && joyIndex && Pad.isAnalogUp(0, 1)); // Dual analog
    // | 04 10     | Joystick 1 2 | Button 1
    keyboardData[(swap ? 5 : 4) + offset] =
      (joyIndex ? p2KeyMap.isButton1() : p1KeyMap.isButton1()) ||
      Pad.isButton1(joyIndex);
    // | 05 11     | Joystick 1 2 | Button 2
    keyboardData[(swap ? 4 : 5) + offset] =
      (joyIndex ? p2KeyMap.isButton2() : p1KeyMap.isButton2()) ||
      Pad.isButton2(joyIndex);
  }

  function reset() {
    for (var idx = 0; idx < keyboardData.length; idx++) {
      keyboardData[idx] = 0;
    }

    // Keyboard
    Kb.reset();

    // Reset light gun
    lightGunFirstFire = true;
  }

  return {
    init: function (kbData) {
      keyboardData = kbData;
    },
    resetKeyboardData: reset,
    updateInput: updateInput
  }
})();
