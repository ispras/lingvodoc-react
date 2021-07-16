import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL = '@confirm/OPEN_MODAL';
export const CLOSE_MODAL = '@confirm/CLOSE_MODAL';

export const openModal =
  (text = 'Are you sure?', callback = null) =>
    ({ type: OPEN_MODAL, payload: [text, callback] });

export const closeModal =
  () => ({ type: CLOSE_MODAL });

const callback = (state = null, { type, payload }) => {
  switch (type) {
    case OPEN_MODAL:
      return payload[1];
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

const content = (state = null, { type, payload }) => {
  switch (type) {
    case OPEN_MODAL:
      return payload[0];
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return true;
    case CLOSE_MODAL:
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  callback,
  content,
  visible,
});
