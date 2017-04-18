import { Record, List } from 'immutable';
import { Schema, arrayOf } from 'normalizr-immutable';
import { httpGet, httpPost } from './http';

export const Language = new Record({
  client_id: 0,
  locale_exist: false,
  object_id: 0,
  translation: '',
  translation_gist_client_id: 0,
  translation_gist_object_id: 0,
  contains: null,
});

export const languageSchema = new Schema('languages', Language, {
  idAttribute(value) {
    return List.of(value.client_id, value.object_id);
  },
});

export const languageListSchema = arrayOf(languageSchema);

languageSchema.define({ contains: languageListSchema });

export function get() {
  return httpGet('/languages');
}
