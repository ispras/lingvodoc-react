import base from "./base";

const dev = {
  apiUrl: "/api",
  pollingInterval: 2000000,
  logMissingTranslations: true,
  logGraphQLErrors: true
};

export default {
  ...base,
  ...dev
};
