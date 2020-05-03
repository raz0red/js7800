import * as UiCommon from "../../../src/js/common/ui-common.js"
import * as Utils from "./util.js"
import * as Events from "./events.js"

var Component = UiCommon.Component;
var Button = UiCommon.Button;
var ToggleSwitch = UiCommon.ToggleSwitch;

var addProps = Utils.addProps;
var js7800 = null;

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
// Dialog Toggle Switch
//

function DialogToggleSwitch(title) {
  ToggleSwitch.call(this, title);
}
DialogToggleSwitch.prototype = Object.create(ToggleSwitch.prototype);
addProps(DialogToggleSwitch.prototype, {
  getClass: function () {
     return "dialog-switch";
  },
});

//
// Dialog Select
//

function DialogSelect(opts) {
  Component.call(this);
  this.opts = opts;
}
DialogSelect.prototype = Object.create(Component.prototype);
addProps(DialogSelect.prototype, {
  select: null,
  getClass: function () {
     return "dialog-select";
  },
  setValue: function(val) {
    this.select.value = val;
  },
  getValue: function() {
    return this.select.value;
  },
  doCreateElement: function() {
    var div = document.createElement("div");    
    var sel = document.createElement("select");
    div.appendChild(sel);
    this.select = sel;
    for (var name in this.opts)  {
      var opt = document.createElement('option');
      opt.text = name;
      opt.value = this.opts[name];
      this.select.add(opt);
    }
    return div;
  }
});

//
// Dialog
//

function Dialog(title, isReadOnly) {
  Component.call(this);
  
  this.isReadOnly = isReadOnly ? true : false;
  this.title = title;

  this.modalEl = null;
  this.contentEl = null;
  this.bodyEl = null;
  this.headerEl = null;
  this.bodyEl = null;
  this.footerEl = null;

  this.ok = null;
  this.cancel = null;
  this.defaults = null;

  this.pauseButton = null;
  this.paused = false;

  var that = this;
  this.windowResizeFunc = function (e) {
    that.modalEl.style.paddingTop =
      (((window.innerHeight - that.contentEl.offsetHeight) / 2) | 0) + "px";
  };
}
Dialog.prototype = Object.create(Component.prototype);
addProps(Dialog.prototype, {
  onShow: function () {},
  onHide: function () {},
  onOk: function() {},
  onDefaults: function() {},
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
    clear.style.clear = "both";
    contentEl.appendChild(clear);

    // Footer
    var footerEl = document.createElement("div");
    this.footerEl = footerEl;
    footerEl.className = "modal-footer";
    contentEl.appendChild(footerEl);

    // Add footer content
    this.addFooterContent(footerEl);
    clear = document.createElement("div");
    clear.style.clear = "both";
    footerEl.appendChild(clear);

    return modalEl;
  },
  addFooterContent: function (footerEl) {
    var dialog = this;

    var defDiv = document.createElement("div");
    defDiv.style.flexGrow = 1;    

    if (this.isReadOnly) {
      var cancel = new DialogButton("Close");
      this.cancel = cancel;

      footerEl.appendChild(defDiv);
      footerEl.appendChild(cancel.createElement());        
    } else {
      var ok = new DialogButton("OK");
      this.ok = ok;
      var cancel = new DialogButton("Cancel");
      this.cancel = cancel;
      var defaults = new DialogButton("Defaults", "Reset to Defaults");
      this.defaults = defaults;

      ok.onClick = function () {
        dialog.onOk();
        dialog.hide();
      }

      defaults.onClick = function () {
        dialog.onDefaults();
      }

      defDiv.appendChild(defaults.createElement());
      footerEl.appendChild(defDiv);
      footerEl.appendChild(ok.createElement());
      footerEl.appendChild(cancel.createElement());        
    }

    cancel.onClick = function () {
      dialog.hide();
    }
  },
  addBodyContent: function (bodyEl) { },
  show: function () {
    var pauseButton = js7800.ControlsBar.pauseButton;
    this.pauseButton = pauseButton;
    this.paused = pauseButton.getValue();
    if (!this.paused) {
      pauseButton.setValue(true);
      pauseButton.onClick();      
    }

    // Call on show callback
    this.onShow();

    window.addEventListener("resize", this.windowResizeFunc);
    this.modalEl.style.display = "block";
    this.windowResizeFunc();
  },
  hide: function () {
    window.removeEventListener("resize", this.windowResizeFunc);
    this.modalEl.style.display = "none";

    // Call on hide callback
    this.onHide();

    if (!this.paused) {
      this.pauseButton.setValue(false);
      this.pauseButton.onClick();
    }
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
        if ((buttonEl.className.indexOf(" active") != -1)) {
          tab.onTabHide();
        }
        buttonEl.className = buttonEl.className.replace(" active", "");
        tab.getElement().style.display = "none";
      })();
    }
    tab.onTabShow();
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
    clear.style.clear = "both";
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
  onTabShow: function() {},
  onTabHide: function() {},
  onShow: function() {},
  onHide: function() {},
  onOk: function() {},
  onDefaults: function() {},
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

