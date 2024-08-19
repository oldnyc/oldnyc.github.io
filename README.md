# oldnyc.github.io

Static site for oldnyc.org.

The data files are generated using the [oldnyc repo][1].

To use the site, just start an http server in this directory. For example:

    git clone https://github.com/oldnyc/oldnyc.github.io.git
    cd oldnyc.github.io
    npx http-server

Then open http://localhost:8080/.

## Development

Install dependencies:

    yarn

To develop the site:

    yarn serve

Don't modify the data files (`lat-lon-counts.js`, `by-location`,
`id4-to-location`) directly. Changes to these files should come from the
[oldnyc repo][1].

To run lint checks and type check:

    yarn lint
    yarn tsc --noEmit

To publish an update, run:

    yarn build

Then commit and push.

[1]: https://www.github.com/danvk/oldnyc
