const iife = (input, file, name) => {
  return {
		input,
		output: {
			file,
      name,
			format: 'iife',
			sourcemap: false
		}
	}
}
export default [
	// iife , for older browsers
	iife('src/mixins/property-mixin.js', 'mixins/property-mixin.js', 'PropertyMixin'),
  iife('src/mixins/css-mixin.js', 'mixins/css-mixin.js', 'CSSMixin'),
  iife('src/backed.js', 'backed.js', 'Backed'),
]
