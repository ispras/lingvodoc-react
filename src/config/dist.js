import base from './base';

const dist = {
  apiUrl: 'http://localhost:9999',
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
