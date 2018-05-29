'use strict';

import loadScript from './utils/load-script.js';
import fireEvent from './utils/fire-event.js';
import toJsProp from './utils/to-js-prop.js';
import RenderStatus from './utils/render-status.js';
import PubSub from './internals/pub-sub.js';

window.registeredElements = window.registeredElements || [];

const shouldShim = () => {
  return /Edge/.test(navigator.userAgent) || /Firefox/.test(navigator.userAgent);
}

const isValidRenderer = renderer => {
  if (!renderer) {
    return;
  }
  return String(renderer).includes('return html`')
}

const handleProperties = (target, properties) => {
  if (properties) {
    for (let entry of Object.entries(properties)) {
      handleProperty(target, entry[0], entry[1]);
      // TODO: are we ignoring stuff ...?
      // check if attribute has value else pass default property value
      target[entry[0]] = target.hasAttribute(entry[0]) ? target.getAttribute(entry[0]) : entry[1].value;
    }
  }
}

const handleProperty = (obj, property, {observer, strict, global, reflect, renderer, value }) => {

  if (Boolean(observer || global) && _needsObserverSetup(obj, property)) {
    // Ensure we don't do duplicate work
    obj.observedProperties.push(property);

    // subscribe only when a callback is defined, all other global options are still available ...
    if (global && obj[observer]) {
      // Warning, global observers don't work the same like bindings, each observer has it's namespace created like global.name,
      // so whenever another element has an global observer for name, they will subscribe to the same publisher !
      // TODO: Add local binding & improve global observers
      // {{name}} for normal bindings & {{global::name}} for global bindings(observers) (like Polymer does)
      // this means we need to build a system that keeps track of each component it's bindings &
      // values should be set as property, so we know if a value needs to be set on attribute, rerender template, etc ..
      PubSub.subscribe(`global.${property}`, obj[observer].bind(obj));
    }
    setupObserver(obj, property, observer, {strict, global, reflect, renderer: renderer})
  } else if (!Boolean(observer || global) && Boolean(reflect || renderer)) {
    setupObserver(obj, property, observer, {strict, global, reflect, renderer: renderer})
  }
}

const _needsObserverSetup = (obj, property) => {
  if (!obj.observedProperties) {
    obj.observedProperties = [];
  }
  if (obj.observedProperties[property]) {
    console.warn(
      'observer::ignoring duplicate property observer ' + property
    );
    return false;
  } else {
    return true;
  }
}

const forObservers = (target, observers, isGlobal=false) => {
  for (let observe of observers) {
    let parts = observe.split(/\(|\)/g);
    let fn = parts[0];
    parts = parts.slice(1);
    for (let property of parts) {
      if (property.length) {
        handleProperty(target, property, fn, {
          strict: false,
          global: isGlobal
        });
      }
    }
  }
}

/**
 * Runs a method on target whenever given property changes
 *
 * example:
 * change(change) {
 *  change.property // name of the property
 *  change.value // value of the property
 * }
 *
 * @arg {object} obj target
 * @arg {string} property name
 * @arg {boolean} strict
 * @arg {method} fn The method to run on change
 */
const setupObserver = (obj, property, fn, {strict, global, reflect, renderer}) => {
  if (renderer && !obj.shadowRoot) {
    obj.attachShadow({mode: 'open'})
  }
  Object.defineProperty(obj, property, {
    set(value) {
      if (value === undefined) {
        return
      }
      if (this[`_${property}`] === value) {
        return;
      }
      this[`_${property}`] = value;
      let data = {
        property: property,
        value: value
      };
      if (reflect) {
        if (value) this.setAttribute(property, String(value));
        else this.removeAttribute(property);
      }
      if (renderer) {
          // adds support for multiple renderers
          const object = {}
          object[property] = value;
          this.render(object, this[renderer]);
      }
      if (global) {
        data.instance = this;
        PubSub.publish(`global.${property}`, data);
      } else if(fn) {
        if (this[fn]) {
          this[fn](data);
        } else {
          console.warn(`observer undefined::${fn} is not a function`);
        }
      }
    },
    get() {
      return this[`_${property}`];
    },
    configurable: strict ? false : true
  });
}


const handleObservers = (target, observers=[], globalObservers=[]) => {
  if (!observers && !globalObservers) {
    return;
  }
  forObservers(target, observers);
}

const handleListeners = target => {
  const attributes = target.attributes;
  for (const attribute of attributes) {
    if (String(attribute.name).includes('on-')) {
      const fn = attribute.value;
      const name = attribute.name.replace('on-', '');
      target.addEventListener(String(name), event => {
        target = event.path[0];
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

const ready = target => {
  requestAnimationFrame(() => {
    if (target.ready) target.ready();
  });
}

const constructorCallback = (target=HTMLElement, klass=Function, hasWindow=false) => {

  target.fireEvent = target.fireEvent || fireEvent.bind(target);
  target.toJsProp = target.toJsProp || toJsProp.bind(target);
  target.loadScript = target.loadScript || loadScript.bind(target);


  // setup properties

  if (!target.registered && target.created) target.created();

  // let backed know the element is registered
  target.registered = true;
}

const connectedCallback = (target=HTMLElement, klass=Function) => {
  if (target.connected) target.connected();
  handleProperties(target, klass.properties);
  handleObservers(target, klass.observers, klass.globalObservers);
  // setup listeners
  handleListeners(target)
  // notify everything is ready
  ready(target);
}

const shouldRegister = (name, klass) => {
  if (window.registeredElements.indexOf(name) === -1) {
    window.registeredElements.push(name);
    return true;
  }
  return false;
}

export default {
  ready: ready,
  connectedCallback: connectedCallback,
  constructorCallback: constructorCallback,
  shouldRegister: shouldRegister
}
