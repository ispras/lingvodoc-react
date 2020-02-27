import base from './base';

const dev = {
/*   apiUrl: 'http://localhost:9999/api', */
  apiUrl:'api-mock',
  pollingInterval: 20000,
};

export default {
  ...base,
  ...dev,
};
