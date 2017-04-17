import { fromJS } from 'immutable';
import { httpGet, httpPost } from './http';

export function normalize(array, prev = fromJS({})) {
  return array.reduce(
    (ac, e) => ac.update(`${e.client_id}_${e.object_id}`, {}, v => ({ ...v, ...e })),
    prev
  );
}

export function published() {
  return httpGet(`/perspectives?published=true`);
}

export function meta() {
  return httpGet('/perspectives_meta');
}
