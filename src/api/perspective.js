import { httpGet, httpPost } from './http';
import { LingvodocEntity } from './utils';

export class Perspective extends LingvodocEntity {
  static storageName = 'perspectives';

  get storageName() { // eslint-disable-line class-methods-use-this
    return Perspective.storageName;
  }

  update(props) {
    return Object.assign(new Perspective(), this, props);
  }
}

export function perspective(oid, cid, pcid, poid) {
  const baseUrl = `/dictionary/${pcid}/${poid}/perspective/${cid}/${oid}`;

  return {
    fields() {
      return httpGet(`${baseUrl}/fields`);
    },
    total() {
      return httpGet(`${baseUrl}/published_count`);
    },
    published(start = 0, count = 20) {
      return httpGet(`${baseUrl}/published?start_from=${start}&count=${count}`);
    },
  };
}

export function published() {
  return httpGet('/perspectives?published=true');
}

export function meta() {
  return httpGet('/perspectives_meta');
}
