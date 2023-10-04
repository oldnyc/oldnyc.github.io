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
- [x] Replace `scrollGuard` with `overscroll-behavior: none;`
- [ ] Replace direct Firebase access with a lambda function
- [ ] Run prettier
- [ ] Remove my maps API key from the repo
- [ ] Set up webpack dev server
- [ ] The "view original" links to the NYPL site are broken
- [ ] Replace calls to String.prototype.substr
- [ ] Make the static maps work again

Topological sort:

- [x] photo-info.js
- [x] social.js
- [x] map-styles.js
- [x] feedback.js
- [x] ocr-tool.js
- [x] history.js
- [x] viewer.js
- [x] search.js
- [x] url-state.js
- [x] app-history.js
- [x] entry.js
