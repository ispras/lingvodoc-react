const path = require('path');
const config = require('./config');

const buildType = process.env.LINGVODOC_BUILD_TYPE ? process.env.LINGVODOC_BUILD_TYPE : "server";

module.exports = {
  cwd(file) {
    return path.join(process.cwd(), file || '');
  },
  outputPath: path.join(__dirname, `../dist/${buildType}`, config.publicPath),
  outputIndexPath: path.join(__dirname, `../dist/${buildType}/index.html`),
  target: 'web',
  loadersOptions() {
    const isProd = process.env.NODE_ENV === 'production';

    return {
      minimize: isProd,
      options: {
        context: process.cwd(),
        babel: config.babel,
      },
    };
  },
};