//
// Tabbed Dialog
//

function TabbedDialog(title, isReadOnly) {
  Dialog.call(this, title, isReadOnly);
  this.tabset = this.getTabSet();
}
TabbedDialog.prototype = Object.create(Dialog.prototype);
addProps(TabbedDialog.prototype, {
  getTabSet: function () {},
  onShow: function () {
    Dialog.prototype.onShow.call(this);
    var tabs = this.tabset.tabs;
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onShow();
    }
  },
  onHide: function () {
    Dialog.prototype.onHide.call(this);
    var tabs = this.tabset.tabs;
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onHide();
    }
  },
  onOk: function() {
    Dialog.prototype.onOk.call(this);
    var tabs = this.tabset.tabs;
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onOk();
    }
  },
  onDefaults: function() {
    Dialog.prototype.onDefaults.call(this);
    var tabs = this.tabset.tabs;
    for (var i = 0; i < tabs.length; i++) {
        tabs[i].onDefaults();
    }
  },
  addBodyContent: function (bodyEl) {
    Dialog.prototype.addBodyContent.call(this);
    bodyEl.appendChild(this.tabset.createElement());
  },
});

//
// Dialog Cells
//

function Cell() {
  Component.call(this);
}
Cell.prototype = Object.create(Component.prototype);
addProps(Cell.prototype, {
  doCreateElement: function () {
    return document.createElement("div");
  }
});


function LabelCell(label) {
  Cell.call(this);
  this.label = label;
}
LabelCell.prototype = Object.create(Cell.prototype);
addProps(LabelCell.prototype, {
  getClass: function () {
    return "dialog-cell-label";
  },
  doCreateElement: function () {
    var el = Cell.prototype.doCreateElement.call(this);
    if (this.label) {
      el.appendChild(document.createTextNode(this.label))
    }
    return el;
  }
});

function ContentCell(content) {
  Cell.call(this);
  this.content = content;
}
ContentCell.prototype = Object.create(Cell.prototype);
addProps(ContentCell.prototype, {
  getClass: function () {
    return "dialog-cell-content";
  },
  doCreateElement: function() {
    var el = Cell.prototype.doCreateElement.call(this);
    if ((typeof this.content) === 'string') {
      el.appendChild(document.createTextNode(this.content));
    } else {
      el.appendChild(this.content.createElement());
    }
    return el;
  }
});

//
// Dialog Grid
//

function Grid() {
  Component.call(this);
  this.cells = [];
}
Grid.prototype = Object.create(Component.prototype);
addProps(Grid.prototype, {
  getClass: function () {
    return "dialog-grid";
  },
  doCreateElement: function () {
    var root = document.createElement("div");
    for (var i = 0; i < this.cells.length; i++) {
      root.appendChild(this.cells[i].createElement());
    }
    return root;
  },
  addCell: function(cell) {
    this.cells.push(cell);
  }
});


Events.addListener(new Events.Listener("siteInit",
  function (event) {
    js7800 = event.js7800;
  }
));

export {
  Dialog,
  DialogButton,
  DialogToggleSwitch,
  DialogSelect,
  TabbedDialog,
  TabSet,
  Tab,
  Grid,
  LabelCell,
  ContentCell
}