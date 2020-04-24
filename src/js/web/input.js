import * as Mouse from "./mouse.js"
import * as Kb from "./kb.js"
import * as Cartridge from "../prosystem/Cartridge.js"
import * as Pad from "./pad.js"
import * as Events from "../events.js"

var isLightGunEnabled = Cartridge.IsLightGunEnabled;
var isLeftButtonDown = Mouse.isLeftButtonDown;
var p1KeyMap = Kb.p1KeyMap;
var p2KeyMap = Kb.p2KeyMap;
var resetSet = false;
var selectSet = false;

var keyboardData = null;
var lightGunFirstFire = true;

function updateInput() {
  var pad = null;
  if (isLightGunEnabled()) {
    if (lightGunFirstFire) {
      lightGunFirstFire = false;
      keyboardData[3] = true;
    } else {
      keyboardData[3] = !isLeftButtonDown();
    }
  } else {
    Pad.poll();
    pad = Pad.getMapping(0);
    updateJoystick(0, keyboardData, pad);
    updateJoystick(1, keyboardData, pad);
  }

  // | 12       | Console      | Reset
  keyboardData[12] = resetSet || Kb.isReset() || (pad && pad.isReset());
  // | 13       | Console      | Select
  keyboardData[13] = selectSet || Kb.isSelect() || (pad && pad.isSelect());
  // | 14       | Console      | Pause
  keyboardData[14] = Kb.isPause() || (pad && pad.isPause());
  // | 15       | Console      | Left Difficulty
  keyboardData[15] = Kb.isLeftDiffSet();
  // | 16       | Console      | Right Difficulty
  keyboardData[16] = Kb.isRightDiffSet();
}

function updateJoystick(joyIndex, keyboardData, pad0) {
  var offset = (joyIndex == 0 ? 0 : 6);
  var swap = Cartridge.IsSwapButtons();
  var dualanalog = Cartridge.IsDualAnalog();
  var pad = joyIndex ? Pad.getMapping(joyIndex) : pad0;

  // | 00 06     | Joystick 1 2 | Right
  keyboardData[0 + offset] =
    (joyIndex ? p2KeyMap.isRight() : p1KeyMap.isRight()) ||
    pad.isRight(0) ||
    (dualanalog && joyIndex && pad0.isAnalogRight(1)); // Dual analog
  // | 01 07     | Joystick 1 2 | Left
  keyboardData[1 + offset] =
    (joyIndex ? p2KeyMap.isLeft() : p1KeyMap.isLeft()) ||
    pad.isLeft(0) ||
    (dualanalog && joyIndex && pad0.isAnalogLeft(1)); // Dual analog
  // | 02 08     | Joystick 1 2 | Down
  keyboardData[2 + offset] =
    (joyIndex ? p2KeyMap.isDown() : p1KeyMap.isDown()) ||
    pad.isDown(0) ||
    (dualanalog && joyIndex && pad0.isAnalogDown(1)); // Dual analog
  // | 03 09     | Joystick 1 2 | Up
  keyboardData[3 + offset] =
    (joyIndex ? p2KeyMap.isUp() : p1KeyMap.isUp()) ||
    pad.isUp(0) ||
    (dualanalog && joyIndex && pad0.isAnalogUp(1)); // Dual analog
  // | 04 10     | Joystick 1 2 | Button 1
  keyboardData[(swap ? 5 : 4) + offset] =
    (joyIndex ? p2KeyMap.isButton1() : p1KeyMap.isButton1()) ||
    pad.isButton1();
  // | 05 11     | Joystick 1 2 | Button 2
  keyboardData[(swap ? 4 : 5) + offset] =
    (joyIndex ? p2KeyMap.isButton2() : p1KeyMap.isButton2()) ||
    pad.isButton2();
}

function reset() {
  for (var idx = 0; idx < keyboardData.length; idx++) {
    keyboardData[idx] = 0;
  }

  // Keyboard
  Kb.reset();

  // Reset light gun
  lightGunFirstFire = true;

  // Reset buttons
  resetSet = false;
  selectSet = false;
}

function init(kbData) {
  keyboardData = kbData;
}

Events.addListener(new Events.Listener("init",
  function (event) { init(event.keyboardData); }));

function setReset(val) {
  resetSet = val;
}

function setSelect(val) {
  selectSet = val;
}

export {
  reset as resetKeyboardData,
  updateInput,
  setReset,
  setSelect
}
