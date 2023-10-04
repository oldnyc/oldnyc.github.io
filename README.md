# oldnyc.github.io

Static site for oldnyc.org.

The data files are generated using the [oldnyc repo][1].

To use the site, just start an http server in this directory. For example:

    git clone https://github.com/oldnyc/oldnyc.github.io.git
    cd oldnyc.github.io
    npx http-server

Then open http://localhost:8080/.

## Development

Modifications to the HTML and CSS files should show up immediately.

The JavaScript files are bundled for serving, so changes to individual files
won't show up on the site until you rebuild the bundle. To do this, run:

    yarn
    yarn webpack

after saving your changes, or set up a watch process:

    yarn webpack --watch

Don't modify the data files (`lat-lon-counts.js`, `by-location`,
`id4-to-location`) directly. Changes to these files should come from the
[oldnyc repo][1].

To run lint checks and type check:

    yarn lint
    yarn tsc --noEmit

To publish an update, run:

    yarn webpack --mode production

Then commit and push.

[1]: https://www.github.com/danvk/oldnyc
