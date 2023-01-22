import resolve from '@rollup/plugin-node-resolve'
import json from '@rollup/plugin-json'

export default [
  {
    input: ['src/shell.js', 'src/views/about.js'],
    output: {
      dir: 'www',
      format: 'es',
    },
    plugins: [
      json(),
      resolve()
    ]
  }
]
