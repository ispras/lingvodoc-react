import locale from "api/locale";
import { combineReducers } from "redux";

// Actions
export const REQUEST = "@locale/REQUEST";
export const SELECT = "@locale/SELECT";
export const SET = "@locale/SET";
export const CHANGE = "@locale/CHANGE";

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
  id: locale.get()
};

function selected(state = selectedInitial, action = {}) {
  switch (action.type) {
    case SELECT:
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
    case CHANGE:
      return true;
    case SET:
    case SELECT:
      return false;
    default:
      return state;
  }
}

export default combineReducers({
  locales,
  selected,
  loading
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

export function changeLocale(payload) {
  return { type: CHANGE, payload };
}
