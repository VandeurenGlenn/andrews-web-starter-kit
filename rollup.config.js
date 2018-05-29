export default [
	// iife , for older browsers
  {
    input: 'src/awsk-shell.js',
    output: {
      file: 'dist/awsk-shell.js',
      name: 'AwskShell',
      format: 'iife',
      sourcemap: false
    },
    experimentalCodeSplitting: false,
    experimentalDynamicImport: false
  }, {
    input: 'src/views/about-view.js',
    output: {
      file: 'dist/views/about-view.js',
      name: 'AboutView',
      format: 'iife',
      sourcemap: false
    },
    experimentalCodeSplitting: false,
    experimentalDynamicImport: false
  }
]
