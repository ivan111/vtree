const path = require('path')

const config = {
  entry: './src/vtree.js',

  output: {
    path: path.join(__dirname, 'build'),
    filename: 'vtree.js',
    library: 'vtree'
  },

  module: {
    rules: [
    {
      enforce: 'pre',
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'eslint-loader'
    },
    {
      test: /\.js$/,
      exclude: /node_modules/,
      loader: 'babel-loader',
      query: {
        presets: ['es2015']
      }
    }
    ]
  }
}

module.exports = config
