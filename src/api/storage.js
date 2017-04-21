import { Map, Record, List } from 'immutable';
import { values } from 'lodash';

const updater = newValue => (oldValue) => {
  if (oldValue) {
    return oldValue.update(newValue);
  }
  return newValue;
};

const PLURALS = {
  Perspective: 'perspectives',
  Dictionary: 'dictionaries',
  DataType: 'dataTypes',
};

export default class Storage extends Record({
  perspectives: new Map(),
  dictionaries: new Map(),
  dataTypes: new Map(),
}) {
  all(name) {
    const lookup = name.storageName || PLURALS[name] || name;
    return this.get(lookup).valueSeq();
  }

  getEntity(id1, id2) {
    const id = id2 ? List.of(id1, id2) : id1;
    return values(PLURALS)
      .reduce((ac, field) => ac || this.getIn([field, id]), undefined);
  }

  getParent(entity) {
    return this.getEntity(entity.parent);
  }

  update(entity) {
    return this.updateIn([
      entity.storageName,
      entity.id,
    ], updater(entity));
  }

  updateAll(entities) {
    return this.withMutations((storage) => {
      entities.forEach(entity =>
        storage.updateIn([
          entity.storageName,
          entity.id,
        ], updater(entity))
      );
    });
  }
}
