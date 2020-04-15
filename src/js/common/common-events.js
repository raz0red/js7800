var topicToListeners = {};

function Listener(topic, cb) {
  this.topic = topic;
  if (cb) {
    this.onEvent = cb;
  }
}
Listener.prototype = {
  getTopic: function () { return this.topic },
  onEvent: function (event) { }
}

function addListener(listener) {
  var topic = listener.getTopic();
  var listeners = topicToListeners[topic];
  if (!listeners) {
    listeners = [];
    topicToListeners[topic] = listeners;
  }
  listeners.push(listener);
}

function fireEvent(topic, event) {
  var listeners = topicToListeners[topic];
  if (listeners) {
    for (var idx = 0; idx < listeners.length; idx++) {
      listeners[idx].onEvent(event);
    }
  }
}

export {
  Listener,
  addListener,
  fireEvent
}