var snackbarEl = null;
var errorMessageEl = null;
var errorTextEl = null;
var messageId = 0;
var messageStart = Date.now();

function init(elementId) {
  // The fullscreen container
  var parent = document.getElementById(elementId);

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
  snackbarEl.onclick = function() { hideMessage(-1); }
  snackbarEl.classList.add('show');
  snackbarEl.classList.remove('hide');

  messageStart = Date.now();
  return ++messageId;
}

function hideMessage(mid, timeoutIn) {
  var force = (mid == -1);
  if ((mid == messageId) || force) {  
    var timeout = 0;
    if (!force && timeoutIn) {
      var now = Date.now();
      var elapsed = now - messageStart;
      if (elapsed < timeoutIn) {
        timeout = timeoutIn - elapsed;
      }
    }
    setTimeout(function() {
      if (force || (mid == messageId)) {
        snackbarEl.classList.add('hide');
        snackbarEl.classList.remove('show');
      }
    }, timeout);
  }
}

function showErrorMessage(message) {
  hideMessage(-1);
  errorTextEl.innerHTML = message;
  errorMessageEl.classList.add('show');
  errorMessageEl.classList.remove('hide');
}

function hideErrorMessage() {
  errorMessageEl.classList.add('hide');
  errorMessageEl.classList.remove('show');
}

export {
  showMessage,
  hideMessage,
  showErrorMessage,
  hideErrorMessage,
  init
}