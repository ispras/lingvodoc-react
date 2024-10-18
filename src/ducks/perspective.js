import { isEqual } from "lodash";
import { combineReducers } from "redux";

// Actions
export const REQUEST = "@data/perspective/REQUEST";
export const SET = "@data/perspective/SET";
export const SET_FILTER = "@data/perspective/SET_FILTER";
export const SET_SORT_MODE = "@data/perspective/SET_SORT_MODE";
export const RESET_SORT_MODE = "@data/perspective/RESET_SORT_MODE";
export const SET_ORDERED_SORT_MODE = "@data/perspective/SET_ORDERED_SORT_MODE";
export const RESET_ORDERED_SORT_MODE = "@data/perspective/RESET_ORDERED_SORT_MODE";
export const ADD_LEXICAL_ENTRY = "@data/perspective/ADD_LEXICAL_ENTRY";
export const REMOVE_ADDED_LEXES = "@data/perspective/REMOVE_ADDED_LEXES";
export const RESET_ADDED_LEXES = "@data/perspective/RESET_ADDED_LEXES";
export const SELECT_LEXICAL_ENTRY = "@data/perspective/SELECT_LEXICAL_ENTRY";
export const RESET_ENTRIES_SELECTION = "@data/perspective/RESET_ENTRIES_SELECTION";

// Reducers
function params(state = {}, action = {}) {
  switch (action.type) {
    case REQUEST:
      return action.payload;
    default:
      return state;
  }
}

function filter(state = { value: "", isCaseSens: true, isRegexp: false }, { type, payload }) {
  switch (type) {
    case SET_FILTER:
      return payload;
    default:
      return state;
  }
}

function sortByField(state = { field: [66, 10], order: "a" }, { type, payload }) {
  switch (type) {
    case SET_SORT_MODE:
      return payload;
    case RESET_SORT_MODE:
      return null;
    default:
      return state;
  }
}

function orderedSortByField(state = { field: null, order: "a" }, { type, payload }) {
  switch (type) {
    case SET_ORDERED_SORT_MODE:
      return payload;
    case RESET_ORDERED_SORT_MODE:
      return null;
    default:
      return state;
  }
}

function createdEntries(state = [], { type, payload }) {
  switch (type) {
    case ADD_LEXICAL_ENTRY:
      return [payload, ...state];
    case REMOVE_ADDED_LEXES:
      return state.filter(s => !payload.find(p_id => isEqual(s.id, p_id)));
    case RESET_ADDED_LEXES:
      return [];
    default:
      return state;
  }
}

function selectedEntries(state = [], { type, payload }) {
  switch (type) {
    case SELECT_LEXICAL_ENTRY:
      return payload.checked ? [payload.id, ...state] : state.filter(id => !isEqual(payload.id, id));
    case RESET_ENTRIES_SELECTION:
      return [];
    default:
      return state;
  }
}

export default combineReducers({
  params,
  filter,
  sortByField,
  orderedSortByField,
  createdEntries,
  selectedEntries
});

// Selectors
const getPerspective = state => state.perspective;

export const selectors = {
  getPerspective
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

export function resetSortByField() {
  return { type: RESET_SORT_MODE, payload: null };
}

export function setOrderedSortByField(field, order) {
  return { type: SET_ORDERED_SORT_MODE, payload: { field, order } };
}

export function resetOrderedSortByField() {
  return { type: RESET_ORDERED_SORT_MODE, payload: null };
}

export function addLexicalEntry(entry) {
  return { type: ADD_LEXICAL_ENTRY, payload: entry };
}

export function removeAddedLexes(ids) {
  return { type: REMOVE_ADDED_LEXES, payload: ids };
}

export function resetAddedLexes(entry) {
  return { type: RESET_ADDED_LEXES, payload: null };
}

export function selectLexicalEntry(id, checked) {
  return { type: SELECT_LEXICAL_ENTRY, payload: { id, checked } };
}

export function resetEntriesSelection() {
  return { type: RESET_ENTRIES_SELECTION };
}
