process.env.NODE_ENV = 'development';
process.env.REACT_WEBPACK_ENV = 'dev';

const path = require('path');
const webpack = require('webpack');
const base = require('./webpack.base');
const FriendlyErrors = require('friendly-errors-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _ = require('./utils');

base.devtool = 'eval-source-map';
base.module.loaders.push({
  test: /\.css$/,
  loaders: ['style-loader', 'css-loader', 'resolve-url-loader'],
}, {
  test: /\.scss$/,
  loaders: ['style-loader', 'css-loader', 'resolve-url-loader', 'sass-loader'],
});

base.plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, '../src/index.dev.html'),
    favicon: path.resolve(__dirname, '../src/favicon.ico'),
    filename: _.outputIndexPath,
  }),
);

base.plugins.push(
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('development'),
    __DEVELOPMENT__: true,
    __DEVTOOLS__: true,
  }),
  new webpack.HotModuleReplacementPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
  new FriendlyErrors()
);

module.exports = base;
