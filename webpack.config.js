/*eslint-env node */
module.exports = {
  entry: {
    main: './js/entry.js',
    ocr: './js/ocr-tool.js'
  },
  output: {
    path: __dirname + '/js/bundle',
    filename: '[name].js'
  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        loader: 'babel',
        query: {
          presets: ['es2015']
        }
      }
    ]
  }
};