import base from './base';

const dev = {
  apiUrl: '/api',
  pollingInterval: '10000',
};

export default {
  ...base,
  ...dev,
};
