import { combineReducers } from 'redux';
import { createFormAction } from 'redux-form-saga';
// Actions
export const REQUEST = '@user/REQUEST';
export const SET = '@user/SET';

export const LAUNCH_SIGN_IN_FORM = '@user/LAUNCH_SIGN_IN_FORM';
export const signInForm = createFormAction('@user/signin');

export const LAUNCH_SIGN_UP_FORM = '@user/LAUNCH_SIGN_UP_FORM';
export const signUpForm = createFormAction('@user/signup');

export const SIGN_OUT = '@user/SIGN_OUT';
export const CLOSE_FORM = '@user/CLOSE_FORM';

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

function modal(state = '', action = {}) {
  switch (action.type) {
    case LAUNCH_SIGN_IN_FORM:
      return 'signin';
    case LAUNCH_SIGN_UP_FORM:
      return 'signup';
    case signInForm.SUCCESS:
    case CLOSE_FORM:
      return '';
    default:
      return state;
  }
}

export default combineReducers({
  user,
  loading,
  modal,
});

// Action Creators
export function requestUser() {
  return { type: REQUEST };
}

export function launchSignInForm() {
  return { type: LAUNCH_SIGN_IN_FORM };
}

export function launchSignUpForm() {
  return { type: LAUNCH_SIGN_UP_FORM };
}

export function closeForm() {
  return { type: CLOSE_FORM };
}

export function signOut() {
  return { type: SIGN_OUT };
}

export function setUser(payload) {
  return { type: SET, payload };
}
