/**
 * @mixin backed
 * @module utils
 * @export fireEvent
 *
 * @param {string} type Name of the event
 * @param {HTMLElement} target context
 * @param {string|boolean|number|object|array} detail
 */
export default (type='', detail=null, target=HTMLElement) => {
  target.dispatchEvent(new CustomEvent(type, {detail: detail}));
};
