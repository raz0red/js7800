import * as Util from "./util.js"
import * as DialogModule from "./dialog.js"
import { AboutTab } from "./about-tab.js"

var TabbedDialog = DialogModule.TabbedDialog;
var TabSet = DialogModule.TabSet;
var Tab = DialogModule.Tab;
var addProps = Util.addProps;

var tabSet = new TabSet();
tabSet.addTab(new AboutTab(), true);

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

