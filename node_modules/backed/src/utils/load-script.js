/**
 * @mixin Backed
 * @module utils
 * @export loadScript
 *
 * defer handles loading after the document is parsed, async loads while parsing
 *
 * @param {string} src link/path to the script to load
 * @param {string} method default: 'async',  options: `defer, async, ''`
 * @param {string} type default: undefined,  options: `module, utf-8, ...`
 * @return {object} merge result
 */
 export default (src, method = 'async', type) => {
   return new Promise((resolve, reject) => {
     let script = document.createElement('script');
     script.setAttribute(method, '');
     if (type) script.setAttribute('type', type);
     script.onload = result => {
       resolve(result);
     }
     script.onerror = error => {
       reject(error);
     }
     script.src = src;
     document.body.appendChild(script);
   });
 }
