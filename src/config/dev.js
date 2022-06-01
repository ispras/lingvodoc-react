import base from "./base";

const dev = {
  apiUrl: "/api",
  dev: true,
  logMissingTranslations: true,
  logGraphQLErrors: true,
  pollingInterval: 20000
};

export default {
  ...base,
  ...dev
};
