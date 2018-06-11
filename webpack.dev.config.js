'use strict'
const path = require('path');
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.config.js')
const webpackHtml = require('html-webpack-plugin')

const devConfig = merge(baseWebpackConfig, {
  plugins: [
    new webpackHtml({
      filename: 'index.html'
    })
  ],
  devServer: {
    index: 'index.html',
    contentBase: path.join(__dirname, "dist"),
    compress: true,
    port: 9000,
    hot: true,
    compress: false,
    watchOptions: {
      poll: 3000,
    }
  }
})

module.exports = devConfig