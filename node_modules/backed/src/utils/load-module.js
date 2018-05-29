import loadScript from './load-script.js';
/**
 * @mixin utils
 * @export loadModule
 *
 * defer handles loading after the document is parsed, async loads while parsing
 *
 * @param {string} src link/path to the module to load
 * @param {string} method default: 'async',  options: `defer, async, ''`
 * @return {promise}
 */
 export default (src, method = 'async') => {
   return loadScript(src, method, 'module');
 }
