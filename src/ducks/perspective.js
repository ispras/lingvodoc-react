import { combineReducers } from 'redux';
import { is } from 'immutable';
import { createSelectorCreator, createSelector, defaultMemoize } from 'reselect';

import { Dictionary as DictionaryModel } from 'api/dictionary';
import { Perspective as PerspectiveModel } from 'api/perspective';

// Actions
export const REQUEST = '@data/perspective/REQUEST';
export const SET = '@data/perspective/SET';

// Reducers
function entriesTotal(state = 0, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.total ? action.payload.total.count : state;
    default:
      return state;
  }
}

function fields(state = [], action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.fields ? action.payload.fields : state;
    default:
      return state;
  }
}

function entries(state = [], action = {}) {
  switch (action.type) {
    case SET:
      return action.payload.entries ? action.payload.entries : state;
    default:
      return state;
  }
}

function loading(state = false, action = {}) {
  switch (action.type) {
    case REQUEST:
      return true;
    case SET:
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  entriesTotal,
  fields,
  entries,
  loading,
});

// Selectors
const getPerspective =
  state => state.data.perspective;

export const selectors = {
  getPerspective,
};

// Action Creators
export function request(payload) {
  return { type: REQUEST, payload };
}

export function set(payload) {
  return { type: SET, payload };
}
