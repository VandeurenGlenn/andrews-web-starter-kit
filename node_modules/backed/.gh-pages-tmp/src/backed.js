'use strict';
import base from './base.js';
// import renderStatus from './internals/render-status.js';
import hyphenate from './utils/hyphenate.js';
import shouldRegister from './utils/should-register.js';


/**
 *
 * @module backed
 * @param {class} _class
 */
export default _class => {
  let klass;
  // get the tagName or try to make one with class.name
  let name = _class.is || hyphenate(_class.name);
  // Setup properties & observers
  const observedAttributes = [];
  klass = class extends _class {
    static get observedAttributes() {
      return Object.entries(_class.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
    }
    constructor() {
      super();
      base.constructorCallback(this, _class);
    }
    connectedCallback() {
      base.connectedCallback(this, _class);
    }
    attributeChangedCallback(name, oldValue, newValue) {
      this[name] = newValue;
    }
  }
  if (shouldRegister(name, klass)) {
    customElements.define(name, klass);
  };
};
