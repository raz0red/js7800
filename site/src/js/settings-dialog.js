import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"
import { Component } from "../../../src/js/common/ui-common.js";
import * as Events from "./events.js"

var TabbedDialog = DialogModule.TabbedDialog;
var TabSet = DialogModule.TabSet;
var Tab = DialogModule.Tab;
var addProps = Util.addProps;
var js7800 = null;

//
// Key target
//

function KeyTarget(left, top) {
  Component.call(this);
  this.keys = null;
  this.left = left;
  this.top = top;
  this.value = 0;
  var that = this;
  this.keydownf = function (e) {
    that.setValue(e.keyCode);
    e.preventDefault();
    e.stopPropagation();
  }
}
KeyTarget.prototype = Object.create(Component.prototype);
addProps(KeyTarget.prototype, {
  getClass: function () {
    return "controller__keytarget";
  },
  doCreateElement: function () {
    var target = document.createElement("div");
    this.target = target;
    target.setAttribute("tabindex", "0");
    target.style.left = "" + this.left + "px";
    target.style.top = "" + this.top + "px";
    return target;
  },
  onShow: function (keys, value) {
    this.keys = keys;
    this.setValue(value);
    this.el.addEventListener("keydown", this.keydownf);
  },
  onHide: function () {
    this.el.removeEventListener("keydown", this.keydownf);
  },
  setValue: function (value) {
    var label = this.keys[value];
    if (label) {
      this.target.innerHTML = label;
      this.value = value;
    }
  },
  getValue: function () { return this.value; }
});

//
// Controller
//

function Controller(title) {
  Component.call(this);
  this.title = title;
  this.inner = null;
}
Controller.prototype = Object.create(Component.prototype);
addProps(Controller.prototype, {
  getClass: function () {
    return "controller";
  },
  doCreateElementBeforeTitle: function (rootEl) { },
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    this.doCreateElementBeforeTitle(rootEl);
    var title = document.createElement("div");
    rootEl.appendChild(title);
    title.className = "controller__title";
    title.appendChild(document.createTextNode(this.title));
    var inner = document.createElement("div");
    this.inner = inner;
    inner.className = "controller__inner";
    // TODO: See if this can be done in CSS, but ignored by webpack
    //inner.style['background-image'] = "url('images/controller.png')";
    rootEl.appendChild(inner);
    return rootEl;
  }
});

//
// Gamepad controller
//

function GamepadFocus(left, top) {
  Component.call(this);
  this.left = left;
  this.top = top;
}
GamepadFocus.prototype = Object.create(Component.prototype);
addProps(GamepadFocus.prototype, {
  getClass: function () { return "gamepad-focus" },
  show: function () {
    this.el.style.display = 'block';
  },
  hide: function () {
    this.el.style.display = 'none';
  },
  setVisible: function (visible) {
    if (visible) {
      this.show();
    } else {
      this.hide();
    }
  },
  doCreateElement: function () {
    var focus = document.createElement("div");
    focus.style.left = "" + this.left + "px";
    focus.style.top = "" + this.top + "px";
    return focus;
  }
});

