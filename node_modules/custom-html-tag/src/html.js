// TODO: check for change & render change only
const set = [];

/**
 *
 * @example
 ```js
  const template = html`<h1>${'name'}</h1>`;
  let templateResult = template({name: 'Olivia'})
  element.innerHTML = templateResult.template;
  templateResult = template({name: 'Jon'})
  element.innerHTML = templateResult.template;

  // you can also update the changes only
  templateResult.changes.forEach(change => {
    change.from.value // previous value
    change.from.position // previous position
    change.to.value // new value
    change.to.position // new position
    // check https://github.com/vandeurenglenn/custom-renderer for an example how to implement.
  });

 ```
 */
const html = (strings, ...keys) => {
  return ((...values) => {
    const dict = values[values.length - 1] || {};
    let template = strings[0];
    let setChanged = false;
    const changes = [];
    if (values[0] !== undefined) {
      keys.forEach((key, i) => {
        let value = Number.isInteger(key) ? values[key] : dict[key];
        if (value === undefined && Array.isArray(key)) {
          value = key.join('');
        } else if (value === undefined && !Array.isArray(key) && set[i]) {
          value = set[i].value; // set previous value, doesn't require developer to pass all properties
        } else if (value === undefined && !Array.isArray(key) && !set[i]) {
          value = '';
        }
        const string = strings[i + 1];
        const stringLength = string.length;
        const start = template.length;
        const end = template.length + value.length;
        const position = [start, end];

        if (set[i] && set[i].value !== value) {
          setChanged = true;
          changes.push({
            from: {
              value: set[i].value,
              position: set[i].position,
            },
            to: {
              value,
              position
            }
          });
          set[i].value = value;
          set[i].position = [start, end];
        } else if (!set[i]) {
          set.push({value, position: [start, end]});
          changes.push({
            from: {
              value: null,
              position
            },
            to: {
              value,
              position
            }
          });
        }
        template += `${value}${string}`;
      });
    } else {
      template += strings[0];
    }
    return {
      template,
      changes
    };
  });
}

export default html;
