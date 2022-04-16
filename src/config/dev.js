import base from "./base";

const dev = {
  apiUrl: "/api",
  pollingInterval: 2000000
};

export default {
  ...base,
  ...dev
};
