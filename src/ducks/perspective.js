import { combineReducers } from 'redux';

// Actions
export const REQUEST = '@data/perspective/REQUEST';
export const SET = '@data/perspective/SET';
export const SET_FILTER = '@data/perspective/SET_FILTER';
export const SET_SORT_MODE = '@data/perspective/SET_SORT_MODE';
export const RESET_SORT_MODE = '@data/perspective/RESET_SORT_MODE';
export const ADD_LEXICAL_ENTRY = '@data/perspective/ADD_LEXICAL_ENTRY';

// Reducers
function params(state = {}, action = {}) {
  switch (action.type) {
    case REQUEST:
      return action.payload;
    default:
      return state;
  }
}

function filter(state = '', action = {}) {
  switch (action.type) {
    case SET_FILTER:
      return action.payload;
    default:
      return state;
  }
}

function sortByField(state = null, { type, payload }) {
  switch (type) {
    case SET_SORT_MODE:
      return payload;
    case RESET_SORT_MODE:
      return null;
    default:
      return state;
  }
}

function createdEntries(state = [], { type, payload }) {
  switch (type) {
    case ADD_LEXICAL_ENTRY:
      return [payload, ...state];
    default:
      return state;
  }
}

export default combineReducers({
  params,
  filter,
  sortByField,
  createdEntries,
});

// Selectors
const getPerspective =
  state => state.data.perspective;

export const selectors = {
  getPerspective,
};

// Action Creators
export function request(payload, lazy = true) {
  return { type: REQUEST, meta: { lazy }, payload };
}

export function set(payload) {
  return { type: SET, payload };
}

export function setFilter(payload) {
  return { type: SET_FILTER, payload };
}

export function setSortByField(field, order) {
  return { type: SET_SORT_MODE, payload: { field, order } };
}

export function addLexicalEntry(entry) {
  return { type: ADD_LEXICAL_ENTRY, payload: entry };
}
