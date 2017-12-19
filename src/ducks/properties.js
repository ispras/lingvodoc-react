import { combineReducers } from 'redux';

// Actions
export const OPEN_DICTIONARY_MODAL = '@dictionary/properties/OPEN_MODAL';
export const CLOSE_DICTIONARY_MODAL = '@dictionary/properties/CLOSE_MODAL';

export const openDictionaryPropertiesModal = id => ({
  type: OPEN_DICTIONARY_MODAL,
  payload: id,
});

export const closeDictionaryPropertiesModal = () => ({ type: CLOSE_DICTIONARY_MODAL });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_DICTIONARY_MODAL:
      return true;
    case CLOSE_DICTIONARY_MODAL:
      return false;
    default:
      return state;
  }
};

const id = (state = null, action) => {
  switch (action.type) {
    case OPEN_DICTIONARY_MODAL:
      return action.payload;
    case CLOSE_DICTIONARY_MODAL:
      return null;
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  id,
});
