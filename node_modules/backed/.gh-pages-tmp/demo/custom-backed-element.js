'use strict';
// import Backed from '../backed.min.js';
import LitMixin from './../src/mixins/lit-mixin.js';
import {merge} from './../src/utils.js';
import PropertyMixin from './../src/mixins/property-mixin.js';

const SomeMixin = base => class extends PropertyMixin(LitMixin(base)) {
  constructor(options) {
    super(options)
  }
  ready() {
    console.log(`${this.localName} mixin ready!`);
  }
  foo() {
    console.log('hello world from foo!');
  }
}
class CustomBackedElement extends SomeMixin(HTMLElement) {
  static get observers() {
    return ['change(name, status)'];
  }
  static get properties() {
    return merge(super.properties, {
      /**
       * Does not subscribe an observer for changes
       */
      name: {
        reflect: true,
        renderer: 'render',
        global: true // publishes values to global.name
      },
      status: {
        observer: 'change'
      },
      index: {
        reflect: true,
        renderer: 'render',
        value: 0
      }
    });
  }
  constructor() {
    super()
    // don't access DOM here
    console.log(`${this.localName} created!`);
  }
  connectedCallback() {
    console.log(`${this.localName} connected!`);
  }
  disconnectedCallback() {
    console.log(`${this.localName} disconnected!`);
  }
  /**
   * called when an property changes (with render set to true)
   */
  render() {
    return html`
    <style>
       span {
         padding: 0 12px;
         font-family: sans-serif;
         font-weight: 700;
         font-size: 22px;
         color: blue;
       }
       slot[name="foo"]::slotted(*) {
         padding: 0 12px;
         font-family: sans-serif;
         font-size: 22px;
         color: green;
       }
    </style>
    <span><slot>hello</slot></span>
    <slot name="foo"></slot>
    ${this.name}
    ${this.index}
    `;
  }
  /**
   * @param {object} change
   * @param {string} change.property
   * @param {string|object|array|number|boolean} change.value
   */
  change(change, chan) {
    if (this.name && this.status) {
    }
    console.log(`change:
      property: ${change.property}
      value: ${change.value}`
    );
  }
}
export default customElements.define('custom-backed-element', CustomBackedElement);
