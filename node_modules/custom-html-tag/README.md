# custom-html-tag

## usage
```html
<script src="node_modules/custom-html-tag/html.js"></script>
<script src="node_modules/custom-renderer/render.js"></script>
<script>
  const span = document.createElement('span');
  const template = html`<p>${'variable'}</p>`;
  render(span, template, {variable: 'hello'}); // <p>hello</p>
  render(span, template, {variable: 'hello world'}); // <p>hello world</p>
  
  // or
  // without custom-renderer
  const templateResult = template({variable: 'hello'});
  templateResult.changes.forEach(change => {
    change.from.value // previous value
    change.from.position // previous position
    change.to.value // new value
    change.to.position // new position
    // check https://github.com/vandeurenglenn/custom-renderer for an working example.
  });
</script>
```
