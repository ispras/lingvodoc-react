import { combineReducers } from 'redux';

// Actions
export const OPEN_DICTIONARY_ROLES = '@dictionary/roles/OPEN';
export const CLOSE_DICTIONARY_ROLES = '@dictionary/roles/CLOSE';

export const openDictionaryRoles = id => ({
  type: OPEN_DICTIONARY_ROLES,
  payload: id,
});

export const closeDictionaryRoles = () => ({ type: CLOSE_DICTIONARY_ROLES });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_DICTIONARY_ROLES:
      return true;
    case CLOSE_DICTIONARY_ROLES:
      return false;
    default:
      return state;
  }
};

const dictionaryId = (state = [], action) => {
  switch (action.type) {
    case OPEN_DICTIONARY_ROLES:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  dictionaryId,
  visible,
});
