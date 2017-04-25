import { flatMap } from 'lodash';
import { combineReducers } from 'redux';
import { is } from 'immutable';
import { createSelectorCreator, createSelector, defaultMemoize } from 'reselect';

import { Dictionary as DictionaryModel } from 'api/dictionary';
import { Perspective as PerspectiveModel } from 'api/perspective';
import Storage from 'api/storage';

import perspective from './perspective';

// Actions
export const REQUEST_PUBLISHED_DICTS = '@data/REQUEST_PUBLISHED_DICTS';
export const DICTS_SET = '@data/DICTS_SET';
export const DATA_TYPES_SET = '@data/DATA_TYPES_SET';
export const PUBLISHED_PERSPECTIVE_SET = '@data/PUBLISHED_PERSPECTIVE_SET';

// Reducers
function dictionaries(state = [], action = {}) {
  switch (action.type) {
    case DICTS_SET:
      return action.payload;
    default:
      return state;
  }
}

const storageInit = new Storage();
function storage(state = storageInit, action = {}) {
  switch (action.type) {
    case PUBLISHED_PERSPECTIVE_SET:
    case DATA_TYPES_SET:
      return state.updateAll(action.payload);
    default:
      return state;
  }
}

function loading(state = false, action = {}) {
  switch (action.type) {
    case REQUEST_PUBLISHED_DICTS:
      return true;
    case DICTS_SET:
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  loading,
  dictionaries,
  storage,

  perspective,
});

// Selectors
function rc({ dicts = [], contains = [], translation, client_id, object_id }, history = []) {
  const newHistory = [...history, translation];

  return [
    {
      url: `${client_id}/${object_id}`,
      history: newHistory,
      dicts: dicts.map(x => new DictionaryModel(x)),
    },
    ...flatMap(contains, sub => rc(sub, newHistory)),
  ];
}

function preprocess(languages) {
  return flatMap(languages, lang => rc(lang, []));
}

const getData =
  state => state.data;

const getStorage =
  state => state.data.storage;

const getLoading =
  state => state.data.loading;

const getDictionaries =
  createSelector(getData, state => preprocess(state.dictionaries));

const createImmutableSelector =
  createSelectorCreator(defaultMemoize, is);

const getPerspectives =
  createImmutableSelector(getStorage, s => s.all(PerspectiveModel).groupBy(x => x.parent));

export const selectors = {
  getData,
  getStorage,
  getLoading,
  getDictionaries,
  getPerspectives,
};

// Action Creators
export function requestPublished() {
  return { type: REQUEST_PUBLISHED_DICTS };
}

export function setDictionaries(payload) {
  return { type: DICTS_SET, payload };
}

export function setPerspectives(payload) {
  return { type: PUBLISHED_PERSPECTIVE_SET, payload };
}

export function setDataTypes(payload) {
  return { type: DATA_TYPES_SET, payload };
}
