const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const _ = require("./utils");

process.env.NODE_ENV = "production";
process.env.REACT_WEBPACK_ENV = "dist";

const webpack = require("webpack");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CssMinimizerPlugin = require("css-minimizer-webpack-plugin");
const base = require("./webpack.base");

base.mode = "production";
base.devtool = "source-map";
base.module.rules.push(
  {
    test: /\.css$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          url: { filter: url => !url.startsWith("data:") },
          sourceMap: true
        }
      }
    ]
  },
  {
    test: /\.scss$/,
    use: [
      MiniCssExtractPlugin.loader,
      {
        loader: "css-loader",
        options: {
          url: { filter: url => !url.startsWith("data:") },
          sourceMap: true
        }
      },
      { loader: "sass-loader", options: { sourceMap: true } }
    ]
  }
);

// CSS minification
base.optimization = {
  minimizer: ["...", new CssMinimizerPlugin()]
};

// use hash filename to support long-term caching
base.output.filename = "[name].[chunkhash:8].js";

// add webpack plugins
base.plugins.push(
  new HtmlWebpackPlugin({
    template: path.resolve(__dirname, "../src/index.prod.html"),
    favicon: path.resolve(__dirname, "../src/favicon.ico"),
    filename: _.outputIndexPath
  })
);

base.plugins.push(
  new webpack.ProgressPlugin(),
  new MiniCssExtractPlugin({ filename: "[name].[contenthash:8].css", chunkFilename: "[id].[contenthash:8].css" }),
  new webpack.DefinePlugin({
    "process.env.NODE_ENV": JSON.stringify("production"),
    __VERSION__: JSON.stringify(_.versionString)
  })
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
  modules: false
};

module.exports = base;
