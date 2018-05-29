import LitMixin from './mixins/lit-mixin.js';
import PropertyMixin from './mixins/property-mixin.js';
import {define} from './utils.js';

window.define = window.define || define;

export default (base=HTMLElement) => {
  return class BackedElement extends PropertyMixin(LitMixin(base)) {
    static get properties() {
      return {
        template: {
          renderer: 'render'
        }
      }
    }
    constructor() {
      super({});
    }
    render() {
      return customElements.get(this.localName).template;
    }
  }
}
