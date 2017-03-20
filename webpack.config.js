module.exports = {
    entry: "./src/index.js",
    target: 'node',
    output: {
        path: __dirname + "/dist",
        filename: "index.js",
        libraryTarget: 'commonjs2'
    },
    module: {
        loaders: [
          {
            test: /\.json$/,
            loader: 'json-loader'
          },
          {
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader',
          }
        ]
    }
};
