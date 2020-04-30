import * as Events from "./events.js"

var snackbarEl = null;
var errorMessageEl = null;
var errorTextEl = null;

function init() {
  // The fullscreen container
  var parent = document.getElementById('js7800__fullscreen-container');

  // Snackbar (Loading messages, etc.)
  snackbarEl = document.createElement('div');
  snackbarEl.id = 'snackbar';
  snackbarEl.classList.add('message');
  parent.appendChild(snackbarEl);

  // Error message
  errorMessageEl = document.createElement('div');
  errorMessageEl.id = 'errormsg';
  errorMessageEl.classList.add('message');
  errorMessageEl.onclick = hideErrorMessage;
  parent.appendChild(errorMessageEl);
  var closeButtonEl = document.createElement('span');
  closeButtonEl.classList.add('closebtn');
  closeButtonEl.onclick = hideErrorMessage;
  errorMessageEl.appendChild(closeButtonEl);
  closeButtonEl.innerHTML = '&times;';
  errorTextEl = document.createElement('span');
  errorMessageEl.appendChild(errorTextEl);
}

function showMessage(message) {
  hideErrorMessage();
  snackbarEl.innerHTML = message;
  snackbarEl.classList.add('show');
  snackbarEl.classList.remove('hide');
}

function hideMessage() {
  snackbarEl.classList.add('hide');
  snackbarEl.classList.remove('show');
}

function showErrorMessage(message) {
  hideMessage();
  errorTextEl.innerHTML = message;
  errorMessageEl.classList.add('show');
  errorMessageEl.classList.remove('hide');
}

function hideErrorMessage() {
  errorMessageEl.classList.add('hide');
  errorMessageEl.classList.remove('show');
}

Events.addListener(new Events.Listener("siteInit", init));

export {
  showMessage,
  hideMessage,
  showErrorMessage,
  hideErrorMessage
}