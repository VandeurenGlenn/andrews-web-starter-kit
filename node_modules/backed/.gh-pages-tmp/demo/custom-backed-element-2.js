'use strict';
import Backed from './../src/backed.js';
import {RenderStatus} from '../src/utils.js'
const now = performance.now()
export default (() => {
  return Backed(class CustomBackedElementTwo extends HTMLElement {
    static get properties() {
      return {
        /**
         * subsribes an observer for changes
         */
        name: {
          reflect: true,
          observer: 'globalChange',// receives values by subbing to global.name (checkout pubsub to learn more)
          global: true, // publishes values to global.name
          render: 'renderName'
        },
        status: {
          render: 'renderStatus',
          value: 'ready'
        }
      };
    }

    constructor() {
      super()

    }

    connected(){
      console.log(performance.now() - now);
    }

    ready() {
      window.RenderStatus.afterRender(this, () => {
        console.log('after');
      })
      console.log(performance.now() - now);
      console.log(`${this.localName} ready!`);
    }

    renderName() {
      return html`
        ${this.name}
      `;
    }

    renderStatus() {
      return html`
        ${this.status}
      `;
    }

    globalChange(change) {
      this.name = change.value;
      console.log(`globalChange:
        property: ${change.property}
        value: ${change.value}
        instance: ${change.instance}`
      );
    }
  });
})()
