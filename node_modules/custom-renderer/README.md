# custom-renderer

## usage
```html
<script src="node_modules/custom-html-tag/html.js"></script>
<script src="node_modules/custom-renderer/render.js"></script>
<script>
  const span = document.createElement('span');
  const template = html`<p>${'variable'}</p>`;
  render(span, template, {variable: 'hello'}); // <p>hello</p>
  render(span, template, {variable: 'hello world'}); // <p>hello world</p>
</script>

```
