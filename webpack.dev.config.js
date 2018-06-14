'use strict'
const path = require('path');
const merge = require('webpack-merge')
const baseWebpackConfig = require('./webpack.config.js')
const CopyWebpackPlugin = require('copy-webpack-plugin')
const webpackHtml = require('html-webpack-plugin')
const webpack = require('webpack');

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'development',
  entry: {
    index: './src/test.jsx'
  },
  output: {
    filename: 'test.js',
    path: path.resolve(__dirname, 'dist')
  },
  module: {
    rules: [
      {
        test: /\.css$/,
        use: ['style-loader', 'css-loader']
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: [resolve('node_modules')],
        include: [resolve('src'), resolve('test')],
      },
      {
        test: /\.jsx$/,
        loader: 'babel-loader',
        exclude: [resolve('node_modules')],
        include: [resolve('src'), resolve('test')],
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      },
      {
        test: /\.(mp4|webm|ogg|mp3|wav|flac|aac)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      },
      {
        test: /\.(woff2?|eot|ttf|otf)(\?.*)?$/,
        loader: 'url-loader',
        options: {
          limit: 10000
        }
      }
    ]
  },
  plugins: [
    new webpackHtml({
      filename: 'index.html'
    }),
    new webpack.NamedModulesPlugin(),
    new webpack.HotModuleReplacementPlugin(),
    new CopyWebpackPlugin([
      {
        from: path.resolve(__dirname, './static'),
        to: 'static',
        ignore: ['.*']
      }
    ])
  ],
  devServer: {
    inline: true,
    contentBase: "./dist",
    port: 9000,
    hot: true,
    compress: false,
    watchOptions: {
      poll: 3000
    }
  }
}
