import { httpGet, httpPost } from './http';
import { LingvodocEntity } from './utils';

export class Dictionary extends LingvodocEntity {
  static storageName = 'dictionary';

  get storageName() { // eslint-disable-line class-methods-use-this
    return Dictionary.storageName;
  }

  update(props) {
    return Object.assign(new Dictionary(), this, props);
  }
}

export function published() {
  return httpGet(`/perspectives?published=true`);
}

export function meta() {
  return httpGet('/perspectives_meta');
}
