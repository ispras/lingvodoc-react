import base from './base';

const dist = {
  apiUrl: 'http://sec.itksb.com:8077/api',
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
