import * as Utils from "../util.js"
import * as Input from "./input.js"
import * as Video from "./video.js"
import * as Events from "../events.js"
import * as ProSystem from "../prosystem/ProSystem.js"
import * as Sound from "../prosystem/Sound.js"
import * as Kb from "./kb.js"
import cogsImgSrc from '../../images/cogs.svg'
import fsImgSrc from '../../images/fullscreen.svg'
import fsExitImgSrc from '../../images/fullscreen-exit.svg'
import volImgSrc from '../../images/volume-high.svg'
import volOffImgSrc from '../../images/volume-off.svg'
import playImgSrc from '../../images/play.svg'
import pauseImgSrc from '../../images/pause.svg'
import restartImgSrc from '../../images/restart.svg'
import infoImgSrc from '../../images/information-outline.svg'

var addProps = Utils.addProps;
var pauseButton = null;
var leftDiffSwitch = null;
var rightDiffSwitch = null;

if (!Object.create) {
  Object.create = function (o) {
    function F() { }
    F.prototype = o;
    return new F();
  }
}

/* Component */
function Component() {
  this.el = null;
}
Component.prototype = {
  createElement: function () {
    this.el = this.doCreateElement();
    var clazz = this.getClass();
    if (clazz) {
      this.el.className = clazz;
    }
    return this.el;
  },
  doCreateElement: function () { return null; }
};

/* Control Group */
function ControlGroup() {
  Component.call(this);
  this.children = [];
}
ControlGroup.prototype = Object.create(Component.prototype);
addProps(ControlGroup.prototype, {
  getClass: function () {
    return "js7800__controls-group";
  },
  doCreateElement: function () {
    var group = document.createElement("div");
    for (var idx = 0; idx < this.children.length; idx++) {
      group.appendChild(this.children[idx].createElement());
    }
    return group;
  },
  addChild: function (component) {
    this.children.push(component);
  }
});

/* Control Group (Start) */
function ControlGroupStart() {
  ControlGroup.call(this);
}
ControlGroupStart.prototype = Object.create(ControlGroup.prototype);
addProps(ControlGroupStart.prototype, {
  getClass: function () {
    return "js7800__controls-group-start";
  }
});

/* Control Group (End) */
function ControlGroupEnd() {
  ControlGroup.call(this);
}
ControlGroupEnd.prototype = Object.create(ControlGroup.prototype);
addProps(ControlGroupEnd.prototype, {
  getClass: function () {
    return "js7800__controls-group-end";
  }
});

/* Button */
function Button(text, title) {
  Component.call(this);
  this.title = title;
  this.text = text;
}
Button.prototype = Object.create(Component.prototype);
addProps(Button.prototype, {
  getClass: function () {
    return "js7800__controls-button";
  },
  doCreateElement: function () {
    var btn = document.createElement("button");
    var self = this;
    btn.onclick = function (event) { self.onClick(event) };
    btn.onmousedown = function (event) { self.onDown(event) };
    btn.onmouseup = function (event) { self.onUp(event) };
    var text = document.createTextNode(this.text);
    btn.appendChild(text);
    btn.setAttribute("title", this.title);
    return btn;
  },
  onClick: function (event) { },
  onDown: function (event) { },
  onUp: function (event) { }
});

/* Image Button */
function ImageButton(title, imageSrc) {
  Component.call(this);
  this.title = title;
  this.imageSrc = imageSrc;
  this.img = null;
  this.anchor = null;
}
ImageButton.prototype = Object.create(Component.prototype);
addProps(ImageButton.prototype, {
  getClass: function () {
    return "js7800__controls-img-button";
  },
  doCreateElement: function () {
    var self = this;
    var anchor = document.createElement("a");
    this.anchor = anchor;
    anchor.setAttribute("draggable", "false");    
    anchor.setAttribute("role", "button");
    anchor.setAttribute("tabindex", "0");
    anchor.onkeydown = function(e) { 
      var code = e.which;
      if ((code === 13) || (code === 32)) {
        self.onClick(e);
      }
    };    
    anchor.onmousedown = function (event) { event.preventDefault(); }
    anchor.onclick = function (event) { self.onClick(event); };
    var img = document.createElement("img");
    this.img = img;
    img.setAttribute("draggable", "false");
    img.setAttribute("src", this.imageSrc);
    img.setAttribute("title", this.title);
    anchor.appendChild(img);
    return anchor;
  },
  onClick(event) { }
});

/* Toggle Image Button */
function ToggleImageButton(title, imageSrc, onTitle, onImageSrc) {
  ImageButton.call(this, title, imageSrc);
  this.onTitle = onTitle;
  this.onImageSrc = onImageSrc;
  this.value = false;
}
ToggleImageButton.prototype = Object.create(ImageButton.prototype);
addProps(ToggleImageButton.prototype, {
  doCreateElement: function () {
    var el = ImageButton.prototype.doCreateElement.call(this);
    var self = this;
    this.anchor.onclick = function (event) {
      self.setValue(!self.value);
      self.onClick(event)
    };
    return el;
  },
  setValue: function (value) {
    this.value = value;
    this.img.src = this.value ? this.onImageSrc : this.imageSrc;
    this.img.title = this.value ? this.onTitle : this.title;
  },
  getValue: function () {
    return this.value;
  }
});

