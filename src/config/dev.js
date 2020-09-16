import base from './base';

const dev = {
  apiUrl: 'http://10.10.11.137:8077/api',
  pollingInterval: 20000,
};

export default {
  ...base,
  ...dev,
};
