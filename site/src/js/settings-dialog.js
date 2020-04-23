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
    //console.log('add listener: ' + this.keys[this.value]);
    this.el.addEventListener("keydown", this.keydownf);
  },
  onHide: function () {
    //console.log('remove listener: ' + this.keys[this.value]);
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
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    var title = document.createElement("div");
    rootEl.appendChild(title);
    title.className = "controller__title";
    title.appendChild(document.createTextNode(this.title));
    var inner = document.createElement("div");
    this.inner = inner;
    inner.className = "controller__inner";
    // TODO: See if this can be done in CSS, but ignored by webpack
    inner.style['background-image'] = "url('images/controller.png')";
    rootEl.appendChild(inner);
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
  onOk: function () {
    var map = this.map;
    map.setUp(this.up.getValue());
    map.setLeft(this.left.getValue());
    map.setRight(this.right.getValue());
    map.setDown(this.down.getValue());
    map.setButton1(this.b1.getValue());
    map.setButton2(this.b2.getValue());
  },
  onHide: function () {
    for (var i = 0; i < this.targets.length; i++) {
      this.targets[i].onHide();
    }
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
// Console control
//
function ConsoleButton(title) {
  this.title = title;
  this.target = new KeyTarget(15, 34);
  Component.call(this);
}
ConsoleButton.prototype = Object.create(Component.prototype);
addProps(ConsoleButton.prototype, {
  getClass: function () {
    return "console__button";
  },
  getValue: function () {
    return this.target.getValue();
  },
  onShow: function (keys, value) {
    this.target.onShow(keys, value);
  },
  onHide: function () {
    this.target.onHide();
  },
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    rootEl.appendChild(document.createTextNode(this.title));
    rootEl.appendChild(this.target.createElement());
    return rootEl;
  }
});

//
// Console controls
//
function ConsoleControls() {
  Component.call(this);
  this.pauseButton = new ConsoleButton("PAUSE");
  this.selectButton = new ConsoleButton("SELECT");
  this.resetButton = new ConsoleButton("RESET");
  this.buttons = [this.pauseButton, this.selectButton, this.resetButton];
  this.kb = null;
}
ConsoleControls.prototype = Object.create(Component.prototype);
addProps(ConsoleControls.prototype, {
  getClass: function () {
    return "console";
  },
  onShow: function (keys) {
    var kb = js7800.Keyboard;
    this.kb = kb;
    this.resetButton.onShow(keys, kb.getResetKey());
    this.selectButton.onShow(keys, kb.getSelectKey());
    this.pauseButton.onShow(keys, kb.getPauseKey());
  },
  onOk: function () {
    var kb = this.kb;
    kb.setResetKey(this.resetButton.getValue());
    kb.setSelectKey(this.selectButton.getValue());
    kb.setPauseKey(this.pauseButton.getValue());
  },
  onHide: function () {
    for (var i = 0; i < this.buttons.length; i++) {
      this.buttons[i].onHide();
    }
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
    inner.appendChild(this.resetButton.createElement());
    inner.appendChild(this.selectButton.createElement());
    inner.appendChild(this.pauseButton.createElement());
    return rootEl;
  }
});


//
// Settings dialog tabs
//

var settingsTabSet = new TabSet();
settingsTabSet.addTab(new Tab("Display"));
settingsTabSet.addTab(new Tab("Gamepads"));

// Keyboard tab
var keyboardTab = new Tab("Keyboard");
addProps(keyboardTab, {
  controller1: new KbController("Controller 1"),
  controller2: new KbController("Controller 2"),
  console: new ConsoleControls(),
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
settingsTabSet.addTab(keyboardTab);

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
