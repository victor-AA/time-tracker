const path = require('path')
const webpack = require('webpack')

module.exports = {
  entry: './app/main.js',
  output: {
    path: path.resolve(__dirname, './dist'),
    filename: 'bundle.js'
  },
  module: {
    loaders: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        exclude: /node_modules/,
        loader: 'babel-loader'
      }
    ]
  },
  plugins: [
    new webpack.ExternalsPlugin('commonjs', [
      'electron'
    ])
  ],
  resolve: {
    alias: {
      vue: 'vue/dist/vue.js'
    }
  }
}
