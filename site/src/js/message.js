import * as Events from "./events.js"
import * as MessageCommon from "./common/message-common.js"

var showMessage = MessageCommon.showMessage;
var hideMessage = MessageCommon.hideMessage;
var showErrorMessage = MessageCommon.showErrorMessage;
var hideErrorMessage = MessageCommon.hideErrorMessage;

Events.addListener(new Events.Listener("siteInit", function() {
  MessageCommon.init('js7800__fullscreen-container');
}));

export {
  showMessage,
  hideMessage,
  showErrorMessage,
  hideErrorMessage
}