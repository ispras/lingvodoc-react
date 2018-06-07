import { combineReducers } from 'redux';

// Actions
export const REQUEST = '@task/REQUEST';
export const TOGGLE = '@task/TOGGLE';
export const SET = '@task/SET';
export const REMOVE = '@task/REMOVE';

// Reducers
function tasks(state = [], action = {}) {
  switch (action.type) {
    case SET:
      return action.payload;
    default:
      return state;
  }
}

function visible(state = false, action = {}) {
  switch (action.type) {
    case TOGGLE:
      return !state;
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
  tasks,
  visible,
  loading,
});

// Action Creators
export function requestTasks() {
  return { type: REQUEST };
}

export function toggleTasks() {
  return { type: TOGGLE };
}

export function setTasks(payload) {
  return { type: SET, payload };
}

export function removeTask(payload) {
  return {
    type: REMOVE,
    payload,
  };
}
