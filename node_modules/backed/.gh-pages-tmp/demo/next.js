import BackedElement from './../src/backed-element.js';
import { repeat } from './../node_modules/lit-html/lib/repeat.js';

export default define(class NextElement extends BackedElement(HTMLElement) {
  static get template() {
    return html`<style></style><slot></slot>`;
  }
  constructor() {
    super()
  }
})