function GamepadController(title, index) {
  Controller.call(this, title);
  this.index = index;
  this.left = new GamepadFocus(33, 38);
  this.right = new GamepadFocus(73, 38);
  this.up = new GamepadFocus(53, 18);
  this.down = new GamepadFocus(53, 58);
  this.b1 = new GamepadFocus(152, 102);
  this.b2 = new GamepadFocus(218, 102);
  this.mapping = null;
  this.focus = [this.left, this.right, this.up, this.down, this.b1, this.b2];
  this.padId = null;
  this.padMapping = null;
}
GamepadController.prototype = Object.create(Controller.prototype);
addProps(GamepadController.prototype, {
  onShow: function () {
    this.mapping = js7800.Pads.getMapping(this.index);
    for (var i = 0; i < this.focus.length; i++) {
      this.focus[i].hide();
    }
  },
  updatePadId: function (pad) {
    var value = null;
    if (pad && pad.id && pad.id.trim().length > 0) {
      value = pad.id.trim();
      var pidx = value.indexOf("(");
      if (pidx != -1) {
        value = '<span title="' + value + '">' + value.substring(0, pidx) + '</span>'
      }
    } else {
      value = "None (connect and press button)";
    }
    if (this.padId.innerHTML != value) {
      this.padId.innerHTML = value;
    }
  },
  updatePadMapping: function (pad) {
    var value = null;
    if (pad && pad.mapping && pad.mapping.trim().length > 0) {
      var mapStr = pad.mapping.trim();
      value = mapStr.charAt(0).toUpperCase() + mapStr.substring(1);
    } else {
      value = "(Unknown)";
    }
    if (this.padMapping.innerHTML != value) {
      this.padMapping.innerHTML = value;
    }
  },
  update: function () {
    var mapping = this.mapping;
    this.left.setVisible(mapping.isLeft(0));
    this.right.setVisible(mapping.isRight(0));
    this.up.setVisible(mapping.isUp(0));
    this.down.setVisible(mapping.isDown(0));
    this.b1.setVisible(mapping.isButton1());
    this.b2.setVisible(mapping.isButton2());

    var pad = js7800.Pads.getMapping(this.index).getPad();
    this.updatePadId(pad);
    this.updatePadMapping(pad);
  },
  addValueCell: function (grid) {
    var col = document.createElement("div");
    col.className = "gamepad-cell-value";
    grid.appendChild(col);
    return col;
  },
  addNameCell: function (grid, label) {
    var col = document.createElement("div");
    col.className = "gamepad-cell-name";
    grid.appendChild(col);
    col.appendChild(document.createTextNode(label));
  },
  onHide: function () { },
  doCreateElementBeforeTitle: function (rootEl) {
    var grid = document.createElement("div");
    grid.className = "gamepad-grid";
    this.addNameCell(grid, "Gamepad:");
    this.padId = this.addValueCell(grid);
    this.addNameCell(grid, "Mapping:");
    this.padMapping = this.addValueCell(grid);
    rootEl.appendChild(grid)
  },
  doCreateElement: function () {
    var rootEl = Controller.prototype.doCreateElement.call(this);
    var inner = this.inner;
    inner.appendChild(this.left.createElement());
    inner.appendChild(this.right.createElement());
    inner.appendChild(this.up.createElement());
    inner.appendChild(this.down.createElement());
    inner.appendChild(this.b1.createElement());
    inner.appendChild(this.b2.createElement());
    return rootEl;
  }
});

//
// Keyboard controller
//

function KbController(title) {
  Controller.call(this, title);
  this.up = new KeyTarget(38, -5);
  this.left = new KeyTarget(-7, 33);
  this.right = new KeyTarget(82, 33);
  this.down = new KeyTarget(38, 70);
  this.b1 = new KeyTarget(138, 133);
  this.b2 = new KeyTarget(204, 133);
  this.targets = [this.up, this.left, this.right, this.down, this.b1, this.b2];
  this.map = null;
}
KbController.prototype = Object.create(Controller.prototype);
addProps(KbController.prototype, {
  getClass: function () {
    return Controller.prototype.getClass.call(this) + " controller-keyboard";
  },
  onShow: function (keys, map) {
    this.map = map;
    this.keys = keys;
    this.left.onShow(keys, map.getLeft());
    this.right.onShow(keys, map.getRight());
    this.up.onShow(keys, map.getUp());
    this.down.onShow(keys, map.getDown());
    this.b1.onShow(keys, map.getButton1());
    this.b2.onShow(keys, map.getButton2());
  },
  onHide: function () {
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i].onHide();
    }
  },
  onOk: function () {
    var map = this.map;
    map.setUp(this.up.getValue());
    map.setLeft(this.left.getValue());
    map.setRight(this.right.getValue());
    map.setDown(this.down.getValue());
    map.setButton1(this.b1.getValue());
    map.setButton2(this.b2.getValue());
  },
  onDefaults: function () {
    var map = this.map;
    this.up.setValue(map.getDefaultUp());
    this.left.setValue(map.getDefaultLeft());
    this.right.setValue(map.getDefaultRight());
    this.down.setValue(map.getDefaultDown());
    this.b1.setValue(map.getDefaultButton1());
    this.b2.setValue(map.getDefaultButton2());
  },
  doCreateElement: function () {
    var rootEl = Controller.prototype.doCreateElement.call(this);
    for (var i = 0; i < this.targets.length; i++) {
      this.inner.appendChild(this.targets[i].createElement());
    }
    return rootEl;
  }
});

//
// Console button
//

function ConsoleButton(title) {
  Component.call(this);
  this.title = title;
}
ConsoleButton.prototype = Object.create(Component.prototype);
addProps(ConsoleButton.prototype, {
  getClass: function () {
    return "console__button console__button--up";
  },
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    rootEl.appendChild(document.createTextNode(this.title));
    return rootEl;
  }
});

function ConsoleButtonKeyboard(title) {
  ConsoleButton.call(this, title);
  this.target = new KeyTarget(15, 34);
}
ConsoleButtonKeyboard.prototype = Object.create(ConsoleButton.prototype);
addProps(ConsoleButtonKeyboard.prototype, {
  getValue: function () {
    return this.target.getValue();
  },
  setValue: function (value) {
    this.target.setValue(value);
  },
  onShow: function (keys, value) {
    this.target.onShow(keys, value);
  },
  onHide: function () {
    this.target.onHide();
  },
  doCreateElement: function () {
    var rootEl = ConsoleButton.prototype.doCreateElement.call(this);
    rootEl.appendChild(this.target.createElement());
    return rootEl;
  }
});

