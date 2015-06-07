# oldnyc.github.io

Static site for oldnyc.org.

The data files are generated using the [oldnyc repo][1].

To use the site, just start an http server in this directory. For example:

    git clone https://github.com/oldnyc/oldnyc.github.io.git
    cd oldnyc.github.io
    npm install http-server
    http-server

Then open http://localhost:8080/.


## Development

Modifications to the HTML and CSS files should show up immediately.

The JavaScript files are bundled for serving, so changes to individual files
won't show up on the site until you rebuild the bundle. To do this, run:

    ./update-js-bundle.sh

after saving your changes, or set up a process to watch the JS files and run
this whenever they change. For example, on Mac OS X:

    brew install fswatch
    fswatch -o $(ls js/*.js | grep -v bundle) | xargs -n1 -I{} ./update-js-bundle.sh

Don't modify the data files (`lat-lon-counts.js`, `by-location`,
`id4-to-location`) directly. Changes to these files should come from the
[oldnyc repo][1].


[1]: https://www.github.com/danvk/oldnyc
