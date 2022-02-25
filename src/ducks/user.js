import { combineReducers } from 'redux';
import { createFormAction } from 'redux-form-saga';
// Actions
export const REQUEST = '@user/REQUEST';
export const SET = '@user/SET';
export const ERROR = '@user/ERROR';

export const LAUNCH_SIGN_IN_FORM = '@user/LAUNCH_SIGN_IN_FORM';
export const signInForm = createFormAction('@user/signin');

export const LAUNCH_SIGN_UP_FORM = '@user/LAUNCH_SIGN_UP_FORM';
export const signUpForm = createFormAction('@user/signup');

export const LAUNCH_EDIT_FORM = '@user/LAUNCH_EDIT_FORM';
export const editForm = createFormAction('@user/edit');

export const LAUNCH_BAN_FORM = '@user/LAUNCH_BAN_FORM';
export const banForm = createFormAction('@user/ban');

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

function error(state = false, action = {}) {
  switch (action.type) {
    case ERROR:
      return true;
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
    case LAUNCH_EDIT_FORM:
      return 'edit';
    case LAUNCH_BAN_FORM:
      return 'ban';
    case signInForm.SUCCESS:
    case signUpForm.SUCCESS:
    case editForm.SUCCESS:
    case CLOSE_FORM:
      return '';
    default:
      return state;
  }
}

function signin_info(state = null, action = {})
{
  switch (action.type) {
    case signInForm.REQUEST:
      return null;
    case signInForm.SUCCESS:
      return null;
    case signInForm.FAILURE:
      return 'Signin failure. Either no such login/password combination exists, or this user account has been deactivated.';
    default:
      return state;
  }
};

export default combineReducers({
  user,
  loading,
  error,
  modal,
  signin_info,
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

export function launchEditForm() {
  return { type: LAUNCH_EDIT_FORM };
}

export function launchBanForm() {
  return { type: LAUNCH_BAN_FORM };
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

export function setError() {
  return { type: ERROR };
}
