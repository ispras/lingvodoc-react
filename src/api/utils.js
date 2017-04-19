import { List } from 'immutable';

export function idPrefix(obj, prefix = '') {
  return List.of(obj[`${prefix}client_id`], obj[`${prefix}object_id`]);
}

export class LingvodocEntity {
  constructor(props) {
    return Object.assign(this, props);
  }

  get id() {
    return idPrefix(this);
  }

  get parent() {
    return idPrefix(this, 'parent_');
  }

  get url() {
    return `${this.client_id}/${this.object_id}`;
  }

  urlFor(prefix = '') {
    const cid = `${prefix}client_id`;
    const oid = `${prefix}object_id`;
    return `${this[cid]}/${this[oid]}`;
  }
}