function ConsoleButtonGamepad(title) {
  ConsoleButton.call(this, title);
  //this.focus = new GamepadFocus(30, 20);
}
ConsoleButtonGamepad.prototype = Object.create(ConsoleButton.prototype);
addProps(ConsoleButtonGamepad.prototype, {
  onShow: function () {
    this.setFocusVisible(false);
  },
  setFocusVisible: function (visible) {        
    this.el.className = "console__button console__button--" +
      (visible ? "down" : "up");
  },
  doCreateElement: function () {
    var rootEl = ConsoleButton.prototype.doCreateElement.call(this);
    //rootEl.appendChild(this.focus.createElement());
    return rootEl;
  }
});


//
// Console controls
//

function ConsoleControls() {
  Component.call(this);
  this.pauseButton = this.createPauseButton("PAUSE");
  this.selectButton = this.createSelectButton("SELECT");
  this.resetButton = this.createResetButton("RESET");
  this.buttons = [this.pauseButton, this.selectButton, this.resetButton];
  this.kb = null;
}
ConsoleControls.prototype = Object.create(Component.prototype);
addProps(ConsoleControls.prototype, {
  createPauseButton: function (title) { },
  createSelectButton: function (title) { },
  createResetButton: function (title) { },
  getClass: function () {
    return "console";
  },
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    var title = document.createElement("div");
    rootEl.appendChild(title);
    title.className = "controller__title";
    title.appendChild(document.createTextNode("Console Buttons"));
    var inner = document.createElement("div");
    rootEl.appendChild(inner);
    inner.className = "console__inner";
    inner.appendChild(this.selectButton.createElement());
    inner.appendChild(this.resetButton.createElement());
    inner.appendChild(this.pauseButton.createElement());
    return rootEl;
  }
});

// 
// Console controls keyboard
//

function ConsoleControlsKeyboard() {
  ConsoleControls.call(this);
}
ConsoleControlsKeyboard.prototype = Object.create(ConsoleControls.prototype);
addProps(ConsoleControlsKeyboard.prototype, {
  createPauseButton: function (title) { return new ConsoleButtonKeyboard(title); },
  createSelectButton: function (title) { return new ConsoleButtonKeyboard(title); },
  createResetButton: function (title) { return new ConsoleButtonKeyboard(title); },
  onShow: function (keys) {
    var kb = js7800.Keyboard;
    this.kb = kb;
    this.resetButton.onShow(keys, kb.getResetKey());
    this.selectButton.onShow(keys, kb.getSelectKey());
    this.pauseButton.onShow(keys, kb.getPauseKey());
  },
  onHide: function () {
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].onHide();
    }
  },
  onOk: function () {
    var kb = this.kb;
    kb.setResetKey(this.resetButton.getValue());
    kb.setSelectKey(this.selectButton.getValue());
    kb.setPauseKey(this.pauseButton.getValue());
  },
  onDefaults: function () {
    var kb = this.kb;
    this.resetButton.setValue(kb.defResetKey);
    this.selectButton.setValue(kb.defSelectKey);
    this.pauseButton.setValue(kb.defPauseKey);
  },
});

// 
// Console controls gamepad
//

function ConsoleControlsGamepad() {
  ConsoleControls.call(this);
  this.mapping = null;
}
ConsoleControlsGamepad.prototype = Object.create(ConsoleControls.prototype);
addProps(ConsoleControlsGamepad.prototype, {
  createPauseButton: function (title) { return new ConsoleButtonGamepad(title); },
  createSelectButton: function (title) { return new ConsoleButtonGamepad(title); },
  createResetButton: function (title) { return new ConsoleButtonGamepad(title); },
  update: function () {
    var mapping = this.mapping;
    this.selectButton.setFocusVisible(mapping.isSelect());
    this.resetButton.setFocusVisible(mapping.isReset());
    this.pauseButton.setFocusVisible(mapping.isPause());
  },
  onShow: function () {
    this.mapping = js7800.Pads.getMapping(0);
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].onShow();
    }
  }
});

//
// Settings dialog tabs
//

