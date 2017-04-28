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

export const PER_PAGE = 20;

function urlsFor(mode) {
  switch (mode) {
    case 'edit':
    case 'publish':
      return ['all_count', 'all'];
    case 'view':
      return ['published_count', 'published'];

    case 'contributions':
    case 'merge':
    default:
      return [];
  }
}

export function perspective(oid, cid, pcid, poid) {
  const baseUrl = `/dictionary/${pcid}/${poid}/perspective/${cid}/${oid}`;

  return {
    oid,
    cid,
    pcid,
    poid,
    fields() {
      return httpGet(`${baseUrl}/fields`);
    },
    total() {
      return httpGet(`${baseUrl}/published_count`);
    },
    published(start = 0, count = 20) {
      return httpGet(`${baseUrl}/published?start_from=${start}&count=${count}`);
    },
    async get({ mode, page }) {
      const start = (page - 1) * PER_PAGE;
      const requests = urlsFor(mode)
        .map(sub => `${baseUrl}/${sub}?start_from=${start}&count=${PER_PAGE}`)
        .map(url => httpGet(url));
      if (requests.length !== 2) {
        return { total: 0, entries: [] };
      }
      const [{ data: total }, { data: entries }] = await Promise.all(requests);
      return { total, entries };
    },
  };
}

export function published() {
  return httpGet('/perspectives?published=true');
}

export function meta() {
  return httpGet('/perspectives_meta');
}
