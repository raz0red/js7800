import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"

var Dialog = DialogModule.Dialog;
var TabSet = DialogModule.TabSet;
var Tab = DialogModule.Tab;

var addProps = Util.addProps;

//
// Settings Dialog
//

var settingsTabSet = new TabSet();
settingsTabSet.addTab(new Tab("Display"));
settingsTabSet.addTab(new Tab("Keyboard"));
settingsTabSet.addTab(new Tab("Gamepads"));

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

function SettingsDialog() {
  Dialog.call(this, "Settings");
}
SettingsDialog.prototype = Object.create(Dialog.prototype);
addProps(Dialog.prototype, {
  addBodyContent: function (bodyEl) {
    bodyEl.appendChild(settingsTabSet.createElement());
  },
});

export { SettingsDialog }