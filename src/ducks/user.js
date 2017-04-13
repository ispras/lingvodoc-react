import { combineReducers } from 'redux';
// Actions
export const REQUEST = '@user/REQUEST';
export const SIGN_IN = '@user/SIGN_IN';
export const LAUNCH_SIGN_IN_FORM = '@user/LAUNCH_SIGN_IN_FORM';
export const SIGN_OUT = '@user/SIGN_OUT';
export const SET = '@user/SET';

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
    default:
      return state;
  }
}

export default combineReducers({
  user,
  loading,
});

// Action Creators
export function requestUser() {
  return { type: REQUEST };
}

export function signIn() {
  return { type: SIGN_IN };
}

export function launchSignInForm() {
  return { type: LAUNCH_SIGN_IN_FORM };
}

export function signOut() {
  return { type: SIGN_OUT };
}

export function setUser(payload) {
  return { type: SET, payload };
}
