import RenderMixin from '../node_modules/custom-renderer-mixin/src/render-mixin.js';
import PropertyMixin from '../node_modules/backed/src/mixins/property-mixin.js';
import loadScript from '../node_modules/backed/src/utils/load-script.js';
import '../node_modules/custom-app-layout/src/custom-app-layout.js';
import '../node_modules/custom-header/src/custom-header.js';
import '../node_modules/custom-pages/src/custom-pages.js';

import './views/home-view.js';

export default customElements.define('awsk-shell',
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
      this.attachShadow({mode: 'open'})
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

        const path = `${esImportsSupported ? 'src/views' : 'dist/views'}`
        const type = esImportsSupported ? 'module' : null;
        loadScript(`${path}/${route}-view.js`, 'defer', type)
          .then(() => {
            this.loadedSet[route] = true;
            resolve()
          })
          .catch(e => reject(e));
      });
    }
    _clickHandler({path}) {
      if (path[0] && path[0].localName === 'button' && path[0].dataset.route) {
        this.loadView(path[0].dataset.route).then(() => {
          this.pages.selected = path[0].dataset.route;
        })

      }
    }
  }
);
