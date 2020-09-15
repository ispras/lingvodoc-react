import base from './base';

const dist = {

    apiUrl: 'http://localhost:9999/api',
/*   apiUrl: 'api-mock', */
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
