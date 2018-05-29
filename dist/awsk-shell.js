var AwskShell = (function () {
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

  window.Backed = window.Backed || {};
  // binding does it's magic using the propertyStore ...
  window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();

  // TODO: Create & add global observer
  var PropertyMixin = base => {
    return class PropertyMixin extends base {
      static get observedAttributes() {
        return Object.entries(this.properties).map(entry => {if (entry[1].reflect) {return entry[0]} else return null});
      }

      get properties() {
        return customElements.get(this.localName).properties;
      }

      constructor() {
        super();
        if (this.properties) {
          for (const entry of Object.entries(this.properties)) {
            const { observer, reflect, renderer } = entry[1];
            // allways define property even when renderer is not found.
            this.defineProperty(entry[0], entry[1]);
          }
        }
      }

      connectedCallback() {
        if (super.connectedCallback) super.connectedCallback();
        if (this.attributes)
          for (const attribute of this.attributes) {
            if (String(attribute.name).includes('on-')) {
              const fn = attribute.value;
              const name = attribute.name.replace('on-', '');
              this.addEventListener(String(name), event => {
                let target = event.path[0];
                while (!target.host) {
                  target = target.parentNode;
                }
                if (target.host[fn]) {
                  target.host[fn](event);
                }
              });
            }
        }
      }

      attributeChangedCallback(name, oldValue, newValue) {
        this[name] = newValue;
      }

      /**
       * @param {function} options.observer callback function returns {instance, property, value}
       * @param {boolean} options.reflect when true, reflects value to attribute
       * @param {function} options.render callback function for renderer (example: usage with lit-html, {render: render(html, shadowRoot)})
       */
      defineProperty(property = null, {strict = false, observer, reflect = false, renderer, value}) {
        Object.defineProperty(this, property, {
          set(value) {
            if (value === this[`___${property}`]) return;
            this[`___${property}`] = value;

            if (reflect) {
              if (value) this.setAttribute(property, String(value));
              else this.removeAttribute(property);
            }

            if (observer) {
              if (observer in this) this[observer]();
              else console.warn(`observer::${observer} undefined`);
            }

            if (renderer) {
              const obj = {};
              obj[property] = value;
              if (renderer in this) this.render(obj, this[renderer]);
              else console.warn(`renderer::${renderer} undefined`);
            }

          },
          get() {
            return this[`___${property}`];
          },
          configurable: strict ? false : true
        });
        // check if attribute is defined and update property with it's value
        // else fallback to it's default value (if any)
        const attr = this.getAttribute(property);
        this[property] = attr || this.hasAttribute(property) || value;
      }
    }
  }

  /**
   * @mixin Backed
   * @module utils
   * @export loadScript
   *
   * defer handles loading after the document is parsed, async loads while parsing
   *
   * @param {string} src link/path to the script to load
   * @param {string} method default: 'async',  options: `defer, async, ''`
   * @param {string} type default: undefined,  options: `module, utf-8, ...`
   * @return {object} merge result
   */
   var loadScript = (src, method = 'async', type) => {
     return new Promise((resolve, reject) => {
       let script = document.createElement('script');
       script.setAttribute(method, '');
       if (type) script.setAttribute('type', type);
       script.onload = result => {
         resolve(result);
       };
       script.onerror = error => {
         reject(error);
       };
       script.src = src;
       document.body.appendChild(script);
     });
   }

  /**
   * Add space between camelCase text.
   */
  var unCamelCase = (string) => {
    string = string.replace(/([a-z\xE0-\xFF])([A-Z\xC0\xDF])/g, '$1 $2');
    string = string.toLowerCase();
    return string;
  };

  /**
  * Replaces all accented chars with regular ones
  */
  var replaceAccents = (string) => {
    // verifies if the String has accents and replace them
    if (string.search(/[\xC0-\xFF]/g) > -1) {
        string = string
                .replace(/[\xC0-\xC5]/g, 'A')
                .replace(/[\xC6]/g, 'AE')
                .replace(/[\xC7]/g, 'C')
                .replace(/[\xC8-\xCB]/g, 'E')
                .replace(/[\xCC-\xCF]/g, 'I')
                .replace(/[\xD0]/g, 'D')
                .replace(/[\xD1]/g, 'N')
                .replace(/[\xD2-\xD6\xD8]/g, 'O')
                .replace(/[\xD9-\xDC]/g, 'U')
                .replace(/[\xDD]/g, 'Y')
                .replace(/[\xDE]/g, 'P')
                .replace(/[\xE0-\xE5]/g, 'a')
                .replace(/[\xE6]/g, 'ae')
                .replace(/[\xE7]/g, 'c')
                .replace(/[\xE8-\xEB]/g, 'e')
                .replace(/[\xEC-\xEF]/g, 'i')
                .replace(/[\xF1]/g, 'n')
                .replace(/[\xF2-\xF6\xF8]/g, 'o')
                .replace(/[\xF9-\xFC]/g, 'u')
                .replace(/[\xFE]/g, 'p')
                .replace(/[\xFD\xFF]/g, 'y');
    }

    return string;
  };

  var removeNonWord = (string) => string.replace(/[^0-9a-zA-Z\xC0-\xFF \-]/g, '');

  const WHITE_SPACES = [
      ' ', '\n', '\r', '\t', '\f', '\v', '\u00A0', '\u1680', '\u180E',
      '\u2000', '\u2001', '\u2002', '\u2003', '\u2004', '\u2005', '\u2006',
      '\u2007', '\u2008', '\u2009', '\u200A', '\u2028', '\u2029', '\u202F',
      '\u205F', '\u3000'
  ];

  /**
  * Remove chars from beginning of string.
  */
  var ltrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    let start = 0,
        len = string.length,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && start < len) {
        found = false;
        i = -1;
        c = string.charAt(start);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                start++;
                break;
            }
        }
    }

    return (start >= len) ? '' : string.substr(start, len);
  };

  /**
  * Remove chars from end of string.
  */
  var rtrim = (string, chars) => {
    chars = chars || WHITE_SPACES;

    var end = string.length - 1,
        charLen = chars.length,
        found = true,
        i, c;

    while (found && end >= 0) {
        found = false;
        i = -1;
        c = string.charAt(end);

        while (++i < charLen) {
            if (c === chars[i]) {
                found = true;
                end--;
                break;
            }
        }
    }

    return (end >= 0) ? string.substring(0, end + 1) : '';
  }

  /**
   * Remove white-spaces from beginning and end of string.
   */
  var trim = (string, chars) => {
    chars = chars || WHITE_SPACES;
    return ltrim(rtrim(string, chars), chars);
  }

  /**
   * Convert to lower case, remove accents, remove non-word chars and
   * replace spaces with the specified delimeter.
   * Does not split camelCase text.
   */
  var slugify = (string, delimeter) => {
    if (delimeter == null) {
        delimeter = "-";
    }

    string = replaceAccents(string);
    string = removeNonWord(string);
    string = trim(string) //should come after removeNonWord
            .replace(/ +/g, delimeter) //replace spaces with delimeter
            .toLowerCase();
    return string;
  };

  /**
  * Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
  */
  var hyphenate = string => {
    string = unCamelCase(string);
    return slugify(string, "-");
  }

  const shouldRegister = name => {
    return customElements.get(name) ? false : true;
  };

  var define = klass => {
    const name = hyphenate(klass.name);
    return shouldRegister(name) ? customElements.define(name, klass) : '';
  }

  /**
   * @mixin Backed
   * @module utils
   * @export merge
   *
   * some-prop -> someProp
   *
   * @param {object} object The object to merge with
   * @param {object} source The object to merge
   * @return {object} merge result
   */
  var merge = (object = {}, source = {}) => {
    // deep assign
    for (const key of Object.keys(object)) {
      if (source[key]) {
        Object.assign(object[key], source[key]);
      }
    }
    // assign the rest
    for (const key of Object.keys(source)) {
      if (!object[key]) {
        object[key] = source[key];
      }
    }
    return object;
  }

  var CustomEffects = base => class CustomEffects extends base {
    get effects() {
      return customElements.get(this.localName).effects;
    }
    constructor() {
      super();
    }

    connectedCallback() {
      if (super.connectedCallback) super.connectedCallback();
      if (this.effects) {
        for (const effect of this.effects) {
          this._initEffect(effect);
        }
      }
    }

    _initEffect(effect) {
      if (typeof effect === 'string') {
        effect = [effect, effect === 'resize' || effect === 'scroll' ? window : this];
      }    return new Promise((resolve, reject) => {
        effect[1].addEventListener(effect[0], event => {
          const func = effect[0].slice(0, 1).toUpperCase() + effect[0].slice(1);
          if (this[`on${func}`]) {
            this[`on${func}`](event);
          } else {
            console.warn(`on${func} method missing`);
          }
        });
      });
    }
  }

  /**
   * @example
   * <custom-app-layout>
   *   <header slot="header" fixed></header>
   *   <section slot="content"></section> // appears under the header
   * </custom-app-layout>
   * @extends RenderMixin, PropertyMixin, HTMLElement
   */
  define(class CustomAppLayout extends RenderMixin(PropertyMixin(CustomEffects(HTMLElement))) {
    /**
     * @return {object}
     */
    static get properties() {
      return merge(super.properties, {});
    }

    /**
     * @return {array} [effects]
     */
    static get effects() {
      return ['resize'];
    }

    /**
     * calls super
     */
    constructor() {
      super();
      this.attachShadow({mode: 'open'});
    }

    connectedCallback() {
      super.connectedCallback();
      this.onResize();
    }

    // iterate trough slots untill no slot is found
    slotted(slot) {
      slot = slot.assignedNodes();
      if (slot[0] && slot[0].localName === 'slot') {
        return this.slotted(slot[0]);
      } else {
        for (const node of slot) {
          if (node.nodeType === 1) {
            this.__nodeList.push(node);
          }
        }
        if (this.__nodeList.length !== 0) return this.__nodeList;
      }
      return [slot];
    }

    get headers() {
      this.__nodeList = [];
      return this.slotted(this.shadowRoot.querySelector('slot[name="header"]'));
    }

    get container() {
      return this.shadowRoot.querySelector('.content-container');
    }

    onResize() {
      const headers = this.headers;
      let offsetHeight = 0;
      if (headers.length !== 0) {
        for (const header of headers) {
          offsetHeight += header.offsetHeight;
        }
      } else {
        offsetHeight = headers[0].offsetHeight;
      }
      if (headers[0].hasAttribute('fixed') && !headers[0].hasAttribute('condenses')) {
        // If the header size does not change and we're using a scrolling region, exclude
        // the header area from the scrolling region so that the header doesn't overlap
        // the scrollbar.
        requestAnimationFrame(() => {
          this.contentContainer.style.marginTop = offsetHeight + 'px';
          this.contentContainer.style.paddingTop = '';
        });
      } else {
        requestAnimationFrame(() => {
          this.contentContainer.style.marginTop = '';
          this.contentContainer.style.paddingTop = offsetHeight + 'px';
        });
      }
    }

    get contentContainer() {
      return this.shadowRoot.querySelector('.content-container')
    }

    get template() {
      return html`
      <style>
        :host {
          display: block;
          position: relative;
          height: 100%;
          z-index: 0;
          display: flex;
          flex-direction: column;
        }
        :host([fullbleed]) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
        }
        :host:not([fixed]) ::slotted([slot="header"]) {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          z-index: 1;
        }
        .content-container {
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          flex: 1;
          flex-direction: column;
          z-index: 0;
          overflow-y: auto;
          -webkit-overflow-scrolling: touch;
        }
      </style>
      <slot name="header"></slot>
      <span class="content-container">
        <slot name="content"></slot>
      </span>
    `;
    }
  });

  (() => {
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

  var SelectMixin = base => {
    return class SelectMixin extends PropertyMixin(base) {

      static get properties() {
        return merge(super.properties, {
          selected: {
            value: 0,
            observer: '__selectedObserver__'
          }
        });
      }

      constructor() {
        super();
      }

      get slotted() {
        return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
      }

      get _assignedNodes() {
        return 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
      }

      /**
      * @return {String}
      */
      get attrForSelected() {
        return this.getAttribute('attr-for-selected') || 'name';
      }

      set attrForSelected(value) {
        this.setAttribute('attr-for-selected', value);
      }

      attributeChangedCallback(name, oldValue, newValue) {
        if (oldValue !== newValue) {
          // check if value is number
          if (!isNaN(newValue)) {
            newValue = Number(newValue);
          }
          this[name] = newValue;
        }
      }

      /**
       * @param {string|number|HTMLElement} selected
       */
      select(selected) {
        this.selected = selected;
      }

      next(string) {
        const index = this.getIndexFor(this.currentSelected);
        if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
            (index + 1) <= this._assignedNodes.length - 1) {
          this.selected = this._assignedNodes[index + 1];
        }
      }

      previous() {
        const index = this.getIndexFor(this.currentSelected);
        if (index !== -1 && index >= 0 && this._assignedNodes.length > index &&
            (index - 1) >= 0) {
          this.selected = this._assignedNodes[index - 1];
        }
      }

      getIndexFor(element) {
        if (element && element instanceof HTMLElement === false)
          return console.error(`${element} is not an instanceof HTMLElement`);

        return this._assignedNodes.indexOf(element || this.selected);
      }

      _updateSelected(selected) {
        selected.classList.add('custom-selected');
        if (this.currentSelected && this.currentSelected !== selected) {
          this.currentSelected.classList.remove('custom-selected');
        }
        this.currentSelected = selected;
      }

      /**
       * @param {string|number|HTMLElement} change.value
       */
      __selectedObserver__(value) {
        switch (typeof this.selected) {
          case 'object':
            this._updateSelected(this.selected);
            break;
          case 'string':
            for (const child of this._assignedNodes) {
              if (child.nodeType === 1) {
                if (child.getAttribute(this.attrForSelected) === this.selected) {
                  return this._updateSelected(child);
                }
              }
            }
            if (this.currentSelected) {
              this.currentSelected.classList.remove('custom-selected');
            }
            break;
          default:
            // set selected by index
            const child = this._assignedNodes[this.selected];
            if (child && child.nodeType === 1) {
              this._updateSelected(child);
            // remove selected even when nothing found, better to return nothing
            } else if (this.currentSelected) {
              this.currentSelected.classList.remove('custom-selected');
            }
        }
      }
    }
  }

  /**
   * @extends HTMLElement
   */
  class CustomPages extends SelectMixin(HTMLElement) {
    constructor() {
      super();
      this.slotchange = this.slotchange.bind(this);
      this.attachShadow({mode: 'open'});
      this.shadowRoot.innerHTML = `
      <style>
        :host {
          flex: 1;
          position: relative;
          --primary-background-color: #ECEFF1;
          overflow: hidden;
        }
        ::slotted(*) {
          display: flex;
          position: absolute;
          opacity: 0;
          pointer-events: none;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          transition: transform ease-out 160ms, opacity ease-out 60ms;
          /*transform: scale(0.5);*/
          transform-origin: left;
        }
        ::slotted(.animate-up) {
          transform: translateY(-120%);
        }
        ::slotted(.animate-down) {
          transform: translateY(120%);
        }
        ::slotted(.custom-selected) {
          opacity: 1;
          pointer-events: auto;
          transform: translateY(0);
          transition: transform ease-in 160ms, opacity ease-in 320ms;
          max-height: 100%;
          max-width: 100%;
        }
      </style>
      <!-- TODO: scale animation, ace doesn't resize that well ... -->
      <div class="wrapper">
        <slot></slot>
      </div>
    `;
    }

    connectedCallback() {
      super.connectedCallback();
      this.shadowRoot.querySelector('slot').addEventListener('slotchange', this.slotchange);
    }

    isEvenNumber(number) {
      return Boolean(number % 2 === 0)
    }

    /**
     * set animation class when slot changes
     */
    slotchange() {
      let call = 0;
      for (const child of this.slotted.assignedNodes()) {
        if (child && child.nodeType === 1) {
          child.style.zIndex = 99 - call;
          if (this.isEvenNumber(call++)) {
            child.classList.add('animate-down');
          } else {
            child.classList.add('animate-up');
          }
          this.dispatchEvent(new CustomEvent('child-change', {detail: child}));
        }
      }
    }
  }customElements.define('custom-pages', CustomPages);

  customElements.define('home-view', class HomeView extends RenderMixin(HTMLElement) {
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
      </style>
      <h1>Welcome</h1>

      <summary>
        Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
      </summary>
    `;
    }
  });

  var awskShell = customElements.define('awsk-shell',
    class AwskShell extends PropertyMixin(RenderMixin(HTMLElement)) {

      static get properties() {
        return {
          title: {
            value: 'awsk-app',
            observer: 'titleObserver'
          }
        }
      }

      get pages() {
        return this.shadowRoot.querySelector('custom-pages');
      }

      constructor() {
        super();
        this.attachShadow({mode: 'open'});
        this._clickHandler = this._clickHandler.bind(this);
        this.addEventListener('click', this._clickHandler);
      }

      titleObserver() {
        // render everytime title changes
        // this.render();
      }

      get template() {
        return html`
        <style>
          :host {
            display: block;
            width: 100%;
            height: 100%;
          }
          h1, h2, h3, h4 {
            margin: 0;
          }
          custom-header {
            display: flex;
            align-items: center;
            padding: 5px 10px;
            box-sizing: border-box;
            color: #ddd;
          }
          custom-pages {
            display: block;
            width: 100%;
            height: 100%;
            max-width: 700px;
            box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                        0 1px 10px 0 rgba(0, 0, 0, 0.12),
                        0 2px 4px -1px rgba(0, 0, 0, 0.4);
          }
          .title {
            font-size: 2.2em;
            font-weight: 700;
            text-transform: uppercase;
          }
          .flex {
            flex: 1;
          }
          button {
            border: none;
            padding: 8px;
            box-sizing: border-box;
            background: transparent;
            color: #eee;
            text-transform: uppercase;
            cursor: pointer;
          }

          .content {
            display: flex;
            flex-direction: column;
            align-items: center;
            width: 100%;
            height: 100%;
            box-sizing: border-box;
          }
          @media (min-width: 780px) {
            .content {
              padding: 45px 0;
            }
          }
        </style>
        <custom-app-layout>
          <custom-header slot="header" fixed>
            <span class="title">${'title'}</span>
            <span class="flex"></span>
            <button data-route="home">home</button>
            <button data-route="about">about</button>
          </custom-header>
          <span class="content" slot="content">
            <custom-pages selected="home" attr-for-selected="data-route">
              <home-view data-route="home"></home-view>
              <about-view data-route="about"></about-view>
            </custom-pages>
          </span>
        </custom-app-layout>
      `;
      }

      loadView(route) {
        return new Promise((resolve, reject) => {
          if (!this.loadedSet) this.loadedSet = {};
          if (this.loadedSet[route]) return resolve();

          const path = `${esImportsSupported ? 'src/views' : 'dist/views'}`;
          const type = esImportsSupported ? 'module' : null;
          loadScript(`${path}/${route}-view.js`, 'defer', type)
            .then(() => {
              this.loadedSet[route] = true;
              resolve();
            })
            .catch(e => reject(e));
        });
      }
      _clickHandler({path}) {
        if (path[0] && path[0].localName === 'button' && path[0].dataset.route) {
          this.loadView(path[0].dataset.route).then(() => {
            this.pages.selected = path[0].dataset.route;
          });

        }
      }
    }
  );

  return awskShell;

}());
