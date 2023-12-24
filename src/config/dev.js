import base from "./base";

const pollingInterval = Number(__POLLING_INTERVAL__);

const dev = {
  apiUrl: "/api",
  dev: true,
  logMissingTranslations: true,
  logGraphQLErrors: true,
  pollingInterval: pollingInterval ? pollingInterval * 1000 : 20000
};

export default {
  ...base,
  ...dev
};
