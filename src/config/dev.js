import base from './base';

const dev = {
<<<<<<< HEAD
  apiUrl: 'http://10.10.11.137/api',
 /*  apiUrl: 'http://localhost:9999/api', */
=======
  apiUrl: '/api',
>>>>>>> test
  pollingInterval: 20000,
};

export default {
  ...base,
  ...dev,
};
