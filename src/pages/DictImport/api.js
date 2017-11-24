import { Map, fromJS } from 'immutable';

export const BLOBS = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));
export const FIELD_TYPES = fromJS(require('./field_types.json'));

export function buildExport(linking, spreads, columnTypes, languages) {

}