// Gamepads tab
var gamepadsTab = new Tab("Gamepads");
addProps(gamepadsTab, {
  intervalId: null,
  controller1: new GamepadController("Controller 1", 0),
  controller2: new GamepadController("Controller 2", 1),
  console: new ConsoleControlsGamepad(),
  onShow: function () {
    this.controller1.onShow();
    this.controller2.onShow();
    this.console.onShow();
    var that = this;
    this.intervalId = setInterval(function () {
      js7800.Pads.poll();
      that.controller1.update();
      that.controller2.update();
      that.console.update();
    }, 50);
  },
  onHide: function () {
    if (this.intervalId != null) {
      clearInterval(this.intervalId);
    }
  },
  createTabContent: function (rootEl) {
    var desc = document.createElement("div");
    desc.innerHTML =
      '<h3 class="center">Gamepad Compatibility</h3>\n' +
      '<p class="center">This page provides the ability to <b class="callout">test compatibility</b> with connected gamepads.</p>\n' +
      '<p class="center">Connect gamepads and test if they are mapped correctly (by pressing buttons, D-pad, etc.).' +
      // '<br><span style="color:#777; font-size:.93em;">(custom mappings are not currently supported)</span></p>';
      '</p>'
    rootEl.appendChild(desc);

    var controlsDiv = document.createElement("div");
    rootEl.appendChild(controlsDiv);
    controlsDiv.className = "controls-container";
    controlsDiv.appendChild(this.controller1.createElement());
    controlsDiv.appendChild(this.controller2.createElement());
    rootEl.appendChild(this.console.createElement());
  }
});

// Keyboard tab
var keyboardTab = new Tab("Keyboard");
addProps(keyboardTab, {
  controller1: new KbController("Controller 1"),
  controller2: new KbController("Controller 2"),
  console: new ConsoleControlsKeyboard(),
  onShow: function () {
    var kb = js7800.Keyboard;
    var p1map = kb.p1KeyMap;
    var p2map = kb.p2KeyMap;
    var keys = js7800.Keys.Keys;
    this.controller1.onShow(keys, p1map);
    this.controller2.onShow(keys, p2map);
    this.console.onShow(keys);
  },
  onOk: function () {
    this.controller1.onOk();
    this.controller2.onOk();
    this.console.onOk();
  },
  onHide: function () {
    this.controller1.onHide();
    this.controller2.onHide();
    this.console.onHide();
  },
  onDefaults: function () {
    this.controller1.onDefaults();
    this.controller2.onDefaults();
    this.console.onDefaults();
  },
  createTabContent: function (rootEl) {
    var desc = document.createElement("div");
    desc.innerHTML =
      '<h3 class="center">Keyboard Mappings</h3>\n' +
      '<p class="center">Click on the <b class="callout">red box</b> near a control to select it for mapping.</p>\n' +
      '<p class="center">Once selected, press the <b class="callout">key</b> you would like to map to the control.</p>';
    rootEl.appendChild(desc);
    var controlsDiv = document.createElement("div");
    rootEl.appendChild(controlsDiv);
    controlsDiv.className = "controls-container";
    controlsDiv.appendChild(this.controller1.createElement());
    controlsDiv.appendChild(this.controller2.createElement());
    rootEl.appendChild(this.console.createElement());
  }
});

// About tab
var aboutTab = new Tab("About");
aboutTab.createTabContent = function (rootEl) {
  rootEl.innerHTML =
    '<h3 class="center">JS7800: JavaScript Atari 7800 Emulator</h3>\n' +
    '<p class=\"center\">\n' +
    '  <span class=\"about-label\">by raz0red</span><a href=\"https://github.com/raz0red/js7800\"><img\n' +
    '        class=\"about-logo\" src=\"images/github-logo.svg\" alt=\"GitHub: JS7800 by raz0red\"\n' +
    '        title=\"GitHub: JS7800 by raz0red\"></a>\n' +
    '</p>\n' +
    '<p class=\"center\">\n' +
    '  JS7800 is an enhanced JavaScript port of the ProSystem Atari 7800 emulator originally\n' +
    '  developed by Greg Stanton packaged as a JavaScript module.\n' +
    '</p>\n' +
    '<div style=\"text-align: center;\">\n' +
    '  <div class=\"about-atari\">\n' +
    '    <img src=\"images/logo.gif\"></img>\n' +
    '  </div>\n' +
    '</div>\n' +
    '<p class=\"center\">\n' +
    '  Portions of the Pokey code were adapted from the MAME implementation.\n' +
    '</p>';
};

var settingsTabSet = new TabSet();
settingsTabSet.addTab(new Tab("Display"));
settingsTabSet.addTab(keyboardTab);
settingsTabSet.addTab(gamepadsTab);
settingsTabSet.addTab(aboutTab, true);

//
// Settings dialog
//

function SettingsDialog() {
  TabbedDialog.call(this, "Settings");
}
SettingsDialog.prototype = Object.create(TabbedDialog.prototype);
addProps(SettingsDialog.prototype, {
  getTabSet: function () { return settingsTabSet; }
});

Events.addListener(new Events.Listener("init",
  function (event) {
    js7800 = event.js7800;
  }
));

export { SettingsDialog }

