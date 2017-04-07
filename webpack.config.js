const path = require('path');

if (process.env.NODE_ENV === 'production') {
  process.env.REACT_WEBPACK_ENV = 'dist';
} else {
  process.env.REACT_WEBPACK_ENV = 'dev';
}

const conf = require(path.join(__dirname, 'webpack', process.env.REACT_WEBPACK_ENV));

module.exports = conf;
