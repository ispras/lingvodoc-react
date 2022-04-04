import Cookie from "js-cookie";

import { httpGet } from "./http";

const FIELD = "locale_id";
const DEFAULT = 2;

export function getLocales() {
  return httpGet("/all_locales");
}

export function setLocaleId(localeId = DEFAULT) {
  Cookie.set(FIELD, localeId);
}

export function getLocaleId() {
  const localeId = Cookie.get(FIELD);
  if (localeId) {
    return parseInt(localeId, 10);
  }
  setLocaleId();
  return getLocaleId();
}

export default {
  get: getLocaleId,
  set: setLocaleId
};
