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

To iterate on the JavaScript files, either run

    ./update-js-bundle.sh

after saving your changes, or open up `index.html` and modify the comments to
source the unbundled scripts directly.

Don't modify the data files (`lat-lon-counts.js`, `by-location`,
`id4-to-location`) directly. Changes to these files should come from the
[oldnyc repo][1].


[1]: https://www.github.com/danvk/oldnyc
