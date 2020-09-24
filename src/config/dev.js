import base from './base';

const dev = {
  apiUrl: 'http://sec.itksb.com:8077/api',
  pollingInterval: 20000,
};

export default {
  ...base,
  ...dev,
};
