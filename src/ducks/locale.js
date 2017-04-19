import { combineReducers } from 'redux';
import locale from 'api/locale';

// Actions
export const REQUEST = '@locale/REQUEST';
export const SELECT = '@locale/SELECT';
export const SET = '@locale/SET';

// Reducers
function locales(state = [], action = {}) {
  switch (action.type) {
    case SET:
      return action.payload;
    default:
      return state;
  }
}

const selectedInitial = {
  id: locale.get(),
};

function selected(state = selectedInitial, action = {}) {
  switch (action.type) {
    case SELECT:
      locale.set(action.payload.id);
      return action.payload;
    case SET:
      return action.payload.find(l => l.id === state.id) || selectedInitial;
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
  locales,
  selected,
  loading,
});

// Action Creators
export function requestLocales() {
  return { type: REQUEST };
}

export function selectLocale(payload) {
  return { type: SELECT, payload };
}

export function setLocales(payload) {
  return { type: SET, payload };
}
