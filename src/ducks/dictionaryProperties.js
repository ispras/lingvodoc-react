import { combineReducers } from 'redux';

// Actions
const OPEN_MODAL = '@dictionary/properties/OPEN_MODAL';
const CLOSE_MODAL = '@dictionary/properties/CLOSE_MODAL';

export const openDictionaryPropertiesModal = id => ({
  type: OPEN_MODAL,
  payload: id,
});

export const closeDictionaryPropertiesModal = () => ({ type: CLOSE_MODAL });

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

