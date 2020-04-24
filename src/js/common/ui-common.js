import * as Utils from "../util.js"

var addProps = Utils.addProps;

/* Component */
function Component() {
  this.el = null;
}
Component.prototype = {
  createElement: function () {
    this.el = this.doCreateElement();
    var clazz = this.getClass();
    if (clazz) {
      this.el.className = clazz;
    }
    return this.el;
  },
  getClass: function () { return null; },
  getElement: function () { return this.el },
  doCreateElement: function () { return null; }
};

/* Button */
function Button(text, title) {
  Component.call(this);
  this.title = title;
  this.text = text;
}
Button.prototype = Object.create(Component.prototype);
addProps(Button.prototype, {
  getClass: function () {
    return "js7800__controls-button";
  },
  doCreateElement: function () {
    var btn = document.createElement("button");
    var self = this;
    btn.onclick = function (event) { self.onClick(event) };
    btn.onmousedown = function (event) { self.onDown(event) };
    btn.onmouseup = function (event) { self.onUp(event) };
    var text = document.createTextNode(this.text);
    btn.appendChild(text);
    if (this.title) {
      btn.setAttribute("title", this.title);
    }
    return btn;
  },
  onClick: function (event) { },
  onDown: function (event) { },
  onUp: function (event) { }
});

export {
  Component,
  Button
}
