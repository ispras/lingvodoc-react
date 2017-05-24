const path = require('path');

module.exports = {
  port: 3000,
  publicPath: '/assets/',
  srcPath: path.join(__dirname, '../src'),
  babel: {
    babelrc: true,
  },
};
