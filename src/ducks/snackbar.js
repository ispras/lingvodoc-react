import { OrderedSet } from "immutable";
import { combineReducers } from "redux";
// Actions
export const ADD = "@snackbar/ADD";
export const REMOVE = "@snackbar/REMOVE";
export const CLEAR = "@snackbar/CLEAR";

// Reducers
const messagesInit = OrderedSet.of();
function messages(state = messagesInit, action = {}) {
  switch (action.type) {
    case ADD:
      return state.add(action.payload);
    case REMOVE:
      return state.delete(action.payload);
    case CLEAR:
      return messagesInit;
    default:
      return state;
  }
}

export default combineReducers({
  messages
});

// Action Creators
export function add({ text, ttl = 8000, dismissable = false, color = "blue" }) {
  return {
    type: ADD,
    payload: {
      text,
      ttl,
      dismissable,
      color,
      timestamp: +new Date()
    }
  };
}

export function suc(text, options = {}) {
  return add({ ...options, text, color: "green" });
}

export function log(text, options = {}) {
  return add({ ...options, text, color: "blue" });
}

export function warn(text, options = {}) {
  return add({ ...options, text, color: "yellow" });
}

export function err(text, options = {}) {
  return add({ ...options, text, color: "red" });
}

export function remove(payload) {
  return { type: REMOVE, payload };
}

export function clear() {
  return { type: CLEAR };
}
