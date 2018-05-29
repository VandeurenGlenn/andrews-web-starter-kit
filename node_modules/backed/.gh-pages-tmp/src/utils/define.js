import hyphenate from './hyphenate.js';
import shouldRegister from './should-register.js';

export default klass => {
  const name = hyphenate(klass.name);
  return shouldRegister(name) ? customElements.define(name, klass) : '';
}
