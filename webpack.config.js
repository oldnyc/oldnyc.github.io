const HtmlWebpackPlugin = require('html-webpack-plugin');

/*eslint-env node */
module.exports = {
  mode: 'development',
  entry: {
    main: './src/main.tsx',
    // ocr: './js/ocr-tool.ts'
  },
  // devtool: '#cheap-module-source-map',
  output: {
    clean: true,
    path: __dirname + '/dist/js',
    filename: '[name].[contenthash].js'
  },
  resolve: {
    // Add `.ts` and `.tsx` as a resolvable extension.
    extensions: [".ts", ".tsx", ".js"],
    // Add support for TypeScripts fully qualified ESM imports.
    extensionAlias: {
     ".js": [".js", ".ts"],
     ".cjs": [".cjs", ".cts"],
     ".mjs": [".mjs", ".mts"]
    }
  },
  module: {
    rules: [
      // all files with a `.ts`, `.cts`, `.mts` or `.tsx` extension will be handled by `ts-loader`
      {
        test: /\.([cm]?ts|tsx)$/,
        loader: "ts-loader",
        options: {
          transpileOnly: true
        }
      }
    ]
  },
  externals: {
    // require("jquery") is external and available
    //  on the global var jQuery
    "jquery": "jQuery"
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: __dirname + '/src/index.template.html',
      filename: __dirname + '/dist/index.html',
      inject: 'body',
      scriptLoading: 'blocking',
      chunks: ["main"]
    })
  ]
};
