import { httpGet, httpPost } from './http';

export function getTasks() {
  return httpGet('/tasks');
}

export function publishedDicts() {
  return httpPost('/published_dictionaries', {
    group_by_lang: true,
    group_by_org: false,
  });
}
