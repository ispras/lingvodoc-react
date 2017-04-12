import { httpGet } from './http';

export function getLangs() {
  return httpGet('/all_locales');
}
