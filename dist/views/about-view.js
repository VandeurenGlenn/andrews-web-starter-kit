var AboutView = (function () {
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
          object[key] = this[key] || properties[key].value || properties[key] || key
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

  /**
   * @module CSSMixin
   * @mixin Backed
   * @param {class} base class to extend from
   */
   const mixins = {
    'mixin(--css-row)': `display: flex;
        flex-direction: row;
  `,
    'mixin(--css-column)': `display: flex;
        flex-direction: column;
  `,
    'mixin(--css-center)': `align-items: center;`,
    'mixin(--css-header)': `height: 128px;
        width: 100%;
        background: var(--primary-color);
        color: var(--text-color);
        mixin(--css-column)`,
    'mixin(--css-flex)': `flex: 1;`,
    'mixin(--css-flex-2)': `flex: 2;`,
    'mixin(--css-flex-3)': `flex: 3;`,
    'mixin(--css-flex-4)': `flex: 4;`,
    'mixin(--material-palette)': `--dark-primary-color: #00796B;
        --light-primary-color: #B2DFDB;
        --primary-color: #009688;
        --text-color: #FFF;
        --primary-text-color: #212121;
        --secondary-text-color: #757575;
        --divider-color: #BDBDBD;
        --accent-color: #4CAF50;
        --disabled-text-color: #BDBDBD;
        --primary-background-color: #f9ffff;
        --dialog-background-color: #FFFFFF;`,
    'mixin(--css-hero)': `display: flex;
        max-width: 600px;
        max-height: 340px;
        height: 100%;
        width: 100%;
        box-shadow: 3px 2px 4px 2px rgba(0,0,0, 0.15),
                    -2px 0px 4px 2px rgba(0,0,0, 0.15);
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        border-radius: 2px;
  `,
    'mixin(--css-elevation-2dp)': `
    box-shadow: 0 2px 2px 0 rgba(0, 0, 0, 0.14),
                0 1px 5px 0 rgba(0, 0, 0, 0.12),
                0 3px 1px -2px rgba(0, 0, 0, 0.2);`,

    'mixin(--css-elevation-3dp)': `
    box-shadow: 0 3px 4px 0 rgba(0, 0, 0, 0.14),
                0 1px 8px 0 rgba(0, 0, 0, 0.12),
                0 3px 3px -2px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-4dp)': `
    box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                0 1px 10px 0 rgba(0, 0, 0, 0.12),
                0 2px 4px -1px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-6dp)': `
    box-shadow: 0 6px 10px 0 rgba(0, 0, 0, 0.14),
                0 1px 18px 0 rgba(0, 0, 0, 0.12),
                0 3px 5px -1px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-8dp)': `
    box-shadow: 0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12),
                0 5px 5px -3px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-12dp)': `
    box-shadow: 0 12px 16px 1px rgba(0, 0, 0, 0.14),
                0 4px 22px 3px rgba(0, 0, 0, 0.12),
                0 6px 7px -4px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-16dp)': `
    box-shadow: 0 16px 24px 2px rgba(0, 0, 0, 0.14),
                0  6px 30px 5px rgba(0, 0, 0, 0.12),
                0  8px 10px -5px rgba(0, 0, 0, 0.4);`,
    'mixin(--css-elevation-24dp)': `
    box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14),
                0 9px 46px 8px rgba(0, 0, 0, 0.12),
                0 11px 15px -7px rgba(0, 0, 0, 0.4);`
   };

   const classes = {
     'apply(--css-row)': `.row {
        mixin(--css-row)
      }
   `,
     'apply(--css-column)': `.column {
        mixin(--css-column)
      }
   `,
     'apply(--css-flex)': `.flex {
        mixin(--css-flex)
      }
   `,
     'apply(--css-flex-2)': `.flex-2 {
     mixin(--css-flex-2)
   }`,
     'apply(--css-flex-3)': `.flex-3 {
     mixin(--css-flex-3)
   }`,
     'apply(--css-flex-4)': `.flex-4 {
     mixin(--css-flex-4)
   }`,
     'apply(--css-center)': `.center {
        align-items: center;
      }
   `,
     'apply(--css-center-center)': `.center-center {
        align-items: center;
        justify-content: center;
      }
   `,
     'apply(--css-header)': `header, .header {
     mixin(--css-header)
   }`,
     'apply(--css-hero)': `.hero {
      mixin(--css-hero)
   }`,
     'apply(--css-elevation-2dp)': `.elevation-2dp {
      mixin(--css-elevation-2dp)
   }`,
     'apply(--css-elevation-3dp)': `.elevation-3dp {
      mixin(--css-elevation-3dp)
   }`,
     'apply(--css-elevation-4dp)': `.elevation-4dp {
      mixin(--css-elevation-4dp)
   }`,
     'apply(--css-elevation-6dp)': `.elevation-6dp {
      mixin(--css-elevation-6dp)
   }`,
     'apply(--css-elevation-8dp)': `.elevation-8dp {
      mixin(--css-elevation-8dp)
   }`,
     'apply(--css-elevation-12dp)': `.elevation-12dp {
      mixin(--css-elevation-12dp)
   }`,
     'apply(--css-elevation-16dp)': `.elevation-16dp {
      mixin(--css-elevation-16dp)
   }`,
     'apply(--css-elevation-18dp)': `.elevation-18dp {
      mixin(--css-elevation-18dp)
   }`
   };
  var CSSMixin = base => {
    return class CSSMixin extends base {

      get style() {
        return this.shadowRoot.querySelector('style');
      }
      constructor() {
        super();
        // this._transformClass = this._transformClass.bind(this)
      }
      connectedCallback() {
        // TODO: test
        console.warn('test!!');
        if (super.connectedCallback) super.connectedCallback();
        // TODO: Implement better way to check if LitMixin is used
        if (this.render) this.hasLitMixin = true;
        else if(this.template) console.log('element');

        this._init();
      }
      _init() {
        if (this.hasLitMixin) {
          if (!this.rendered) {
            return requestAnimationFrame(() => {
                this._init();
              });
          }
        }
        const styles = this.shadowRoot ? this.shadowRoot.querySelectorAll('style') : this.querySelectorAll('style');
        // const matches = style.innerHTML.match(/apply((.*))/g);
        styles.forEach(style => {
          this._applyClasses(style.innerHTML).then(innerHTML => {
            if (innerHTML) this.style.innerHTML = innerHTML;
            this._applyMixins(style.innerHTML).then(innerHTML => {
              if (innerHTML) this.style.innerHTML = innerHTML;
            });
          }).catch(error => {
            console.error(error);
          });
        });
        // this._applyVariables(matches, style);
      }

      _applyMixins(string) {
        const mixinInMixin = string => {
          const matches = string.match(/mixin((.*))/g);
          if (matches) {
            for (const match of matches) {
              const mixin = mixins[match];
              string = string.replace(match, mixin);
            }
          }
          return string;
        };
        return new Promise((resolve, reject) => {
          const matches = string.match(/mixin((.*))/g);
          if (matches) for (const match of matches) {
            const mixin = mixinInMixin(mixins[match]);
            console.log(mixin);
            string = string.replace(match, mixin);
            // return [
            //   match, mixins[match]
            // ]

          }        resolve(string);
        });
      }

      _applyClasses(string) {
        return new Promise((resolve, reject) => {
          const matches = string.match(/apply((.*))/g);
          if (matches) for (const match of matches) {
            // this._applyMixins(classes[match]).then(klass => {
              string = string.replace(match, classes[match]);
            // });
          }
          // this.style.innerHTML = string;
          resolve(string);
        });
      }
    }
  }

  var aboutView = customElements.define('about-view', class AboutView extends RenderMixin(CSSMixin(HTMLElement)) {
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }
    get template() {
      return html`
      <style>
        :host {
          padding: 10px;
          display: flex;
          flex-direction: column;
        }
        h1 {
          margin: 0;
          padding-bottom: 32px;
        }
        apply(--css-flex)
      </style>
      <h1>About</h1>

      <summary>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </summary>
      <span class="flex"></span>
      <summary>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </summary>
    `;
    }
  })

  return aboutView;

}());
