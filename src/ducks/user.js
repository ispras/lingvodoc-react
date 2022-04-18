import { combineReducers } from "redux";

// Actions
export const SET = "@user/SET";

// Reducers
function user(state = {}, action = {}) {
  switch (action.type) {
    case SET:
      return action.payload || {};
    default:
      return state;
  }
}

// Action Creators
export function setUser(payload) {
  return { type: SET, payload };
}

export default combineReducers({ user });
