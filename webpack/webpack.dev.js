process.env.NODE_ENV = "development";
process.env.REACT_WEBPACK_ENV = "dev";

const path = require("path");
const webpack = require("webpack");
const base = require("./webpack.base");
const FriendlyErrors = require("@soda/friendly-errors-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactRefreshWebpackPlugin = require("@pmmmwh/react-refresh-webpack-plugin");
const _ = require("./utils");

if (_.versionString) {
  _.versionString += "-";
}

_.versionString += "development";

base.mode = "development";
base.devtool = "eval-source-map";
delete base.entry.vendor;
base.module.rules.push(
  {
    test: /\.css$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: { url: { filter: url => !url.startsWith("data:") } }
      }
    ]
  },
  {
    test: /\.scss$/,
    use: [
      "style-loader",
      {
        loader: "css-loader",
        options: { url: { filter: url => !url.startsWith("data:") } }
      },
      "resolve-url-loader",
      {
        loader: "sass-loader",
        options: { sourceMap: true }
      }
    ]
  }
);

base.plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "../src/index.dev.html"),
    favicon: path.resolve(__dirname, "../src/favicon.ico"),
    filename: _.outputIndexPath,
    meta: {
      "Content-Security-Policy": {
        "http-equiv": "Content-Security-Policy",
        "content": "upgrade-insecure-requests"
      }
    }
  }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("development"),
    __VERSION__: JSON.stringify(_.versionString),
    __BUILD_YEAR__: JSON.stringify(_.buildYear),
    __POLLING_INTERVAL__: JSON.stringify(process.env.POLLING_INTERVAL)
  }),
  new webpack.HotModuleReplacementPlugin(),
  new ReactRefreshWebpackPlugin(),
  new FriendlyErrors()
);

module.exports = base;
