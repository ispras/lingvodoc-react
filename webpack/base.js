'use stict';

const { resolve } = require('path');

function alias(path) {
  return resolve(process.cwd(), path);
}

module.exports = {
  resolve: {
    extensions: ['.js'],
    alias: {
      Ducks: alias('src/ducks/'),
      Components: alias('src/components/'),
      Pages: alias('src/pages/'),
      Utils: alias('src/utils/'),
      Styles: alias('src/styles/'),
      Config: alias(`src/config/${process.env.REACT_WEBPACK_ENV}`),
    },
  },
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif)$/,
        use: 'url-loader?limit=8192',
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'url-loader?limit=10000&mimetype=application/font-woff',
      },
      {
        test: /\.(eot|ttf|mp4|ogg|svg|json)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        use: 'file-loader',
      },
    ],
  },
};
