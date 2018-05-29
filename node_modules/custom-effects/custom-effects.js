var customEffects = (function () {
'use strict';

var customEffects = (base => class CustomEffects extends base {
  constructor() {
    super();
    const effects = customElements.get(this.localName).effects;
    if (effects) {
      for (const effect of effects) {
        this._initEffect(effect);
      }
    }
  }
  _initEffect(effect) {
    if (typeof effect === 'string') {
      effect = [effect, effect === 'resize' || effect === 'scroll' ? window : this];
    }
    return new Promise((resolve, reject) => {
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
});

return customEffects;

}());
//# sourceMappingURL=custom-effects.js.map
