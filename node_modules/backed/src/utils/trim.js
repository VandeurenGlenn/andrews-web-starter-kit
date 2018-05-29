import { WHITE_SPACES } from './constants.js';
import ltrim from './ltrim.js';
import rtrim from './rtrim.js';
/**
 * Remove white-spaces from beginning and end of string.
 */
export default (string, chars) => {
  chars = chars || WHITE_SPACES;
  return ltrim(rtrim(string, chars), chars);
}
