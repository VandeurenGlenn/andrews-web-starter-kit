'use strict';
import { loadScript } from './utils.js';

const bowerMinUrl = (name, main, root) => {
  const url = main ? `${name}/${main}` : `${name}/${name}`;
  return `${root}/${url}.min.js`;
}

const ensureArray = array => {
  if (Array.isArray(array)) {
    return array;
  }
  return [...array];
}

/**
 * @module polyLoader
 * @param {string} name package name (folder)
 * @param {string} main script to use
 * @param {string} root location of your components
 */
export default (fills, root='bower_components') => {
  return new Promise((resolve, reject) => {
    fills = ensureArray(fills);
    fills = fills.map(fill => {
      let name;
      let main = null;
      if (typeof(fill) === 'object') {
        name = fill.name;
        main = fill.main;
      } else {
        name = fill;
      }
      if (name === 'shadycss' && !main) {
        main = 'custom-style-interface';
      }
      return loadScript(bowerMinUrl(name, main, root));
    });
    Promise.all(fills).then(() => resolve()).catch(error => reject(error));
  });
}
