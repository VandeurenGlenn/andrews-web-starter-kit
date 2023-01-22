import { LitElement, html } from 'lit'
import './../node_modules/custom-pages/src/custom-pages.js';

import './views/home.js';
import { version } from './../package.json'

export default customElements.define('awsk-shell',
  class AwskShell extends LitElement {

    static properties = {
      title: {
        type: 'string'
      },
      version: {
        type: 'string'
      }
    }

    get pages() {
      return this.shadowRoot.querySelector('custom-pages');
    }

    constructor() {
      super();
      this.attachShadow({mode: 'open'})
    }

    connectedCallback() {
      super.connectedCallback()
      this.version = version
    }

    render() {
      return html`
        <style>
          :host {
            display: flex;
            flex-direction: column;
            width: 100%;
            height: 100%;
          }
          h1, h2, h3, h4 {
            margin: 0;
          }
          header {
            display: flex;
            width: 100%;
            align-items: center;
            padding: 5px 10px;
            box-sizing: border-box;
            color: #fff;
            background: #512da8;
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

          .version {
            position: absolute;
            left: 12px;
            bottom: 12px;
          }
          @media (min-width: 780px) {
            .content {
              padding: 45px 0;
            }
          }
        </style>
        <span class="version">${this.version}</span>
        <header slot="header" fixed>
          <span class="title">${this.title}</span>
          <span class="flex"></span>
          <button data-route="home" @click=${this.#routeHandler}>home</button>
          <button data-route="about" @click=${this.#routeHandler}>about</button>
        </header>
        <span class="content" slot="content">
          <custom-pages selected="home" attr-for-selected="data-route">
            <home-view data-route="home"></home-view>
            <about-view data-route="about"></about-view>
          </custom-pages>
        </span>
      `;
    }

    async loadView(route) {
      if (!customElements.get(`${route}-view`)) await import(`./${route}.js`)
    }

    async #routeHandler(event) {
      const path = event.composedPath()
      const target = path[0]
      if (target.dataset.route) {
        await this.loadView(target.dataset.route)
        this.pages.select(target.dataset.route)
      }
    }
  }
);
