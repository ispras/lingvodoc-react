import { httpGet, httpPost } from './http';

export function get() {
  return httpGet('/languages');
}
