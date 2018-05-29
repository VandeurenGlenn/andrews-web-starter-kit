import unCamelCase from './un-camel-case.js';
import slugify from './slugify.js';
/**
* Replaces spaces with hyphens, split camelCase text, remove non-word chars, remove accents and convert to lower case.
*/
export default string => {
  string = unCamelCase(string);
  return slugify(string, "-");
}
