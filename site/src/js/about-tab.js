import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"

var Tab = DialogModule.Tab;
var addProps = Util.addProps;

function AboutTab() {
  Tab.call(this, "About");
}
AboutTab.prototype = Object.create(Tab.prototype);
addProps(AboutTab.prototype, {
  createTabContent: function (rootEl) {
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
  }
});


export { AboutTab }