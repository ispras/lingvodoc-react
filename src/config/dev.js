import base from "./base";

const dev = {
  apiUrl: "/api",
  dev: true,
  logMissingTranslations: true,
  logGraphQLErrors: true,
  pollingInterval: 2000000
};

export default {
  ...base,
  ...dev
};
