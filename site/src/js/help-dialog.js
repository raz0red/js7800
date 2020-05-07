import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"
import * as Events from "./events.js"
import { AboutTab } from "./about-tab.js"

var TabbedDialog = DialogModule.TabbedDialog;
var TabSet = DialogModule.TabSet;
var Tab = DialogModule.Tab;
var addProps = Util.addProps;
var debug = false;

// 
// Help Tab
//

function HelpTab(title, url) {
  Tab.call(this, title);
  this.url = url;
}
HelpTab.prototype = Object.create(Tab.prototype);
addProps(HelpTab.prototype, {  
  root: null,
  parent: null,
  loaded: false,
  onTabShow: function() {
    if (!this.loaded) {      
      var that = this;
      
      var failure = function(msg) {
        var outMsg = "An error occurred attempting to load page: " + that.url;
        if (msg) {
          outMsg += " (" + msg + ")";
        }
        Events.fireEvent("showError", outMsg);
      }
      
      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.url);
      xhr.onload = function () {
        if (xhr.status == 200) {
          that.loaded = true; 
          that.parent.classList.remove('loader-container');
          that.parent.style.display = 'none';
          that.parent.innerHTML = xhr.responseText;
          setTimeout(function () { that.parent.style.display = 'block' }, 100);
        } else {
          failure(xhr.status + ": " + xhr.statusText);
        }
      }
      xhr.onerror = function() {
        failure(); 
      }    
      setTimeout(function() { xhr.send(); }, 500);
    }
  },  
  createTabContent: function (rootEl) { 
    this.root = rootEl;
    var parent = document.createElement("div");
    this.parent = parent;
    parent.className = "loader-container";    
    var loader = document.createElement("div");
    loader.className = "loader";
    parent.appendChild(loader);
    rootEl.appendChild(parent);
  },
});

var overviewTab = new HelpTab("Overview", "help/overview.html");
var cartsTab = new HelpTab("Cartridges", "help/carts.html");
var cbarTab = new HelpTab("Controls Bar", "help/cbar.html");
var settingsTab = new HelpTab("Settings Dialog", "help/settings.html");
var highScoresTab = new HelpTab("High Scores", "help/highscores.html");

var tabSet = new TabSet();
tabSet.addTab(new AboutTab(), true);
tabSet.addTab(overviewTab);
if (Util.getRequestParameter("indev") == "true") { 
  tabSet.addTab(cartsTab);
  tabSet.addTab(cbarTab);
  tabSet.addTab(settingsTab);
  tabSet.addTab(highScoresTab);
}

//
// Help dialog
//

function HelpDialog() {
  TabbedDialog.call(this, "Help", true);
}
HelpDialog.prototype = Object.create(TabbedDialog.prototype);
addProps(HelpDialog.prototype, {
  cssLoaded: false,
  getTabSet: function () { return tabSet; },
  onShow: function () {
    if (!this.cssLoaded) {
      this.cssLoaded = true;
      var link = document.createElement("link");
      link.type = "text/css";
      link.rel = "stylesheet";
      link.href = "help/css/help.css";
      document.head.appendChild(link);
    }
    TabbedDialog.prototype.onShow.call(this);
  },
});

export { HelpDialog }


