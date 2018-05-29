// import uglify from 'rollup-plugin-uglify';

export default [
	// iife , for older browsers
	{
		input: 'src/render.js',
		output: {
			file: 'render.js',
      name: 'render',
			format: 'iife',
			sourcemap: false
		},
		experimentalCodeSplitting: false,
		experimentalDynamicImport: false,
    // plugins: [
    //   uglify
    // ]
	}
]
