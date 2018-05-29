'use strict';
import RenderMixin from '../../custom-renderer-mixin/src/render-mixin.js';

export default (() => {
  class CustomHeader extends RenderMixin(HTMLElement) {
    constructor() {
      super();
    }
    get template() {
      return html`
        <style>
          :host {
            display: block;
            height: var(--custom-header-height, 48px);
            background: var(--custom-header-background, #46484f);
            width: 100%;
            box-shadow: 0px 3px 5px 0px #777;
          }
        </style>
        <slot></slot>
        <slot name="toolbar"></slot>
      `;
    }
  };
  customElements.define('custom-header', CustomHeader)
})();
