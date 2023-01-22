import { s, y } from './lit-element-306a77b2.js';

var about = customElements.define('about-view', class AboutView extends s {
  constructor() {
    super();
    this.attachShadow({mode: 'open'});
  }
  render() {
    return y`
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
});

export { about as default };
