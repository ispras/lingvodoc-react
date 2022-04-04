import Cookie from "js-cookie";

import config from "config";

import { httpGet, httpPost, httpPut } from "./http";

const DEFAULT_BIRTH = {
  day: 1,
  month: 1,
  year: 1980
};

export function getId() {
  return Cookie.get("client_id");
}

export function getUser() {
  return httpGet("/user");
}

export function signIn({ login, password }) {
  if (config.buildType === "proxy" || config.buildType === "desktop") {
    return httpPost("/signin/desktop", { login, password });
  }
  return httpPost("/signin", { login, password });
}

export function signUp(form) {
  return httpPost(
    "/signup",
    Object.assign(form, DEFAULT_BIRTH, {
      api_url: window.location.origin + config.apiUrl
    })
  );
}

export function editProfile({ id, name, email, new_password: np, old_password: op }) {
  const newUser = { user_id: id, name, email };
  if (np) {
    newUser.new_password = np;
  }
  if (op) {
    newUser.old_password = op;
  }
  return httpPut("/user", newUser);
}

export function signOut() {
  return httpGet("/logout");
}
