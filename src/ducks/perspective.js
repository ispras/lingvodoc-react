import { combineReducers } from 'redux';

// Actions
export const REQUEST = '@data/perspective/REQUEST';
export const SET = '@data/perspective/SET';
export const SET_FILTER = '@data/perspective/SET_FILTER';

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

export default combineReducers({
  params,
  filter,
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
