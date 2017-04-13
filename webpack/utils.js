
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
              // css-loader relies on context
        context: process.cwd(),
        babel: config.babel,
      },
    };
  },
};


// const _ = module.exports = {};

// _.cwd = file => path.join(process.cwd(), file || '');

// _.outputPath = path.join(__dirname, '../dist');

// _.outputIndexPath = path.join(__dirname, '../dist/index.html');

// _.target = 'web';

// _.loadersOptions = () => {
//   const isProd = process.env.NODE_ENV === 'production';

//   return {
//     minimize: isProd,
//     options: {
//             // css-loader relies on context
//       context: process.cwd(),
//       babel: config.babel,
//     },
//   };
// };
