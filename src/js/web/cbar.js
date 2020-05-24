import * as Utils from "../util.js"
import * as Input from "./input.js"
import * as Video from "./video.js"
import * as Events from "../events.js"
import * as ProSystem from "../prosystem/ProSystem.js"
import * as Sound from "../prosystem/Sound.js"
import * as Kb from "./kb.js"
import * as UiCommon from "../common/ui-common.js"
import cogsImgSrc from '../../images/cogs.svg'
import fsImgSrc from '../../images/fullscreen.svg'
import fsExitImgSrc from '../../images/fullscreen-exit.svg'
import volImgSrc from '../../images/volume-high.svg'
import volOffImgSrc from '../../images/volume-off.svg'
import playImgSrc from '../../images/play.svg'
import pauseImgSrc from '../../images/pause.svg'
import restartImgSrc from '../../images/restart.svg'
import infoImgSrc from '../../images/information-outline.svg'
import medalImgSrc from '../../images/medal.svg'
// import medalImgSrc from '../../images/trophy-variant.svg'

var addProps = Utils.addProps;
var Component = UiCommon.Component;
var Button = UiCommon.Button;
var ToggleSwitch = UiCommon.ToggleSwitch;

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
  },
  addChildAtIndex: function (idx, component) {
    this.children.splice(idx, 0, component);
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

var groupStart = new ControlGroupStart();
var pauseButton = new ToggleImageButton("Pause", pauseImgSrc, "Resume", playImgSrc);
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
var leftDiffSwitch = new ToggleSwitch("Left difficulty switch");
leftDiffSwitch.onClick = function () { Kb.setLeftDiffSet(!this.getValue()) }
group.addChild(leftDiffSwitch);
var rightDiffSwitch = new ToggleSwitch("Right difficulty switch")
rightDiffSwitch.onClick = function () { Kb.setRightDiffSet(!this.getValue()) }
group.addChild(rightDiffSwitch);

var groupEnd = new ControlGroupEnd();
var leaderboardButton = new ImageButton("Leaderboard", medalImgSrc);
leaderboardButton.onClick = function () { Events.fireEvent("showError", "Not implemented."); }
groupEnd.addChild(leaderboardButton);
var helpButton = new ImageButton("Help / Info", infoImgSrc);
helpButton.onClick = function () { Events.fireEvent("showError", "Not implemented."); }
groupEnd.addChild(helpButton);
var settingsButton = new ImageButton("Settings", cogsImgSrc);
settingsButton.onClick = function () { Events.fireEvent("showError", "Not implemented."); }
groupEnd.addChild(settingsButton);
var fsButton = new ToggleImageButton("Fullscreen", fsImgSrc, "Exit Fullscreen", fsExitImgSrc);
fsButton.onClick = function () { Video.isFullscreen() ? Video.exitFullScreen() : Video.fullScreen();  }
groupEnd.addChild(fsButton);

function init() {
  var controls = document.getElementById("js7800__controls");
  var controlsContainer = document.createElement("div");
  controlsContainer.className = "js7800__controls-container";
  controls.appendChild(controlsContainer);
  controlsContainer.appendChild(groupStart.createElement());
  controlsContainer.appendChild(group.createElement());
  controlsContainer.appendChild(groupEnd.createElement());

  Events.addListener(new Events.Listener("fullscreen",
    function(isFullscreen) { fsButton.setValue(isFullscreen); }));
}

function getGroup(idx) {
  switch(idx) {
    case 0: return groupStart;
    case 1: return group;
    case 2: return groupEnd;
    default: throw "Unknown group: " + idx;
  }
}

function isPauseButtonDown() {
  return pauseButton && pauseButton.getValue();
}

function onCartridgeLoaded() {
  pauseButton.setValue(false);  
}

Events.addListener(
  new Events.Listener("init", init));
Events.addListener(
  new Events.Listener("onCartridgeLoaded", onCartridgeLoaded));
Events.addListener(
  new Events.Listener("onLeftDiffChanged", 
  function (val) { leftDiffSwitch.setValue(!val); }));
Events.addListener(
  new Events.Listener("onRightDiffChanged",
  function (val) { rightDiffSwitch.setValue(!val); }));

export {
  isPauseButtonDown,
  getGroup,
  Component,
  Button,
  leaderboardButton,
  settingsButton,
  helpButton,
  pauseButton,
  soundButton,
  cogsImgSrc,
  infoImgSrc,
  medalImgSrc
}
