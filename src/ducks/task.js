import { combineReducers } from 'redux';
// Actions
const REQUEST = '@task/REQUEST';
const TOGGLE = '@task/TOGGLE';
const SET = '@task/SET';

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
