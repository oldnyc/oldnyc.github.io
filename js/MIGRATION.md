# Notes on modernization / migration

Steps / to-do:

- [x] Sever circular dependency
- [x] Remove underscore dependency
- [x] Try `@ts-check`
- [x] Plugin in `@types/jquery`, etc.
- [x] Port History to use an ES6 class
- [ ] Add ts-loader to webpack setup

Non-TypeScript modernization:

- [ ] Un-vendor dependencies
- [ ] Update webpack, eslint, etc. versions
  - [x] webpack
  - [ ] eslint
- [ ] Switch from `$.Deferred` to native promises
- [ ] Port to React / ReactRouter
- [ ] Replace ZeroClipboard with a native solution
- [ ] Replace `scrollGuard` with `overscroll-behavior: none;`
- [ ] Replace direct Firebase access with a lambda function
- [ ] Run prettier
- [ ] Remove my maps API key from the repo
- [ ] Set up webpack dev server

Topological sort:

- [x] photo-info.js
- [x] social.js
- [x] map-styles.js
- [x] feedback.js
- [ ] ocr-tool.js
- [ ] history.js
- [ ] viewer.js
- [ ] search.js
- [ ] url-state.js
- [ ] app-history.js
- [ ] entry.js
