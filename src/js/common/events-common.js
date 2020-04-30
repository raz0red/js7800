var topicToListeners = {};
var parentEvents = null;

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
  if (parentEvents) {
    var l = new parentEvents.Listener();
    l.getTopic = function() { return listener.getTopic(); }
    l.onEvent = function(e) { listener.onEvent(e); }
    parentEvents.addListener(l);
  } else {
    var topic = listener.getTopic();
    var listeners = topicToListeners[topic];
    if (!listeners) {
      listeners = [];
      topicToListeners[topic] = listeners;
    }
    listeners.push(listener);
  }
}

function fireEvent(topic, event) {
  if (parentEvents) {
    parentEvents.fireEvent(topic, event);
  } else {
    var listeners = topicToListeners[topic];
    if (listeners) {
      for (var idx = 0; idx < listeners.length; idx++) {
        listeners[idx].onEvent(event);
      }
    }
  }
}

function setParentEvents(parent) {
  parentEvents = parent;
  for (var t in topicToListeners) {
    var listeners = topicToListeners[t];
    for (var i = 0; i < listeners.length; i++)  {
      addListener(listeners[i]);
    }
  }
}

export {
  setParentEvents,
  Listener,
  addListener,
  fireEvent
}