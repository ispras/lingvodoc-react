import base from "./base";

const dev = {
  apiUrl: "/api",
  pollingInterval: 20000
};

export default {
  ...base,
  ...dev
};
