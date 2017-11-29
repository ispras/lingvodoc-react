import { Map, fromJS } from 'immutable';

export const BLOBS = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));
export const FIELD_TYPES = fromJS(require('./field_types.json'));


/* eslint-disable camelcase */
function singleColumn(name, value, columnTypes) {
  const result = { starling_name: name };

  switch (value) {
    case 'keep':
      result.starling_type = 2;
      result.field_id = columnTypes.get(name, new Map()).toArray();
      break;
    case 'spread':
      result.starling_type = 2;
      result.field_id = columnTypes.get(name, new Map()).toArray();
      break;
    default:
      result.starling_type = 3;
      // Random ignored value
      result.field_id = [65535, 65535];
      // Bad parameter name
      result.link_fake_id = value.split('/').map(x => parseInt(x, 10));
      break;
  }

  return result;
}

function blobExport(blob, columnTypes, language) {
  const blob_id = blob.get('id').toArray();

  const translation_atoms = blob
    .get('translation', new Map())
    .filter(content => content && content.trim() !== '')
    .map((content, locale_id) => ({ content, locale_id }))
    .toArray();

  const parent_id = language
    .get('id', new Map())
    .toArray();

  const field_map = blob
    .get('values', new Map())
    .filter(value => value !== null)
    .map((value, name) => singleColumn(name, value, columnTypes))
    .toArray();

  const add_etymology = blob
    .get('add', false);

  const result = {
    blob_id,
    translation_atoms,
    parent_id,
    field_map,
    add_etymology,
  };

  return result;
}

export function buildExport({ linking, columnTypes, languages }) {
  return linking.reduce(
    (acc, blob, id) => [...acc, blobExport(blob, columnTypes.get(id), languages.get(id))],
    []
  );
}
