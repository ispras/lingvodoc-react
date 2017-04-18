import { httpGet, httpPost } from './http';

import { get as getAllLangs } from './language';
window.getAllLangs = getAllLangs;

export function getLangs() {
  return httpGet('/all_locales');
}

export function getTasks() {
  return httpGet('/tasks');
}

export function publishedDicts() {
  return httpPost('/published_dictionaries', {
    group_by_lang: true,
    group_by_org: false,
  });
}

export function perspective() {
  return httpGet(`/perspectives?published=true`);
}
