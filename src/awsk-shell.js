const loadedSet = {};
let previousRoute;
(function () {
  const el = document.querySelector('.awsk-shell')
  const loadScript = function(src) {
    return new Promise(function(resolve, reject) {
      const script = document.createElement('script')
      script.onload = function() { resolve() };
      script.onerror = function(e) { reject(e) };
      script.src = src;
      document.head.appendChild(script);
    });
  }
  const loadView = function(route) {
    return new Promise((resolve, reject) => {
      if (loadedSet[route]) return resolve();

      loadScript(`src/views/${route}-view.js`)
        .then(function() {
          loadedSet[route] = true;
          resolve()
        })
        .catch(e => reject(e));
    });
  }

  loadView('home').then(function() {
    el.querySelector('.home-view').classList.add('selected');
    previousRoute = 'home';
    el.addEventListener('click', function({path}) {
      if (path[0] && path[0].localName === 'button' && path[0].dataset.route &&
          path[0].dataset.route !== previousRoute) {
        loadView(path[0].dataset.route).then(() => {
          el.querySelector(`span[data-route = ${path[0].dataset.route}]`).classList.add('selected');
          if (previousRoute) el.querySelector(`span[data-route = ${previousRoute}]`).classList.remove('selected');
          previousRoute = path[0].dataset.route;
        })

      }
    });
  })

  el.innerHTML = `
    <style>
      .awsk-shell {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: block;
        width: 100%;
        height: 100%;
      }
      h1, h2, h3, h4 {
        margin: 0;
      }
      header {
        display: flex;
        align-items: center;
        padding: 5px 10px;
        box-sizing: border-box;
        color: #ddd;
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
      .home-view, .about-view {
        position: absolute;
        top: 50px;
        bottom: 50px;
        display: block;
        width: 100%;
        height: calc(100% - 100px);
        max-width: 700px;
        box-shadow: 0 4px 5px 0 rgba(0, 0, 0, 0.14),
                    0 1px 10px 0 rgba(0, 0, 0, 0.12),
                    0 2px 4px -1px rgba(0, 0, 0, 0.4);
        opacity: 0;
      }
      .selected {
        opacity: 1;
      }

      @media (min-width: 780px) {
        .content {
          padding: 45px 0;
        }
      }
    </style>
      <header slot="header" fixed>
        <span class="title">${'title'}</span>
        <span class="flex"></span>
        <button data-route="home">home</button>
        <button data-route="about">about</button>
      </header>
      <span class="content" slot="content">
        <span class="home-view" data-route="home"></span>
        <span class="about-view" data-route="about"></span>
      </span>
  `;
})();
