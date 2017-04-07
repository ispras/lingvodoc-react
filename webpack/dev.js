'use stict';

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const baseconfig = require('./base');
const options = require('./options');

const plugins = [
  new webpack.DefinePlugin({
    __DEVELOPMENT__: true,
    __DEVTOOLS__: true,
    REACT_WEBPACK_ENV: 'dev',
  }),
  new webpack.HotModuleReplacementPlugin(),
  new HtmlWebpackPlugin({
    inject: true,
    template: options.htmlTemplatePath,
  }),
  new webpack.NamedModulesPlugin(),
  new webpack.NoEmitOnErrorsPlugin(),
];

const config = Object.assign({}, baseconfig, {
  devtool: 'cheap-module-eval-source-map',
  cache: true,
  entry: [
    'react-hot-loader/patch',
    `webpack-dev-server/client?http://localhost:${options.port}`,
    'webpack/hot/only-dev-server',
    './src/index.js',
  ],
  devServer: {
    hot: true,
    inline: true,
    port: options.port,
    historyApiFallback: true,
  },
  output: {
    filename: 'bundle.js',
  },
  plugins,
});

// Setup API proxy
if (process.env.PROD) {
  config.devServer.proxy = {
    '/api': {
      target: process.env.PROD,
      secure: false,
    },
  };
}

config.module.rules.push(
  {
    test: /\.jsx?$/,
    use: [
      'babel-loader',
    ],
    exclude: /node_modules/,
  },
  {
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          modules: true,
          sourceMap: true,
          importLoaders: 1,
          localIdentName: '[name]--[local]--[hash:base64:8]',
        },
      },
      'postcss-loader',
    ],
  },
  {
    test: /\.scss/,
    use: [
      'style-loader',
      'css-loader',
      'postcss-loader',
      'sass-loader?outputStyle=expanded',
    ],
  }
);

module.exports = config;
