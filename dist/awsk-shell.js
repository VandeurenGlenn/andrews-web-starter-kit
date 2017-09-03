var AWSK = (function () {
'use strict';

function html$1(e, ...t) {
  let s = templates.get(e);return void 0 === s && (s = new Template(e), templates.set(e, s)), new TemplateResult(s, t);
}function render(e, t) {
  let s = t.__templateInstance;if (void 0 !== s && s.template === e.template && s instanceof TemplateInstance) return void s.update(e.values);s = new TemplateInstance(e.template), t.__templateInstance = s;const n = s._clone();for (s.update(e.values); t.firstChild;) t.removeChild(t.firstChild);t.appendChild(n);
}const templates = new Map();class TemplateResult {
  constructor(e, t) {
    this.template = e, this.values = t;
  }
}const exprMarker = "{{}}";class TemplatePart {
  constructor(e, t, s, n, r) {
    this.type = e, this.index = t, this.name = s, this.rawName = n, this.strings = r;
  }
}class Template {
  constructor(e) {
    this.parts = [], this._strings = e, this._parse();
  }_parse() {
    this.element = document.createElement("template"), this.element.innerHTML = this._getTemplateHtml(this._strings);const e = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);let t = -1,
        s = 0;const n = [],
          r = [];for (; e.nextNode();) {
      t++;const i = e.currentNode;if (i.nodeType === Node.ELEMENT_NODE) {
        const e = i.attributes;for (let n = 0; n < e.length; n++) {
          const i = e.item(n),
                o = i.value.split(exprMarker);if (o.length > 1) {
            const e = this._strings[s],
                  n = e.substring(0, e.length - o[0].length).match(/((?:\w|[.\-_$])+)=["']?$/)[1];this.parts.push(new TemplatePart("attribute", t, i.name, n, o)), r.push(i), s += o.length - 1;
          }
        }
      } else if (i.nodeType === Node.TEXT_NODE) {
        const e = i.nodeValue.split(exprMarker);if (e.length > 1) {
          s += e.length - 1;for (let s = 0; s < e.length; s++) {
            const n = e[s],
                  r = new Text(n);i.parentNode.insertBefore(r, i), t++, s < e.length - 1 && (i.parentNode.insertBefore(new Text(), i), i.parentNode.insertBefore(new Text(), i), this.parts.push(new TemplatePart("node", t)), t += 2);
          }t--, n.push(i);
        } else i.nodeValue.trim() || (n.push(i), t--);
      }
    }for (const e of n) e.parentNode.removeChild(e);for (const e of r) e.ownerElement.removeAttribute(e.name);
  }_getTemplateHtml(e) {
    const t = [];for (let s = 0; s < e.length; s++) t.push(e[s]), s < e.length - 1 && t.push(exprMarker);return t.join("");
  }
}class Part {
  constructor(e) {
    this.instance = e;
  }_getValue(e) {
    if ("function" == typeof e) try {
      e = e(this);
    } catch (e) {
      return void console.error(e);
    }if (null !== e) return e;
  }
}class AttributePart extends Part {
  constructor(e, t, s, n) {
    super(e), console.assert(t.nodeType === Node.ELEMENT_NODE), this.element = t, this.name = s, this.strings = n;
  }setValue(e) {
    const t = this.strings;let s = "";for (let n = 0; n < t.length; n++) if (s += t[n], n < t.length - 1) {
      const t = this._getValue(e[n]);if (t && "string" != typeof t && t[Symbol.iterator]) for (const e of t) s += e;else s += t;
    }this.element.setAttribute(this.name, s);
  }get size() {
    return this.strings.length - 1;
  }
}class NodePart extends Part {
  constructor(e, t, s) {
    super(e), this.startNode = t, this.endNode = s;
  }setValue(e) {
    (e = this._getValue(e)) instanceof Node ? this._previousValue = this._setNodeValue(e) : e instanceof TemplateResult ? this._previousValue = this._setTemplateResultValue(e) : e && void 0 !== e.then ? (e.then(t => {
      this._previousValue === e && this.setValue(t);
    }), this._previousValue = e) : e && "string" != typeof e && e[Symbol.iterator] ? this._previousValue = this._setIterableValue(e) : this.startNode.nextSibling === this.endNode.previousSibling && this.startNode.nextSibling.nodeType === Node.TEXT_NODE ? (this.startNode.nextSibling.textContent = e, this._previousValue = e) : this._previousValue = this._setTextValue(e);
  }_insertNodeBeforeEndNode(e) {
    this.endNode.parentNode.insertBefore(e, this.endNode);
  }_setNodeValue(e) {
    return this.clear(), this._insertNodeBeforeEndNode(e), e;
  }_setTextValue(e) {
    return this._setNodeValue(new Text(e));
  }_setTemplateResultValue(e) {
    let t;return this._previousValue && this._previousValue._template === e.template ? t = this._previousValue : (t = this.instance._createInstance(e.template), this._setNodeValue(t._clone())), t.update(e.values), t;
  }_setIterableValue(e) {
    let t,
        s = this.startNode;const n = e[Symbol.iterator](),
          r = Array.isArray(this._previousValue) ? this._previousValue : void 0;let i = 0;const o = [];let a = n.next(),
        l = n.next();for (a.done && this.clear(); !a.done;) {
      let e;void 0 !== r && i < r.length ? (e = r[i++], l.done && e.endNode !== this.endNode && (this.clear(e.endNode.previousSibling), e.endNode = this.endNode), t = e.endNode) : (l.done ? t = this.endNode : (t = new Text(), this._insertNodeBeforeEndNode(t)), e = new NodePart(this.instance, s, t)), e.setValue(a.value), o.push(e), a = l, l = n.next(), s = t;
    }return o;
  }clear(e = this.startNode) {
    this._previousValue = void 0;let t = e.nextSibling;for (; null !== t && t !== this.endNode;) {
      let e = t.nextSibling;t.parentNode.removeChild(t), t = e;
    }
  }
}class TemplateInstance {
  constructor(e) {
    this._parts = [], this._template = e;
  }get template() {
    return this._template;
  }update(e) {
    let t = 0;for (const s of this._parts) void 0 === s.size ? s.setValue(e[t++]) : (s.setValue(e.slice(t, t + s.size)), t += s.size);
  }_clone() {
    const e = document.importNode(this._template.element.content, !0);if (this._template.parts.length > 0) {
      const t = document.createTreeWalker(e, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT),
            s = this._template.parts;let n = 0,
          r = 0,
          i = s[0],
          o = t.nextNode();for (; null != o && r < s.length;) n === i.index ? (this._parts.push(this._createPart(i, o)), i = s[++r]) : (n++, o = t.nextNode());
    }return e;
  }_createPart(e, t) {
    if ("attribute" === e.type) return new AttributePart(this, t, e.name, e.strings);if ("node" === e.type) return new NodePart(this, t, t.nextSibling);throw new Error(`unknown part type: ${e.type}`);
  }_createInstance(e) {
    return new TemplateInstance(e);
  }
}window.html = window.html || html$1, window.Backed = window.Backed || {}, window.Backed.Renderer = window.Backed.Renderer || render;var litMixin$1 = e => class t extends e {
  get propertyStore() {
    return window.Backed.PropertyStore;
  }constructor(e = {}) {
    if (super(e), this.attachShadow({ mode: "open" }), !this._isValidRenderer(this.render)) throw "Invalid renderer!";if (!this.render) throw "Missing render method!";render(this.render(), this.shadowRoot);
  }_isValidRenderer(e) {
    if (e) return String(e).includes("return html`");
  }
};

window.Backed = window.Backed || {}, window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();const render$1 = window.Backed.Renderer;var propertyMixin$1 = e => class r extends e {
  constructor(e = {}) {
    super(e), this.properties = e.properties;
  }connectedCallback() {
    if (this.properties) for (const e of Object.entries(this.properties)) {
      const { observer: r, reflect: t, renderer: i } = e[1];(r || t || i) && (i && !render$1 && console.warn("Renderer undefined"), this.defineProperty(e[0], e[1]));
    }
  }defineProperty(e = null, { strict: r = !1, observer: t, reflect: i = !1, renderer: n, value: s }) {
    Object.defineProperty(this, e, { set(r) {
        r !== this[`___${e}`] && (this[`___${e}`] = r, i && (r ? this.setAttributte(e, String(r)) : this.removeAttribute(e)), t && (t in this ? this[t]() : console.warn(`observer::${t} undefined`)), n && (n in this ? render$1(this[n](), this.shadowRoot) : console.warn(`renderer::${n} undefined`)));
      }, get() {
        return this[`___${e}`];
      }, configurable: !r });const o = this.getAttribute(e);this[e] = o || this.hasAttribute(e) || s;
  }
};

/**
 * @license
 * Copyright (c) 2017 The Polymer Project Authors. All rights reserved.
 * This code may only be used under the BSD style license found at
 * http://polymer.github.io/LICENSE.txt
 * The complete set of authors may be found at
 * http://polymer.github.io/AUTHORS.txt
 * The complete set of contributors may be found at
 * http://polymer.github.io/CONTRIBUTORS.txt
 * Code distributed by Google as part of the polymer project is also
 * subject to an additional IP rights grant found at
 * http://polymer.github.io/PATENTS.txt
 */
const templates$1 = new Map();
function html$2(strings, ...values) {
    let template = templates$1.get(strings);
    if (template === undefined) {
        template = new Template$1(strings);
        templates$1.set(strings, template);
    }
    return new TemplateResult$1(template, values);
}
class TemplateResult$1 {
    constructor(template, values) {
        this.template = template;
        this.values = values;
    }
}
function render$2(result, container) {
    let instance = container.__templateInstance;
    if (instance !== undefined && instance.template === result.template && instance instanceof TemplateInstance$1) {
        instance.update(result.values);
        return;
    }
    instance = new TemplateInstance$1(result.template);
    container.__templateInstance = instance;
    const fragment = instance._clone();
    instance.update(result.values);
    while (container.firstChild) {
        container.removeChild(container.firstChild);
    }
    container.appendChild(fragment);
}
const exprMarker$1 = '{{}}';
class TemplatePart$1 {
    constructor(type, index, name, rawName, strings) {
        this.type = type;
        this.index = index;
        this.name = name;
        this.rawName = rawName;
        this.strings = strings;
    }
}
class Template$1 {
    constructor(strings) {
        this.parts = [];
        this._strings = strings;
        this._parse();
    }
    _parse() {
        this.element = document.createElement('template');
        this.element.innerHTML = this._getTemplateHtml(this._strings);
        const walker = document.createTreeWalker(this.element.content, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
        let index = -1;
        let partIndex = 0;
        const nodesToRemove = [];
        const attributesToRemove = [];
        while (walker.nextNode()) {
            index++;
            const node = walker.currentNode;
            if (node.nodeType === Node.ELEMENT_NODE) {
                const attributes = node.attributes;
                for (let i = 0; i < attributes.length; i++) {
                    const attribute = attributes.item(i);
                    const value = attribute.value;
                    const strings = value.split(exprMarker$1);
                    if (strings.length > 1) {
                        const attributeString = this._strings[partIndex];
                        const rawNameString = attributeString.substring(0, attributeString.length - strings[0].length);
                        const match = rawNameString.match(/((?:\w|[.\-_$])+)=["']?$/);
                        const rawName = match[1];
                        this.parts.push(new TemplatePart$1('attribute', index, attribute.name, rawName, strings));
                        attributesToRemove.push(attribute);
                        partIndex += strings.length - 1;
                    }
                }
            } else if (node.nodeType === Node.TEXT_NODE) {
                const strings = node.nodeValue.split(exprMarker$1);
                if (strings.length > 1) {
                    partIndex += strings.length - 1;
                    for (let i = 0; i < strings.length; i++) {
                        const string = strings[i];
                        const literalNode = new Text(string);
                        node.parentNode.insertBefore(literalNode, node);
                        index++;
                        if (i < strings.length - 1) {
                            node.parentNode.insertBefore(new Text(), node);
                            node.parentNode.insertBefore(new Text(), node);
                            this.parts.push(new TemplatePart$1('node', index));
                            index += 2;
                        }
                    }
                    index--;
                    nodesToRemove.push(node);
                } else if (!node.nodeValue.trim()) {
                    nodesToRemove.push(node);
                    index--;
                }
            }
        }
        for (const n of nodesToRemove) {
            n.parentNode.removeChild(n);
        }
        for (const a of attributesToRemove) {
            a.ownerElement.removeAttribute(a.name);
        }
    }
    _getTemplateHtml(strings) {
        const parts = [];
        for (let i = 0; i < strings.length; i++) {
            parts.push(strings[i]);
            if (i < strings.length - 1) {
                parts.push(exprMarker$1);
            }
        }
        return parts.join('');
    }
}
class Part$1 {
    constructor(instance) {
        this.instance = instance;
    }
    _getValue(value) {
        if (typeof value === 'function') {
            try {
                value = value(this);
            } catch (e) {
                console.error(e);
                return;
            }
        }
        if (value === null) {
            return undefined;
        }
        return value;
    }
}
class AttributePart$1 extends Part$1 {
    constructor(instance, element, name, strings) {
        super(instance);
        console.assert(element.nodeType === Node.ELEMENT_NODE);
        this.element = element;
        this.name = name;
        this.strings = strings;
    }
    setValue(values) {
        const strings = this.strings;
        let text = '';
        for (let i = 0; i < strings.length; i++) {
            text += strings[i];
            if (i < strings.length - 1) {
                const v = this._getValue(values[i]);
                if (v && typeof v !== 'string' && v[Symbol.iterator]) {
                    for (const t of v) {
                        text += t;
                    }
                } else {
                    text += v;
                }
            }
        }
        this.element.setAttribute(this.name, text);
    }
    get size() {
        return this.strings.length - 1;
    }
}
class NodePart$1 extends Part$1 {
    constructor(instance, startNode, endNode) {
        super(instance);
        this.startNode = startNode;
        this.endNode = endNode;
    }
    setValue(value) {
        value = this._getValue(value);
        if (value instanceof Node) {
            this._previousValue = this._setNodeValue(value);
        } else if (value instanceof TemplateResult$1) {
            this._previousValue = this._setTemplateResultValue(value);
        } else if (value && value.then !== undefined) {
            value.then(v => {
                if (this._previousValue === value) {
                    this.setValue(v);
                }
            });
            this._previousValue = value;
        } else if (value && typeof value !== 'string' && value[Symbol.iterator]) {
            this._previousValue = this._setIterableValue(value);
        } else if (this.startNode.nextSibling === this.endNode.previousSibling && this.startNode.nextSibling.nodeType === Node.TEXT_NODE) {
            this.startNode.nextSibling.textContent = value;
            this._previousValue = value;
        } else {
            this._previousValue = this._setTextValue(value);
        }
    }
    _insertNodeBeforeEndNode(node) {
        this.endNode.parentNode.insertBefore(node, this.endNode);
    }
    _setNodeValue(value) {
        this.clear();
        this._insertNodeBeforeEndNode(value);
        return value;
    }
    _setTextValue(value) {
        return this._setNodeValue(new Text(value));
    }
    _setTemplateResultValue(value) {
        let instance;
        if (this._previousValue && this._previousValue._template === value.template) {
            instance = this._previousValue;
        } else {
            instance = this.instance._createInstance(value.template);
            this._setNodeValue(instance._clone());
        }
        instance.update(value.values);
        return instance;
    }
    _setIterableValue(value) {
        let itemStart = this.startNode;
        let itemEnd;
        const values = value[Symbol.iterator]();
        const previousParts = Array.isArray(this._previousValue) ? this._previousValue : undefined;
        let previousPartsIndex = 0;
        const itemParts = [];
        let current = values.next();
        let next = values.next();
        if (current.done) {
            this.clear();
        }
        while (!current.done) {
            let itemPart;
            if (previousParts !== undefined && previousPartsIndex < previousParts.length) {
                itemPart = previousParts[previousPartsIndex++];
                if (next.done && itemPart.endNode !== this.endNode) {
                    this.clear(itemPart.endNode.previousSibling);
                    itemPart.endNode = this.endNode;
                }
                itemEnd = itemPart.endNode;
            } else {
                if (next.done) {
                    itemEnd = this.endNode;
                } else {
                    itemEnd = new Text();
                    this._insertNodeBeforeEndNode(itemEnd);
                }
                itemPart = new NodePart$1(this.instance, itemStart, itemEnd);
            }
            itemPart.setValue(current.value);
            itemParts.push(itemPart);
            current = next;
            next = values.next();
            itemStart = itemEnd;
        }
        return itemParts;
    }
    clear(startNode = this.startNode) {
        this._previousValue = undefined;
        let node = startNode.nextSibling;
        while (node !== null && node !== this.endNode) {
            let next = node.nextSibling;
            node.parentNode.removeChild(node);
            node = next;
        }
    }
}
class TemplateInstance$1 {
    constructor(template) {
        this._parts = [];
        this._template = template;
    }
    get template() {
        return this._template;
    }
    update(values) {
        let valueIndex = 0;
        for (const part of this._parts) {
            if (part.size === undefined) {
                part.setValue(values[valueIndex++]);
            } else {
                part.setValue(values.slice(valueIndex, valueIndex + part.size));
                valueIndex += part.size;
            }
        }
    }
    _clone() {
        const fragment = document.importNode(this._template.element.content, true);
        if (this._template.parts.length > 0) {
            const walker = document.createTreeWalker(fragment, NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_TEXT);
            const parts = this._template.parts;
            let index = 0;
            let partIndex = 0;
            let templatePart = parts[0];
            let node = walker.nextNode();
            while (node != null && partIndex < parts.length) {
                if (index === templatePart.index) {
                    this._parts.push(this._createPart(templatePart, node));
                    templatePart = parts[++partIndex];
                } else {
                    index++;
                    node = walker.nextNode();
                }
            }
        }
        return fragment;
    }
    _createPart(templatePart, node) {
        if (templatePart.type === 'attribute') {
            return new AttributePart$1(this, node, templatePart.name, templatePart.strings);
        } else if (templatePart.type === 'node') {
            return new NodePart$1(this, node, node.nextSibling);
        } else {
            throw new Error(`unknown part type: ${templatePart.type}`);
        }
    }
    _createInstance(template) {
        return new TemplateInstance$1(template);
    }
}
window.html = window.html || html$2;
window.Backed = window.Backed || {};
window.Backed.Renderer = window.Backed.Renderer || render$2;
var litMixin$2 = base => {
    return class LitMixin extends base {
        get propertyStore() {
            return window.Backed.PropertyStore;
        }
        constructor(options = {}) {
            super(options);
            this.attachShadow({ mode: 'open' });
            if (!this._isValidRenderer(this.render)) throw 'Invalid renderer!';
            if (this.render) render$2(this.render(), this.shadowRoot);else throw 'Missing render method!';
        }
        _isValidRenderer(renderer) {
            if (!renderer) {
                return;
            }
            return String(renderer).includes('return html`');
        }
    };
};

window.Backed = window.Backed || {};
window.Backed.PropertyStore = window.Backed.PropertyStore || new Map();
const render$3 = window.Backed.Renderer;
var propertyMixin$2 = base => {
  return class PropertyMixin extends base {
    constructor(options = {}) {
      super(options);
      this.properties = options.properties;
    }
    connectedCallback() {
      if (this.properties) {
        for (const entry of Object.entries(this.properties)) {
          const { observer, reflect, renderer } = entry[1];
          if (observer || reflect || renderer) {
            if (renderer && !render$3) {
              console.warn('Renderer undefined');
            }
            this.defineProperty(entry[0], entry[1]);
          }
        }
      }
    }
    defineProperty(property = null, { strict = false, observer, reflect = false, renderer, value }) {
      Object.defineProperty(this, property, {
        set(value) {
          if (value === this[`___${property}`]) return;
          this[`___${property}`] = value;
          if (reflect) {
            if (value) this.setAttributte(property, String(value));else this.removeAttribute(property);
          }
          if (observer) {
            if (observer in this) this[observer]();else console.warn(`observer::${observer} undefined`);
          }
          if (renderer) {
            if (renderer in this) render$3(this[renderer](), this.shadowRoot);else console.warn(`renderer::${renderer} undefined`);
          }
        },
        get() {
          return this[`___${property}`];
        },
        configurable: strict ? false : true
      });
      const attr = this.getAttribute(property);
      this[property] = attr || this.hasAttribute(property) || value;
    }
  };
};

class CustomAppLayout extends litMixin$2(propertyMixin$2(HTMLElement)) {
  constructor(options = { properties: {} }) {
    const properties = {
      firstRender: { value: true, renderer: 'render' },
      headerMarginTop: { value: '', renderer: 'render' },
      headerPaddingTop: { value: '', renderer: 'render' }
    };
    Object.assign(options.properties, properties);
    super(options);
  }
  slotted(slot) {
    slot = slot.assignedNodes();
    if (slot[0].localName === 'slot') {
      return this.slotted(slot[0]);
    } else {
      for (const node of slot) {
        if (node.nodeType === 1) {
          return node;
        }
      }
    }
    return slot;
  }
  get content() {
    return this.slotted(this.shadowRoot.querySelector('slot[name="content"]'));
  }
  get header() {
    return this.slotted(this.shadowRoot.querySelector('slot[name="header"]'));
  }
  get container() {
    return this.shadowRoot.querySelector('.content-container');
  }
  render() {
    if (this.firstRender === false) {
      const header = this.header;
      const headerHeight = header.offsetHeight;
      if (header.hasAttribute('fixed') && !header.hasAttribute('condenses')) {
        requestAnimationFrame(() => {
          this.headerMarginTop = headerHeight + 'px';
          this.headerPaddingTop = '';
        });
      } else {
        requestAnimationFrame(() => {
          this.headerPaddingTop = headerHeight + 'px';
          this.headerMarginTop = '';
        });
      }
    } else {
      this.firstRender = false;
    }
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
        ::slotted([slot="header"]) {
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
      <span class="content-container" style="margin-top: ${this.headerMarginTop}; padding-top: ${this.headerPaddingTop};">
        <slot name="content"></slot>
      </span>
    `;
  }
}
customElements.define('custom-app-layout', CustomAppLayout);

(() => {
  class CustomHeader extends litMixin$1(HTMLElement) {
    constructor() {
      super();
    }
    render() {
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
  }
  customElements.define('custom-header', CustomHeader);
})();

var CustomSelectMixin = (base => {
  return class CustomSelectMixin extends propertyMixin$2(base) {
    static get observedAttributes() {
      return ['selected'];
    }
    constructor(options = {}) {
      const properties = {
        selected: {
          value: 0,
          observer: '__selectedObserver__'
        }
      };
      if (options.properties) Object.assign(options.properties, properties);else options.properties = properties;
      super(options);
    }
    get root() {
      return this.shadowRoot || this;
    }
    get slotted() {
      return this.shadowRoot ? this.shadowRoot.querySelector('slot') : this;
    }
    get _assignedNodes() {
      return 'assignedNodes' in this.slotted ? this.slotted.assignedNodes() : this.children;
    }
    get attrForSelected() {
      return this.getAttribute('attr-for-selected') || 'name';
    }
    set attrForSelected(value) {
      this.setAttribute('attr-for-selected', value);
    }
    connectedCallback() {
      super.connectedCallback();
      this.slotchange = this.slotchange.bind(this);
      this.slotted.addEventListener('slotchange', this.slotchange);
    }
    slotchange() {
      if (this.selected) {
        this.__selectedObserver__({ value: this.selected });
      }
    }
    attributeChangedCallback(name, oldValue, newValue) {
      if (oldValue !== newValue) {
        if (!isNaN(newValue)) {
          newValue = Number(newValue);
        }
        this[name] = newValue;
      }
    }
    select(selected) {
      this.selected = selected;
    }
    next(string) {
      const index = this._assignedNodes.indexOf(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index && index + 1 <= this._assignedNodes.length - 1) {
        this.selected = this._assignedNodes[index + 1];
      }
    }
    previous() {
      const index = this._assignedNodes.indexOf(this.currentSelected);
      if (index !== -1 && index >= 0 && this._assignedNodes.length > index && index - 1 >= 0) {
        this.selected = this._assignedNodes[index - 1];
      }
    }
    _updateSelected(selected) {
      selected.classList.add('custom-selected');
      if (this.currentSelected && this.currentSelected !== selected) {
        this.currentSelected.classList.remove('custom-selected');
      }
      this.currentSelected = selected;
    }
    __selectedObserver__(value) {
      console.log(this.selected);
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
          const child = this._assignedNodes[this.selected];
          if (child && child.nodeType === 1) {
            this._updateSelected(child);
          } else if (this.currentSelected) {
            this.currentSelected.classList.remove('custom-selected');
          }
      }
    }
  };
});

class CustomPages extends litMixin$2(CustomSelectMixin(HTMLElement)) {
  constructor() {
    super();
  }
  isEvenNumber(number) {
    return Boolean(number % 2 === 0);
  }
  slotchange() {
    super.slotchange();
    let call = 0;
    for (const child of this.slotted.assignedNodes()) {
      if (child && child.nodeType === 1) {
        child.style.zIndex = 99 - call;
        if (this.isEvenNumber(call++)) {
          child.classList.add('animate-down');
        } else {
          child.classList.add('animate-up');
        }
      }
    }
  }
  render() {
    return html`
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
}
customElements.define('custom-pages', CustomPages);

customElements.define('home-view', class HomeView extends litMixin$1(HTMLElement) {
  constructor() {
    super();
  }
  render() {
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

var awskShell = customElements.define('awsk-shell', class AwskShell extends propertyMixin$1(litMixin$1(HTMLElement)) {
  get pages() {
    return this.shadowRoot.querySelector('custom-pages');
  }
  constructor() {
    const properties = {
      title: {
        value: 'awsk-app',
        renderer: 'render'
      }
    };
    super({ properties });
    this._clickHandler = this._clickHandler.bind(this);
    this.addEventListener('click', this._clickHandler);
  }
  render() {
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
            <span class="title">${this.title}</span>
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
  _clickHandler({ path }) {
    if (path[0] && path[0].localName === 'button' && path[0].dataset.route) {
      this.pages.selected = path[0].dataset.route;
    }
  }
});

return awskShell;

}());
//# sourceMappingURL=awsk-shell.js.map
