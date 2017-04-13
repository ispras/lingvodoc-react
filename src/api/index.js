import { httpGet } from './http';

import * as User from './user';

window.User = User;

export function getLangs() {
  return httpGet('/all_locales');
}

export function getTasks() {
  return httpGet('/tasks');
}
