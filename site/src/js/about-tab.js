import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"

var Tab = DialogModule.Tab;
var addProps = Util.addProps;
var digest = null;

function AboutTab() {
  Tab.call(this, "About");
  this.top = null;
  this.wrapperEl = null;
  this.logoEl = null;
  this.vEl = null;
  this.iframe = null;
  this.timerId = null;
  this.played = false;

  var that = this;
  this.fClick = function(e) { 
    that.showv();
    e.preventDefault();
  }
}

AboutTab.prototype = Object.create(Tab.prototype);
addProps(AboutTab.prototype, {
  hidev: function() {
    this.iframe.setAttribute('src', '');  
    this.logoEl.style.display = 'inline-block';
    this.vEl.style.display = 'none';
    this.top.style.opacity = "0";
    this.top.style.display = 'inline-block';
    if (this.timerId != null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },
  showv: function () {
    this.played = true;
    this.iframe.setAttribute('src', atob(digest));
    this.top.style.cursor = 'auto';
    this.top.style.opacity = ".4";
    this.top.removeEventListener("click", this.fClick);       
    var that = this;    
    this.timerId = setTimeout(function () {       
      that.top.style.display = 'none';
      that.logoEl.style.display = 'none';
      that.vEl.style.display = 'inline-block';        
    }, 10 * 1000);    
  },
  onShow: function () {
    this.hidev();    
    this.played = false;
    this.top.style.cursor = 'pointer';
    this.top.addEventListener("click", this.fClick);        
    digest = "aHR0cHM6Ly9wbGF5ZXIudmltZW8uY29tL3ZpZGVvLzQxMTg" +
      "5MTQ1Nz9hdXRvcGxheT0xJmFwaT0xJmJhY2tncm91bmQ9dH" +
      "J1ZSZtdXRlPTAmbG9vcD10cnVl";  
  },
  onHide: function () {    
    this.top.removeEventListener("click", this.fClick);    
    this.hidev();
  },
  onTabHide: function() {
    if (this.played) {
      this.onHide();    
    }
  },  
  createTabContent: function (rootEl) {
    var title = document.createElement('div');
    title.className = 'tabcontent__title';
    title.appendChild(document.createTextNode('JS7800: JavaScript Atari 7800 Emulator'));
    rootEl.appendChild(title);

    var about = document.createElement('div');
    about.className = 'about';
    rootEl.appendChild(about)

    var header = document.createElement('div');
    about.appendChild(header);
    
    header.innerHTML =
      '<p class=\"center\">\n' +
        '<span class=\"about-label\">by raz0red</span><a href=\"https://github.com/raz0red/js7800\" target=\"_blank\"><img\n' +
          'class=\"about-logo\" src=\"images/github-logo.svg\" draggable="false" alt=\"GitHub: JS7800 by raz0red\"\n' +
          'title=\"GitHub: JS7800 by raz0red\"></a>\n' +
      '</p>\n' +
      '<p class=\"center\">\n' +
        'JS7800 is an enhanced JavaScript port of the <a href="https://gstanton.github.io/ProSystem1_3/" target=\"_blank\">ProSystem Atari 7800 emulator</a> that was originally\n' +
        'developed by Greg Stanton\n' +
      '</p>';
    var outer = document.createElement('div');
    outer.style.textAlign = 'center';
    about.appendChild(outer);
    this.wrapperEl = document.createElement('div');
    this.wrapperEl.className = 'about-atari';

    this.top = document.createElement('div');
    this.top.className = 'about-atari__top';
    this.wrapperEl.appendChild(this.top);

    outer.appendChild(this.wrapperEl);
    this.logoEl = document.createElement('img');
    this.logoEl.setAttribute('draggable', 'false');
    this.logoEl.setAttribute('src', 'images/logo.gif');
    this.wrapperEl.appendChild(this.logoEl);
    this.vEl = document.createElement('div');
    this.vEl.className = 'about-atari__v';
    this.wrapperEl.appendChild(this.vEl);
    var iframe = document.createElement('iframe');
    this.iframe = iframe;
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');      
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay');
    this.vEl.appendChild(iframe);    

    var footer = document.createElement('div');
    about.appendChild(footer);
    footer.innerHTML =
      '<p class=\"center\">\n' +
        'Atari 7800 controller illustration was created by Mark Davis (<a href="https://vectogram.us/" target=\"_blank\">Vect-O-Gram</a>)<br>\n' + 
        'MD5 support was developed by Joseph Myers (<a href="http://www.myersdaily.org/joseph/javascript/md5-text.html" target=\"_blank\">MD5.js</a>)<br>\n' +      
        'Zip support was developed by Gildas Lormeau (<a href="http://gildas-lormeau.github.io/zip.js" target=\"_blank\">Zip.js</a>)<br>\n' +      
        'YM2151 support was ported from <a href="http://retropc.net/cisc/sound/" target=\"_blank\">FM Sound Generator</a> by <a href="http://www2.tokai.or.jp/mrnkmzu/" target=\"_blank\">Kuma</a>\n' +
      '</p>';
  }
});


export { AboutTab }