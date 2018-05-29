# custom-renderer-mixin

## usage
```html
<script src="node_modules/custom-renderer-mixin/render-mixin.js"></script>
<script>
  customElements.define('cu-el', class CuEl extends RenderMixin(HTMLElement) {
    get properties() {
      return this._properties || {
        property: 'hello' // initial property value for first render
      }
    }
    constructor() {
      super();
    }
    
    connectedCallback() {
      super.connectedCallback();
      // render after first render...
      this.render({property: 'hello hello hello'});
    }
    get data() {
      return [{text: '0'}, {text: '1'}, {text: '2'}, {text: '3'}, {text: '4'}]
    }
    get template() {
      return html`
      <p>${'property'}</p>
      ${this.data.map(i => `<p>${i.text}</p>`)}
      `;
    }
  });
  
  document.querySelector('cu-el').render({property: 'hello hello hello'})
</script>
```

## Features

one way property binding
```js
const property = 'hello';
html`<p>${'property'}</p>`// -> 'hello'
```

mapping arrays objects etc..
```js
const data = [0, 1, 2, 3, 4];
html`${data.map(i => `<p>${i}</p>`)}` // -> <p>0</p><p>1</p><p>2</p><p>3</p>...
```
