import base from './base';

const dist = {
/* 
    apiUrl: 'http://localhost:9999', */
  apiUrl: 'http://10.10.11.137',
  env: 'dist',
  homePath: '/',
};

export default {
  ...base,
  ...dist,
};
