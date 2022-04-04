const express = require('express');
const webpack = require('webpack');
const webpackConfig = require('./webpack.dev');
const config = require('./config');
const LogPlugin = require('./log-plugin');
const _ = require('./utils');

const app = express();

const port = config.port;
webpackConfig.entry.client = [
  'webpack-hot-middleware/client?reload=true',
  ...webpackConfig.entry.client,
];
webpackConfig.plugins.push(new LogPlugin(port));

let compiler;

try {
  compiler = webpack(webpackConfig);
} catch (err) {
  console.log(err.message);
  process.exit(1);
}

const devServerConf = {
  publicPath: webpackConfig.output.publicPath,
  headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': '*',
    'Access-Control-Allow-Headers': '*',
  },
};

// Setup API proxy
if (process.env.PROD) {
  const proxy = require('http-proxy-middleware');

  app.use('/api', proxy({
    target: process.env.PROD,
    pathRewrite: { '^/api': '' },
    changeOrigin: true,
  }));
}

const devMiddleWare = require('webpack-dev-middleware')(compiler, devServerConf);

app.use(devMiddleWare);
app.use(require('webpack-hot-middleware')(compiler, {
  log: console.log,
}));

const mfs = devMiddleWare.context.outputFileSystem;
const file = _.outputIndexPath;

devMiddleWare.waitUntilValid();

app.get('*', (req, res) => {
  devMiddleWare.waitUntilValid(() => {
    const html = mfs.readFileSync(file);
    res.end(html);
  });
});

app.listen(port);
