var customHeader = (function () {
  'use strict';

  const charIt = (chars, string) => `${chars[0]}${string}${chars[1]}`;

  // let offset = 0;

  /**
   * @param {object} element HTMLElement
   * @param {function} template custom-html templateResult
   * @param {object} properties {}
   */
  var render = (element, template, properties = {}) => {
    let offset = 0;
    const result = template(properties);
    if (element.shadowRoot) element = element.shadowRoot;
    if (!element.innerHTML) {
      element.innerHTML = result.template;
    }
    const length = element.innerHTML.length;
    result.changes.forEach(change => {
      const position = change.from.position;
      const chars = [
        element.innerHTML.charAt(((position[0] - 1) + offset)),
        element.innerHTML.charAt(((position[1]) + offset))
      ];
      element.innerHTML = element.innerHTML.replace(
        charIt(chars, change.from.value), charIt(chars, change.to.value)
      );
      offset = element.innerHTML.length - length;
    });
    return;
  }

  // TODO: check for change & render change only
  const set = [];

  /**
   *
   * @example
   ```js
    const template = html`<h1>${'name'}</h1>`;
    let templateResult = template({name: 'Olivia'})
    element.innerHTML = templateResult.template;
    templateResult = template({name: 'Jon'})
    element.innerHTML = templateResult.template;

    // you can also update the changes only
    templateResult.changes.forEach(change => {
      change.from.value // previous value
      change.from.position // previous position
      change.to.value // new value
      change.to.position // new position
      // check https://github.com/vandeurenglenn/custom-renderer for an example how to implement.
    });

   ```
   */
  const html$1 = (strings, ...keys) => {
    return ((...values) => {
      const dict = values[values.length - 1] || {};
      let template = strings[0];
      const changes = [];
      if (values[0] !== undefined) {
        keys.forEach((key, i) => {
          let value = Number.isInteger(key) ? values[key] : dict[key];
          if (value === undefined && Array.isArray(key)) {
            value = key.join('');
          } else if (value === undefined && !Array.isArray(key) && set[i]) {
            value = set[i].value; // set previous value, doesn't require developer to pass all properties
          } else if (value === undefined && !Array.isArray(key) && !set[i]) {
            value = '';
          }
          const string = strings[i + 1];
          const stringLength = string.length;
          const start = template.length;
          const end = template.length + value.length;
          const position = [start, end];

          if (set[i] && set[i].value !== value) {
            changes.push({
              from: {
                value: set[i].value,
                position: set[i].position,
              },
              to: {
                value,
                position
              }
            });
            set[i].value = value;
            set[i].position = [start, end];
          } else if (!set[i]) {
            set.push({value, position: [start, end]});
            changes.push({
              from: {
                value: null,
                position
              },
              to: {
                value,
                position
              }
            });
          }
          template += `${value}${string}`;
        });
      } else {
        template += strings[0];
      }
      return {
        template,
        changes
      };
    });
  };

  window.html = window.html || html$1;

  var RenderMixin = (base = HTMLElement) =>
  class RenderMixin extends base {

    constructor() {
      super();
        // check template for slotted and set shadowRoot if not set already
      if (this.template && this.shouldAttachShadow() && !this.shadowRoot)
        this.attachShadow({mode: 'open'});

      this.renderer = this.renderer.bind(this);
      this.render = this.renderer;
    }

    renderer(properties = this.properties, template = this.template) {
      if (!properties) properties = {};
      else if (!this.isFlat(properties)) {
        // check if we are dealing with an flat or indexed object
        // create flat object getting the values from super if there is one
        // default to given properties set properties[key].value
        // this implementation is meant to work with 'property-mixin'
        // checkout https://github.com/vandeurenglenn/backed/src/mixin/property-mixin
        // while I did not test, I believe it should be compatible with PolymerElements
        const object = {};
        // try getting value from this.property
        // try getting value from properties.property.value
        // try getting value from property.property
        // fallback to property
        Object.keys(properties).forEach(key =>
          object[key] = this[key] || properties[key].value || property[key] || key
        );
        properties = object;
      }
      render(this, template, properties);
    }

    /**
     * wether or not the template contains slot tags
     */
    shouldAttachShadow() {
      if (this.shadowRoot) return false;
      else return Boolean(String(this.template().template).match(/<slot>(.*)<\/slot>/));
    }

    /**
     * wether or not properties is just an object or indexed object (like {prop: {value: 'value'}})
     */
    isFlat(object) {
      const firstObject = object[Object.keys(object)[0]];
      if (firstObject && firstObject.hasOwnProperty('value')) return false;
      else return true;
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();

      if (this.render) {
        this.render();
        this.rendered = true;
      }  }
  }

  var customHeader = (() => {
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
    }  customElements.define('custom-header', CustomHeader);
  })();

  return customHeader;

}());
