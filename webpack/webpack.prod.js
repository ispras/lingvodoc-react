const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const _ = require('./utils');

process.env.NODE_ENV = 'production';
process.env.REACT_WEBPACK_ENV = 'dist';

const webpack = require('webpack');
const ExtractTextPlugin = require('extract-text-webpack-plugin');
const ProgressPlugin = require('webpack/lib/ProgressPlugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');
// const OfflinePlugin = require('offline-plugin')
const base = require('./webpack.base');

base.devtool = 'source-map';
base.module.loaders.push(
  {
    test: /\.css$/,
    use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }),
  },
  {
    test: /\.scss$/,
    use: ExtractTextPlugin.extract({ fallback: 'style-loader', use: ['css-loader', 'sass-loader'] }),
  }
);
// use hash filename to support long-term caching
base.output.filename = '[name].[chunkhash:8].js';
// add webpack plugins

base.plugins.push(new HtmlWebpackPlugin({
  template: path.resolve(__dirname, '../src/index.prod.html'),
  favicon: path.resolve(__dirname, '../src/favicon.ico'),
  filename: _.outputIndexPath,
}));

base.plugins.push(
  new CleanWebpackPlugin(['dist']),
  new ProgressPlugin(),
  new ExtractTextPlugin('[name].[contenthash:8].css'),
  new webpack.DefinePlugin({
    'process.env.NODE_ENV': JSON.stringify('production'),
    __DEVELOPMENT__: false,
    __DEVTOOLS__: false,
    __VERSION__: JSON.stringify(_.versionString),
  }),
  new webpack.optimize.UglifyJsPlugin({
    sourceMap: true,
    compress: {
      warnings: false,
      screw_ie8: true,
      conditionals: true,
      unused: true,
      comparisons: true,
      sequences: true,
      dead_code: true,
      evaluate: true,
      if_return: true,
      join_vars: true,
    },
    output: {
      comments: false,
    },
  }),
  // extract vendor chunks
  new webpack.optimize.CommonsChunkPlugin({
    name: 'vendor',
    minChunks(module) {
      return module.context && module.context.indexOf('node_modules') !== -1;
    },
  }),
  new webpack.optimize.CommonsChunkPlugin({ name: 'manifest' })
  // For progressive web apps
  // new OfflinePlugin({
  //   relativePaths: false,
  //   AppCache: false,
  //   ServiceWorker: {
  //     events: true
  //   }
  // })
);

// minimize webpack output
base.stats = {
  // Add children information
  children: false,
  // Add chunk information (setting this to `false` allows for a less verbose output)
  chunks: false,
  // Add built modules information to chunk information
  chunkModules: false,
  chunkOrigins: false,
  modules: false,
};

module.exports = base;
