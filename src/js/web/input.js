js7800.web.input = (function () {
  'use strict';

  var Pad = js7800.web.pad;
  var Cartridge = js7800.Cartridge;
  var Kb = js7800.web.kb;

  var p1KeyMap = Kb.p1KeyMap;
  var keyboardData = null;

  function updateInput() {
    Pad.poll();

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

    updateJoystick(0, keyboardData);
    updateJoystick(1, keyboardData);
  }

  function updateJoystick(joyIndex, keyboardData) {
    var offset = (joyIndex == 0 ? 0 : 6);
    var swap = Cartridge.IsSwapButtons();

    // | 00 06     | Joystick 1 2 | Right
    keyboardData[0 + offset] = !joyIndex ?
      (p1KeyMap.isRight() || Pad.isRight(joyIndex, 0)) :
      Pad.isAnalogRight(0, 1); // Dual analog
    // | 01 07     | Joystick 1 2 | Left
    keyboardData[1 + offset] = !joyIndex ?
      (p1KeyMap.isLeft() || Pad.isLeft(joyIndex, 0)) :
      Pad.isAnalogLeft(0, 1); // Dual analog
    // | 02 08     | Joystick 1 2 | Down
    keyboardData[2 + offset] = !joyIndex ?
      (p1KeyMap.isDown() || Pad.isDown(joyIndex, 0)) :
      Pad.isAnalogDown(0, 1); // Dual analog
    // | 03 09     | Joystick 1 2 | Up
    keyboardData[3 + offset] = !joyIndex ?
      (p1KeyMap.isUp() || Pad.isUp(joyIndex, 0)) :
      Pad.isAnalogUp(0, 1); // Dual analog
    // | 04 10     | Joystick 1 2 | Button 1
    keyboardData[(swap ? 5 : 4) + offset] = !joyIndex ? 
      (p1KeyMap.isButton1() || Pad.isButton1(joyIndex)) : 0;
    // | 05 11     | Joystick 1 2 | Button 2
    keyboardData[(swap ? 4 : 5) + offset] = !joyIndex ? 
      (p1KeyMap.isButton2() || Pad.isButton2(joyIndex)) : 0;
  }

  function reset() {
    for (var idx = 0; idx < keyboardData.length; idx++) {
      keyboardData[idx] = 0;
    }

    // Keyboard
    Kb.reset();
  }

  return {
    init: function (kbData) {
      keyboardData = kbData;
    },
    resetKeyboardData: reset,
    updateInput: updateInput
  }
})();
