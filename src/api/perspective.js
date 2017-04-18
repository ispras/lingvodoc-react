import { Record, List } from 'immutable';
import { Schema, arrayOf } from 'normalizr-immutable';
import { httpGet, httpPost } from './http';

const Perspective = new Record({
  additional_metadata: [],
  client_id: null,
  created_at: null,
  import_hash: '',
  import_source: '',
  is_template: false,
  marked_for_deletion: false,
  object_id: null,
  parent_client_id: null,
  parent_object_id: null,
  state_translation_gist_client_id: null,
  state_translation_gist_object_id: null,
  status: '',
  translation: '',
  translation_gist_client_id: '',
  translation_gist_object_id: '',

  authors: {},
  location: {},
});

export const perspectiveSchema = new Schema('perspectives', Perspective, {
  idAttribute(value) {
    return List.of(value.client_id, value.object_id);
  },
});

export const perspectiveListSchema = arrayOf(perspectiveSchema);

export function published() {
  return httpGet(`/perspectives?published=true`);
}

export function meta() {
  return httpGet('/perspectives_meta');
}
