const SEPARATOR = '_';

const handler = {
  get(t, name) {
    const data = t[name];
    if (data) {
      return data;
    }
    if (name.endsWith('id')) {
      const str = name.replace(/id$/, '');
      const client = `${str}client_id`;
      const object = `${str}object_id`;
      return t[client] + SEPARATOR + t[object];
    }
    return undefined;
  },
  set(t, name, value) {
    if (name in t) {
      t[name] = value;
    } else if (name.endsWith('id')) {
      const str = name.replace(/id$/, '');
      const client = `${str}client_id`;
      const object = `${str}object_id`;
      const [id1, id2] = value.split(SEPARATOR).map(x => parseInt(x, 10));
      t[client] = id1;
      t[object] = id2;
    }
  },
};

export default function generateProxy(target) {
  return new Proxy(target, handler);
}
