import base from './base';

const dist = {
  apiUrl: 'http://itksb.com:8077/api',
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
