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
      '<div class="tabcontent__title">JS7800: JavaScript Atari 7800 Emulator</div>\n' +
      '<div class="about">' +
        '<p class=\"center\">\n' +
          '<span class=\"about-label\">by raz0red</span><a href=\"https://github.com/raz0red/js7800\"><img\n' +
            'class=\"about-logo\" src=\"images/github-logo.svg\" alt=\"GitHub: JS7800 by raz0red\"\n' +
            'title=\"GitHub: JS7800 by raz0red\"></a>\n' +
        '</p>\n' +
        '<p class=\"center\">\n' +
          'JS7800 is an enhanced JavaScript port of the <a href="https://gstanton.github.io/ProSystem1_3/">ProSystem Atari 7800 emulator</a> that was originally\n' +
          'developed by Greg Stanton\n' +
        '</p>\n' +
        '<div style=\"text-align: center;\">\n' +
          '<div class=\"about-atari\">\n' +
            '<img src=\"images/logo.gif\"></img>\n' +
          '</div>\n' +
        '</div>\n' +
        '<p class=\"center\">\n' +
          'Atari 7800 controller illustration was created by Mark Davis (<a href="https://vectogram.us/">Vect-O-Gram</a>)<br>\n' + 
          'Portions of the Pokey code were adapted from the <a href="https://www.mamedev.org/">MAME</a> implementation<br>\n' +
          'MD5 support was developed by Joseph Myers (<a href="http://www.myersdaily.org/joseph/javascript/md5-text.html">MD5.js</a>)<br>\n' +      
          'Zip support was developed by Gildas Lormeau (<a href="http://gildas-lormeau.github.io/zip.js">Zip.js</a>)\n' +      
        '</p>\n' +
      '</div>';
  }
});


export { AboutTab }