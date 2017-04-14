const path = require('path');

module.exports = {
  port: 3000,
  title: 'Lingvodoc',
  publicPath: '/',
  srcPath: path.join(__dirname, './../src'),
  vendor: [
    'babel-polyfill',
    'react',
    'react-dom',
    'react-router-dom',
    'react-router-redux',
    'recompose',
    'redux',
    'redux-saga',
    'semantic-ui-react',
    'semantic-ui-css/semantic.css',
  ],
  babel: {
    babelrc: true,
  },
  cssModules: false,
};
