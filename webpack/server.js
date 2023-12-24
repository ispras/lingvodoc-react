const express = require("express");
const webpack = require("webpack");
const webpackConfig = require("./webpack.dev");
const config = require("./config");
const LogPlugin = require("./log-plugin");
const _ = require("./utils");

const app = express();

const port = config.port;
webpackConfig.entry.client = ["webpack-hot-middleware/client?reload=true", ...webpackConfig.entry.client];
webpackConfig.plugins.push(new LogPlugin(port));

let compiler;

try {
  compiler = webpack(webpackConfig);
} catch (err) {
  // eslint-disable-next-line no-console
  console.log(err.message);
  process.exit(1);
}

const devServerConf = {
  publicPath: webpackConfig.output.publicPath,
  headers: {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*"
  }
};

// Setup API and objects proxy
if (process.env.PROD) {
  const { createProxyMiddleware } = require("http-proxy-middleware");

  app.use(
    "/api",
    createProxyMiddleware({
      target: process.env.PROD,
      pathRewrite: { "^/api": "" },
      changeOrigin: true
    })
  );

  app.use(
    "/objects",
    createProxyMiddleware({
      target: process.env.PROD,
      changeOrigin: true
    })
  );
}

const devMiddleWare = require("webpack-dev-middleware")(compiler, devServerConf);

app.use(devMiddleWare);
// eslint-disable-next-line no-console
app.use(require("webpack-hot-middleware")(compiler, { log: console.log }));

const mfs = devMiddleWare.context.outputFileSystem;
const file = _.outputIndexPath;

devMiddleWare.waitUntilValid();

app.get("*", (req, res) => {
  devMiddleWare.waitUntilValid(() => {
    const html = mfs.readFileSync(file);
    res.end(html);
  });
});

if (process.env.HTTPS_CRT)
{
  const fs = require('fs');

  const cert = fs.readFileSync(process.env.HTTPS_CRT, 'utf8');
  const key  = fs.readFileSync(process.env.HTTPS_KEY, 'utf8');

  const http = require('http');
  const https = require('https');

  const url = require('url');

  (http
    .createServer((req, res) => {
      const u = new url.URL('http://' + req.headers['host'] + req.url);
      u.protocol = 'https:';
      u.port = port + 1;
      res.writeHead(301, {"Location": u.toString()});
      res.end();
    })
    .listen(port));

  (https
    .createServer({key, cert}, app)
    .listen(port + 1));
}
else
  app.listen(port);
