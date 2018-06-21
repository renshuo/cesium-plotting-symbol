'use strict'
const path = require('path');
const webpack = require('webpack')
const VueLoaderPlugin = require('vue-loader/lib/plugin')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js'
  },
  externals: {
    '@turf/turf': '@turf/turf',
    'bezier-js': 'bezier-js',
    "cesium/Source/Cesium.js": {
      commonjs: 'cesium/Source/Cesium.js',
      commonjs2: 'cesium/Source/Cesium.js',
      amd: "cesium/Source/Cesium.js",
      umd: "cesium/Source/Cesium.js",
      root: "Cesium"
    },
    color: 'color',
    lodash: 'lodash',
    'vue-antd-ui': 'vue-antd-ui',
    'vue': 'vue'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'cesium-plotting-symbol',
    libraryTarget: 'umd', //输出格式
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.esm.js'
    }
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
        test: /\.vue$/,
        loader: 'vue-loader',
        exclude: [resolve('node_modules')],
        include: [resolve('src'), resolve('test'), resolve('dev')],
      }
    ]
  },
  plugins: [
    new VueLoaderPlugin(),
  ]
};
