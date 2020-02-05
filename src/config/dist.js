import base from './base';

const dist = {
  apiUrl: 'http://10.10.11.137/api',
/*   apiUrl: 'http://localhost:9999/api', */
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