/* Toggle Switch */
function ToggleSwitch(title) {
  Component.call(this);
  this.title = title;
  this.cb = null;
}
ToggleSwitch.prototype = Object.create(Component.prototype);
addProps(ToggleSwitch.prototype, {
  getClass: function () {
    return "js7800__controls-switch";
  },
  doCreateElement: function () {
    var toggle = document.createElement("label");
    toggle.setAttribute("title", this.title);
    var cb = document.createElement("input");
    this.cb = cb;
    cb.setAttribute("type", "checkbox");
    var self = this;
    cb.onclick = function (event) { self.onClick(event) };
    toggle.appendChild(cb);
    var span = document.createElement("span");
    span.className = "js7800__controls-switch-slider";
    toggle.appendChild(span);
    return toggle;
  },
  setValue(on) { this.cb.checked = on; },
  getValue() { return this.cb.checked; },
  onClick: function (event) { }
});

function init() {
  var groupStart = new ControlGroupStart();
  pauseButton = new ToggleImageButton("Pause", pauseImgSrc, "Resume", playImgSrc);
  pauseButton.onClick = function () { ProSystem.Pause(this.getValue()); }
  groupStart.addChild(pauseButton);
  var soundButton = new ToggleImageButton("Sound Off", volImgSrc, "Sound On", volOffImgSrc);
  soundButton.onClick = function () { Sound.SetMuted(this.getValue()); }
  groupStart.addChild(soundButton);
  var restartButton = new ImageButton("Restart", restartImgSrc);
  restartButton.onClick = function () { Events.fireEvent("restart") }
  groupStart.addChild(restartButton);

  var group = new ControlGroup();
  var selectButton = new Button("SELECT", "Select");
  selectButton.onDown = function () { Input.setSelect(true); }
  selectButton.onUp = function () { Input.setSelect(false); }
  group.addChild(selectButton);
  var resetButton = new Button("RESET", "Reset");
  resetButton.onDown = function () { Input.setReset(true); }
  resetButton.onUp = function () { Input.setReset(false); }
  group.addChild(resetButton);
  leftDiffSwitch = new ToggleSwitch("Left difficulty switch");
  leftDiffSwitch.onClick = function () { Kb.setLeftDiffSet(!this.getValue()) }
  group.addChild(leftDiffSwitch);
  rightDiffSwitch = new ToggleSwitch("Right difficulty switch")
  rightDiffSwitch.onClick = function () { Kb.setRightDiffSet(!this.getValue()) }
  group.addChild(rightDiffSwitch);

  var groupEnd = new ControlGroupEnd();
  var helpButton = new ImageButton("Help", infoImgSrc);
  helpButton.onClick = function () { Events.fireEvent("showError", "Not implemented."); }
  groupEnd.addChild(helpButton);
  var settingsButton = new ImageButton("Settings", cogsImgSrc);
  settingsButton.onClick = function () { Events.fireEvent("showError", "Not implemented."); }
  groupEnd.addChild(settingsButton);
  var fsButton = new ToggleImageButton("Fullscreen", fsImgSrc, "Exit Fullscreen", fsExitImgSrc);
  fsButton.onClick = function () { Video.isFullscreen() ? Video.exitFullScreen() : Video.fullScreen();  }
  groupEnd.addChild(fsButton);

  var controls = document.getElementById("js7800__controls");
  var controlsContainer = document.createElement("div");
  controlsContainer.className = "js7800__controls-container";
  controls.appendChild(controlsContainer);
  controlsContainer.appendChild(groupStart.createElement());
  controlsContainer.appendChild(group.createElement());
  controlsContainer.appendChild(groupEnd.createElement());

  var fullscreenListener = new Events.Listener("fullscreen");
  fullscreenListener.onEvent = function(isFullscreen) {
    fsButton.setValue(isFullscreen);
  }
  Events.addListener(fullscreenListener);
}

function onCartridgeLoaded() {
  pauseButton.setValue(false);  
}

var initListener = new Events.Listener("init");
initListener.onEvent = function () { init(); }
Events.addListener(initListener);

var cartLoadedListener = new Events.Listener("onCartridgeLoaded");
cartLoadedListener.onEvent = function () { onCartridgeLoaded(); }
Events.addListener(cartLoadedListener);

var leftDiffChangedListener = new Events.Listener("onLeftDiffChanged");
leftDiffChangedListener.onEvent = function (val) { leftDiffSwitch.setValue(!val); }
Events.addListener(leftDiffChangedListener);

var rightDiffChangedListener = new Events.Listener("onRightDiffChanged");
rightDiffChangedListener.onEvent = function (val) { rightDiffSwitch.setValue(!val); }
Events.addListener(rightDiffChangedListener);

export {};
