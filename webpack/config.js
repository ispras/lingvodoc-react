const path = require('path');

module.exports = {
  port: 3000,
  title: 'Lingvodoc',
  publicPath: '/',
  srcPath: path.join(__dirname, './../src'),
  vendor: [
    'react', 'react-dom', 'react-router', 'redux', 'react-router-redux', 'semantic-ui-react', 'semantic-ui-css/semantic.css',
  ],
  babel: {
    babelrc: true,
  },
  cssModules: false,
};
