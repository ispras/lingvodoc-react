const path = require('path');
const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');
const config = require('./config');
const _ = require('./utils');

module.exports = {
  entry: {
    client: './src/index.js',
  },
  output: {
    path: _.outputPath,
    filename: '[name].js',
    publicPath: config.publicPath,
  },
  performance: {
    hints: process.env.NODE_ENV === 'production'
            ? 'warning'
            : false,
  },
  resolve: {
    extensions: ['.js'],
    alias: {
      config: `${config.srcPath}/config/${process.env.REACT_WEBPACK_ENV}`,
    },
    modules: [
      _.cwd('src'),
      _.cwd('node_modules'),
      _.cwd('./'),
    ],
  },
  module: {
    loaders: [
      // {
      //   test: /\.jsx?$/,
      //   enforce: 'pre',
      //   loaders: ['eslint-loader'],
      //   exclude: [/node_modules/],
      // },
      {
        test: /\.jsx?$/,
        loaders: ['babel-loader'],
        exclude: [/node_modules/],
      }, {
        test: /\.(ico|jpg|png|gif|eot|otf|webp|ttf|woff|woff2)(\?.*)?$/,
        loader: 'file-loader?limit=100000',
      }, {
        test: /\.svg$/,
        loader: 'file-loader',
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      title: config.title,
      template: path.resolve(__dirname, '../src/index.html'),
      filename: _.outputIndexPath,
    }),
    new webpack.LoaderOptionsPlugin(_.loadersOptions()),
    new CopyWebpackPlugin([
      {
        from: _.cwd('./static'),
        to: './',
      },
    ]),
  ],
  target: _.target,
};
