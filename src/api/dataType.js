import { httpGet, httpPost } from './http';
import { LingvodocEntity } from './utils';

export class DataType extends LingvodocEntity {
  static storageName = 'dataTypes';

  get storageName() { // eslint-disable-line class-methods-use-this
    return DataType.storageName;
  }

  update(props) {
    return Object.assign(new DataType(), this, props);
  }
}

export function all() {
  return httpGet('/all_data_types');
}
