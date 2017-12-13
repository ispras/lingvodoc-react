import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL = '@groupingTag/OPEN_MODAL';
export const CLOSE_MODAL = '@groupingTag/CLOSE_MODAL';

export const openModal = (lexicalEntry, fieldId, mode = 'all', controlsMode = 'view') => ({
  type: OPEN_MODAL,
  payload: {
    lexicalEntry,
    fieldId,
    mode,
    controlsMode,
  },
});

export const closeModal = () => ({ type: CLOSE_MODAL });

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

const lexicalEntry = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.lexicalEntry;
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

const fieldId = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.fieldId;
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

const mode = (state = 'all', action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.mode;
    case CLOSE_MODAL:
      return 'all';
    default:
      return state;
  }
};

const controlsMode = (state = 'view', action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.controlsMode;
    case CLOSE_MODAL:
      return 'view';
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  lexicalEntry,
  fieldId,
  mode,
  controlsMode,
});
