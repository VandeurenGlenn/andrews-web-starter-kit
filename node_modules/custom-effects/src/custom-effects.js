export default base => class CustomEffects extends base {
  get effects() {
    return customElements.get(this.localName).effects;
  }
  constructor() {
    super();
  }

  connectedCallback() {
    if (super.connectedCallback) super.connectedCallback();
    if (this.effects) {
      for (const effect of this.effects) {
        this._initEffect(effect);
      }
    }
  }

  _initEffect(effect) {
    if (typeof effect === 'string') {
      effect = [effect, effect === 'resize' || effect === 'scroll' ? window : this];
    };
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
}
