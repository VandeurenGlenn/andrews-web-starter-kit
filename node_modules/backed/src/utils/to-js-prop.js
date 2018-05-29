/**
 * @mixin Backed
 * @module utils
 * @export toJsProp
 *
 * some-prop -> someProp
 *
 * @param {string} string The content to convert
 * @return {string} string
 */
export default string => {
  let parts = string.split('-');
  if (parts.length > 1) {
    var upper = parts[1].charAt(0).toUpperCase();
    string = parts[0] + upper + parts[1].slice(1).toLowerCase();
  }
  return string;
};
