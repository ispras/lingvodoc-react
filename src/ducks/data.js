import { combineReducers } from 'redux';
import { fromJS } from 'immutable';
import { normalize } from 'api/perspective';
// Actions
const DICTS_SET = '@data/DICTS_SET';
const PERSPECT_SET = '@data/PERSPECT_SET';

// Reducers
function dictionaries(state = [], action = {}) {
  switch (action.type) {
    case DICTS_SET:
      return action.payload;
    default:
      return state;
  }
}

const perspectivesInit = fromJS({});
function perspectives(state = perspectivesInit, action = {}) {
  switch (action.type) {
    case PERSPECT_SET:
      return normalize(action.payload, state);
    default:
      return state;
  }
}

export default combineReducers({
  dictionaries,
  perspectives,
});

// Action Creators
export function setDictionaries(payload) {
  return { type: DICTS_SET, payload };
}

export function setPerspectives(payload) {
  return { type: PERSPECT_SET, payload };
}
