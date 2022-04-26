import { combineReducers } from "redux";

// Actions
export const REQUEST = "@user/REQUEST";
export const SET = "@user/SET";
export const ERROR = "@user/ERROR";

// Reducers
function user(state = {}, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload || {};
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
    case ERROR:
      return false;
    default:
      return state;
  }
}

function error(state = false, action = {}) {
  switch (action.type) {
    case ERROR:
      return true;
    case SET:
    case REQUEST:
      return false;
    default:
      return state;
  }
}

// Action Creators
export function requestUser() {
  return { type: REQUEST };
}

export function setUser(payload) {
  return { type: SET, payload };
}

export function setError() {
  return { type: ERROR };
}

export default combineReducers({ user, loading, error });
