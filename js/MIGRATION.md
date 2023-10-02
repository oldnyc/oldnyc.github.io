# Notes on modernization / migration

Steps / to-do:

- [x] Sever circular dependency
- [x] Remove underscore dependency
- [ ] Try `@ts-check`
- [ ] Add ts-loader to webpack setup
- [ ] Plugin in `@types/jquery`, etc.
- [ ] Port History to use an ES6 class

Non-TypeScript modernization:

- [ ] Un-vendor dependencies
- [ ] Update webpack, eslint, etc. versions
- [ ] Switch from `$.Deferred` to native promises
- [ ] Port to React / ReactRouter
- [ ] Replace ZeroClipboard with a native solution
- [ ] Replace `scrollGuard` with `overscroll-behavior: none;`
- [ ] Replace direct Firebase access with a lambda function
- [ ] Run prettier
