import { httpGet } from './http';

export function getLangs() {
  return httpGet('/all_locales');
}

export function getTasks() {
  return httpGet('/tasks');
}
