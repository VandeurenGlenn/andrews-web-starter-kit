# Andrew's Web Starter Kit :metal:
> Minimal starter-kit for web development

## Preword
If you like an example how things were done before we had classes, customElements etc then checkout the [vanilla][vanilla-branch] branch.

## Features
- Dynamic Imports
- Bundling with rollup
- [CustomRendererMixin][custom-renderer-mixin]
- [PropertyMixin][property-mixin]
- [CSSMixin][css-mixin]
- Bundled finishes loading around ```70``` ms
- Modulair finishes loading around ```153``` ms

## Prerequisites
1. [Node.js][node-url] - used to run JavaScript tools from the command line.
2. [Yarn][yarn-url] - Fast, reliable, and secure dependency management.(or npm)


## Quick-start
1. Download [zip][zip-url] & extract
2. Go to extracted directory
3. Open terminal & type ```yarn && yarn serve``` or ```npm run serve```
4. Set origin to your repo ```git remote remove origin && git remote add origin https://your-repo``` (not needed when forked)
5. Push to your repo

## Workflow
1. Open terminal
2. Start reload server (watcher) ```yarn serve``` or ``` npm i && npm run serve ```
3. Make changes
4. Build ```yarn build``` or ```npm run build```

![hero-url]

## License

Copyright (c) 2019 VandeurenGlenn <vandeurenglenn@gmail.com>
All rights reserved.

[node-url]: https://nodejs.org
[yarn-url]: https://yarnpkg.com
[backed-cli-url]: https://github.com/VandeurenGlenn/backed-cli
[zip-url]: https://github.com/VandeurenGlenn/andrews-web-starter-kit/archive/master.zip
[hero-url]: hero.png
[custom-renderer-mixin]: https://github.com/VandeurenGlenn/custom-renderer-mixin
[property-mixin]: https://github.com/VandeurenGlenn/backed/src/mixins/property-mixin
[css-mixin]: https://github.com/VandeurenGlenn/backed/src/mixins/css-mixin
[vanilla-branch]: https://github.com/VandeurenGlenn/andrews-web-starter-kit/tree/vanilla
