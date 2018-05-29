### examples
#### PropertyMixin
```js
import { define, merge } from '../node_modules/backed/src/utils.js';
import PropertyMixin from '../node_modules/backed/src/mixins/property-mixin.js';

class define(MyElement) extends PropertyMixin(HTMLElement) {
  static get properties() {
    return merge(super.properties, {
      name: {
        value: 'jon',
        reflect: true, // updates attribute & listens for changes
        observer: 'nameObserver'
      }
    });
  }
  
  constructor() {
    super();
  }
  
  nameObserver() {
    this.render(); // render each time name changes
  }
}
// or render the name template only wip
class define(MyElement) extends PropertyMixin(HTMLElement) {
  static get properties() {
    return merge(super.properties, {
      name: {
        value: 'archer',
        reflect: true, // updates attribute & listens for changes
        observer: 'nameObserver'
      }, 
      announce: {
        value: 'greatest spy off the world',
        renderer: 'announceTemplate'
      }
    });
  }
  
  constructor() {
    super();
  }
  
  get announceTemplate() {
    return html`${'announce'}`;
  }
}
```

### combining with custom-renderer-mixin
Install custom-renderer-mixin
```sh
yarn add custom-renderer-mixin
```
```js
import { define, merge } from '../node_modules/backed/src/utils.js';
import PropertyMixin from '../node_modules/backed/src/mixins/property-mixin.js';
import RenderMixin from '../node_modules/custom-renderer-mixin/src/render-mixin.js';

class define(MyElement) extends RenderMixin(PropertyMixin(HTMLElement)) {
  static get properties() {
    return merge(super.properties, {
      name: {
        value: 'jon',
        reflect: true, // updates attribute & listens for changes
        observer: 'nameObserver'
      }
    });
  }
  
  constructor() {
    super();
  }
  
  nameObserver() {
    this.render(); // render each time name changes
  }
}

```
#### OLD
### Using observers

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        observer: 'change'
      }
    }
  }
  ready() {
    // ready to go ...
  }
  change(change) {
    console.log(change);
  }
});
```

### Using reflect

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        reflect: true
      }
    }
  }
  ready() {
    // ready to go ...
  }
});
```

### Using render

```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        render: true,
        value: 'name should go here'
      },      
      lastname: {
        render: true
        value: 'lastname should go here'
      }
    }
  }
  render() {
    html`
      <style></style>
      <h1>${this.name}</h1>
      <h2>${this.lastname}</h2>
    `
  }
});
```
#### or

warning: watch out when using multiple renderers, when doing this the element will have the templateResult of the last render
```js
Backed(class extends HTMLElement {
  static get properties() {
    return {
      name: {
        render: 'renderName'
      }
    }
  }
  renderName() {
    html`
      <style></style>
      <h1>${this.name}</h1>
    `
  }
});
```
