const path = require('path');
const webpack = require('webpack')

function resolve (dir) {
  return path.join(__dirname, dir)
}

module.exports = {
  mode: 'production',
  entry: {
    index: './src/index.js'
  },
  externals: {
    "cesium/Source/Cesium.js": {
      commonjs: 'cesium/Source/Cesium.js',
      commonjs2: 'cesium/Source/Cesium.js',
      amd: "cesium/Source/Cesium.js",
      umd: "cesium/Source/Cesium.js",
      root: "Cesium"
    },
    lodash: "lodash",
    '@turf/turf': '@turf/turf',
    'bezier-js': 'bezier-js'
  },
  output: {
    filename: 'index.js',
    path: path.resolve(__dirname, 'dist'),
    library: 'cesium-plotting-symbol',
    libraryTarget: 'umd', //输出格式
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
      }
    ]
  },
  plugins: [
  ]
};
