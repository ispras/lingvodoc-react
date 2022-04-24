import base from "./base";

const dev = {
  apiUrl: "/api",
  pollingInterval: 20000,
  logMissingTranslations: true
};

export default {
  ...base,
  ...dev
};
