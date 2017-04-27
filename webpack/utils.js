
const path = require('path');
const config = require('./config');

module.exports = {
  cwd(file) {
    return path.join(process.cwd(), file || '');
  },
  outputPath: path.join(__dirname, '../dist'),
  outputIndexPath: path.join(__dirname, '../dist/index.html'),
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
