import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"
import { AboutTab } from "./about-tab.js"

var TabbedDialog = DialogModule.TabbedDialog;
var TabSet = DialogModule.TabSet;
var Tab = DialogModule.Tab;
var addProps = Util.addProps;

// 
// Help Tab
//

function HelpTab(title) {
  Tab.call(this, title);
}
HelpTab.prototype = Object.create(Tab.prototype);
addProps(HelpTab.prototype, {  
  root: null,
  loaded: false,
  onTabShow: function() {
    if (!this.loaded) {
      this.loaded = true; 
      // var that = this;
      // setTimeout(function() {
      //   that.root.innerHTML = "";
      // }, 5000);
    }
  },  
  createTabContent: function (rootEl) { 
    this.root = rootEl;
    var parent = document.createElement("div");
    parent.className = "loader-container";    
    var loader = document.createElement("div");
    loader.className = "loader";
    parent.appendChild(loader);
    rootEl.appendChild(parent);
  },
});

var testTab = new HelpTab("Overview");

var tabSet = new TabSet();
tabSet.addTab(new AboutTab(), true);
//tabSet.addTab(testTab);

//
// Help dialog
//

function HelpDialog() {
  TabbedDialog.call(this, "Help", true);
}
HelpDialog.prototype = Object.create(TabbedDialog.prototype);
addProps(HelpDialog.prototype, {
  getTabSet: function () { return tabSet; }
});

export { HelpDialog }

