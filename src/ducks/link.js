import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL = '@link/OPEN_MODAL';
export const CLOSE_MODAL = '@link/CLOSE_MODAL';

export const openModal = (perspectiveId, lexicalEntry, fieldId, mode = 'view', entitiesMode = 'all') => ({
  type: OPEN_MODAL,
  payload: {
    perspectiveId,
    lexicalEntry,
    fieldId,
    mode,
    entitiesMode,
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

const perspectiveId = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.perspectiveId;
    case CLOSE_MODAL:
      return null;
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

const entitiesMode = (state = 'all', action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.entitiesMode;
    case CLOSE_MODAL:
      return 'all';
    default:
      return state;
  }
};

const mode = (state = 'view', action) => {
  switch (action.type) {
    case OPEN_MODAL:
      return action.payload.mode;
    case CLOSE_MODAL:
      return 'view';
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  perspectiveId,
  lexicalEntry,
  fieldId,
  mode,
  entitiesMode,
});
