import { combineReducers } from 'redux';

// Actions
const OPEN_MODAL = '@dictionary/save/OPEN_MODAL';
const CLOSE_MODAL = '@dictionary/save/CLOSE_MODAL';

export const openSaveDictionaryModal = id => ({
  type: OPEN_MODAL,
  payload: id,
});

export const closeSaveDictionaryModal = () => ({ type: CLOSE_MODAL });

const id = (state = null, { type, payload }) => {
  switch (type) {
    case OPEN_MODAL:
      return payload;
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

export default combineReducers({
  id,
});

