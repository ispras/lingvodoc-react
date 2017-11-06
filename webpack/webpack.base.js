const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const config = require('./config');
const _ = require('./utils');

module.exports = {
  entry: {
    client: ['babel-polyfill', './src/index.js'],
  },
  output: {
    path: _.outputPath,
    filename: '[name].js',
    publicPath: config.publicPath,
  },
  performance: {
    hints: process.env.NODE_ENV === 'production' ? 'warning' : false,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      config: `${config.srcPath}/config/${process.env.REACT_WEBPACK_ENV}`,
      wavesurfer: require.resolve('wavesurfer.js'),
    },
    modules: ['src', 'node_modules', 'vendor'],
  },
  module: {
    loaders: [
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: [/node_modules/],
      },
      {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader?limit=100000',
      },
      {
        test: /\.svg$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, '../src/index.html'),
      favicon: path.resolve(__dirname, '../src/favicon.ico'),
      filename: _.outputIndexPath,
    }),
    new webpack.LoaderOptionsPlugin(_.loadersOptions()),
    new webpack.ProvidePlugin({
      WaveSurfer: 'wavesurfer.js',
      chroma: 'chroma-js',
    }),
  ],
  target: _.target,
};
