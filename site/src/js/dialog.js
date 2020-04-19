import * as UiCommon from "../../../src/js/common/ui-common.js"
import * as Utils from "./util.js"

var cbar = null;
var Component = UiCommon.Component;
var Button = UiCommon.Button;

var addProps = Utils.addProps;

//
// Dialog Button
//

function DialogButton(text, title) {
  Button.call(this, text, title);
}
DialogButton.prototype = Object.create(Button.prototype);
addProps(DialogButton.prototype, {
  getClass: function () {
    return "dialog-button";
  },
});

//
// Dialog
//

function Dialog(title) {
  Component.call(this);

  this.title = title;

  this.modalEl = null;
  this.contentEl = null;
  this.bodyEl = null;
  this.headerEl = null;
  this.bodyEl = null;
  this.footerEl = null;

  this.ok = null;
  this.cancel = null;

  var that = this;
  this.windowResizeFunc = function (e) {
    that.modalEl.style['padding-top'] = "" +
      (((window.innerHeight - that.contentEl.offsetHeight) / 2) | 0) + "px";
  };
}
Dialog.prototype = Object.create(Component.prototype);
addProps(Dialog.prototype, {
  getClass: function () { return "modal"; },
  doCreateElement: function () {
    // Modal
    var modalEl = document.createElement("div");
    this.modalEl = modalEl;

    // Content
    var contentEl = document.createElement("div");
    this.contentEl = contentEl;
    contentEl.className = "modal-content";
    modalEl.appendChild(contentEl);

    // Header
    var headerEl = document.createElement("div");
    this.headerEl = headerEl;
    headerEl.className = "modal-header";
    headerEl.appendChild(document.createTextNode(this.title));
    contentEl.appendChild(headerEl);

    // Body 
    var bodyEl = document.createElement("div");
    this.bodyEl = bodyEl;
    bodyEl.className = "modal-body";
    contentEl.appendChild(bodyEl);

    // Add body content
    this.addBodyContent(bodyEl);
    var clear = document.createElement("div");
    clear.style = "clear:both";
    contentEl.appendChild(clear);

    // Footer
    var footerEl = document.createElement("div");
    this.footerEl = footerEl;
    footerEl.className = "modal-footer";
    contentEl.appendChild(footerEl);

    // Add footer content
    this.addFooterContent(footerEl);
    clear = document.createElement("div");
    clear.style = "clear:both";
    footerEl.appendChild(clear);

    return modalEl;
  },
  addFooterContent: function (footerEl) {
    var dialog = this;

    var ok = new DialogButton("OK", "OK");
    this.ok = ok;
    var cancel = new DialogButton("Cancel", "Cancel");
    this.cancel = cancel;

    ok.onClick = function () { dialog.hide(); }
    cancel.onClick = function () { dialog.hide(); }

    footerEl.appendChild(cancel.createElement());
    footerEl.appendChild(ok.createElement());
  },
  addBodyContent: function (bodyEl) { },
  show: function () {
    window.addEventListener("resize", this.windowResizeFunc);
    this.modalEl.style.display = "block";
    this.windowResizeFunc();
  },
  hide: function () {
    window.removeEventListener("resize", this.windowResizeFunc);
    this.modalEl.style.display = "none";
  }
});

// 
// TabSet
//

function TabSet() {
  Component.call(this);
  this.tabs = [];
  this.defaultTab = null;
}
TabSet.prototype = Object.create(Component.prototype);
addProps(TabSet.prototype, {
  onTabClick: function (tab) {
    var that = this;
    for (var i = 0; i < this.tabs.length; i++) {
      var ii = i;
      (function () {
        var tab = that.tabs[ii];
        var buttonEl = tab.getButtonElement();
        buttonEl.className = buttonEl.className.replace(" active", "");
        tab.getElement().style.display = "none";
      })();
    }
    tab.getButtonElement().className += " active";
    tab.getElement().style.display = "block";
  },
  doCreateElement: function () {
    var that = this;

    // Root
    var rootEl = document.createElement("div");
    rootEl.className = "tabset";

    // Tabs
    var tabsEl = document.createElement("div");
    tabsEl.className = "tab";
    rootEl.appendChild(tabsEl);

    // Add tab buttons
    for (var i = 0; i < this.tabs.length; i++) {
      var ii = i;
      (function () {
        var tab = that.tabs[ii];
        var buttonEl = tab.createButtonElement();
        tabsEl.appendChild(buttonEl)
        buttonEl.onclick = function () { that.onTabClick(tab) };
      })();
    }

    // Add tab content
    for (var i = 0; i < this.tabs.length; i++) {
      rootEl.appendChild(this.tabs[i].createElement());
    }

    var clear = document.createElement("div");
    clear.style = "clear:both";
    rootEl.appendChild(clear);

    // Select the default tab
    if (this.defaultTab) {
      this.onTabClick(this.defaultTab);
    }

    return rootEl;
  },
  addTab: function (tab, isDefault) {
    this.tabs.push(tab);
    if (isDefault) {
      this.defaultTab = tab;
    }
  }
});

// 
// Tab
//

function Tab(title) {
  Component.call(this);

  this.title = title;
  this.buttonEl = null;
}
Tab.prototype = Object.create(Component.prototype);
addProps(Tab.prototype, {
  getClass: function () { return "tabcontent"; },
  getButtonElement: function () { return this.buttonEl },
  createButtonElement: function () {
    var buttonEl = document.createElement("button");
    this.buttonEl = buttonEl;
    buttonEl.appendChild(document.createTextNode(this.getTitle()));
    buttonEl.className = "tablinks";
    return buttonEl;
  },
  getTitle: function () { return this.title; },
  createTabContent: function (rootEl) { },
  doCreateElement: function () {
    var rootEl = document.createElement("div");
    this.createTabContent(rootEl);
    return rootEl;
  }
});

export {
  Dialog,
  DialogButton,
  TabSet,
  Tab
}