import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"

var Tab = DialogModule.Tab;
var addProps = Util.addProps;

function AboutTab() {
  Tab.call(this, "About");
  this.top = null;
  this.wrapperEl = null;
  this.logoEl = null;
  this.videoEl = null;
  this.iframe = null;
  this.timerId = null;
  this.played = false;

  var that = this;
  this.fClick = function(e) { 
    that.showVideo();
    e.preventDefault();
  }
}

AboutTab.prototype = Object.create(Tab.prototype);
addProps(AboutTab.prototype, {
  hideVideo: function() {
    this.iframe.setAttribute('src', '');  
    this.logoEl.style.display = 'inline-block';
    this.videoEl.style.display = 'none';
    this.top.style.opacity = "0";
    if (this.timerId != null) {
      clearTimeout(this.timerId);
      this.timerId = null;
    }
  },
  showVideo: function () {
    this.played = true;
    this.iframe.setAttribute('src', 'https://player.vimeo.com/video/411891457?autoplay=1&api=1&background=true&mute=0');    
    this.top.style['cursor'] = 'auto';
    this.top.removeEventListener("click", this.fClick);       
    this.top.style.opacity = ".4";
    var that = this;    
    this.timerId = setTimeout(function () {       
      that.top.style.opacity = "0";
      that.logoEl.style.display = 'none';
      that.videoEl.style.display = 'inline-block';  
      that.timerId = setTimeout(function () { that.hideVideo(); }, 50 * 1000 );
    }, 5 * 1000);    
  },
  onShow: function () {
    this.hideVideo();    
    this.played = false;
    this.top.style['cursor'] = 'pointer';
    this.top.addEventListener("click", this.fClick);        
  },
  onHide: function () {    
    this.top.removeEventListener("click", this.fClick);    
    this.hideVideo();
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
        '<span class=\"about-label\">by raz0red</span><a href=\"https://github.com/raz0red/js7800\"><img\n' +
          'class=\"about-logo\" src=\"images/github-logo.svg\" draggable="false" alt=\"GitHub: JS7800 by raz0red\"\n' +
          'title=\"GitHub: JS7800 by raz0red\"></a>\n' +
      '</p>\n' +
      '<p class=\"center\">\n' +
        'JS7800 is an enhanced JavaScript port of the <a href="https://gstanton.github.io/ProSystem1_3/">ProSystem Atari 7800 emulator</a> that was originally\n' +
        'developed by Greg Stanton\n' +
      '</p>';
    var outer = document.createElement('div');
    outer.style['text-align'] = 'center';
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
    this.videoEl = document.createElement('div');
    this.videoEl.className = 'about-atari__video';
    this.wrapperEl.appendChild(this.videoEl);
    var iframe = document.createElement('iframe');
    this.iframe = iframe;
    iframe.setAttribute('width', '100%');
    iframe.setAttribute('height', '100%');      
    iframe.setAttribute('frameborder', '0');
    iframe.setAttribute('allow', 'autoplay');
    this.videoEl.appendChild(iframe);    

    var footer = document.createElement('div');
    about.appendChild(footer);
    footer.innerHTML =
      '<p class=\"center\">\n' +
        'Atari 7800 controller illustration was created by Mark Davis (<a href="https://vectogram.us/">Vect-O-Gram</a>)<br>\n' + 
        'Portions of the Pokey code were adapted from the <a href="https://www.mamedev.org/">MAME</a> implementation<br>\n' +
        'MD5 support was developed by Joseph Myers (<a href="http://www.myersdaily.org/joseph/javascript/md5-text.html">MD5.js</a>)<br>\n' +      
        'Zip support was developed by Gildas Lormeau (<a href="http://gildas-lormeau.github.io/zip.js">Zip.js</a>)\n' +      
      '</p>';
  }
});


export { AboutTab }