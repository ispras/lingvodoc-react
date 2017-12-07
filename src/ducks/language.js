import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL_CREATE = '@language/OPEN_MODAL_CREATE';
export const OPEN_MODAL_EDIT = '@language/OPEN_MODAL_EDIT';
export const CLOSE_MODAL = '@language/CLOSE_MODAL';

export const openModalCreate = parent => ({
  type: OPEN_MODAL_CREATE,
  payload: parent,
});

export const openModalEdit = language => ({
  type: OPEN_MODAL_EDIT,
  payload: language,
});

export const closeModal = () => ({
  type: CLOSE_MODAL,
});

const createVisible = (state = false, action) => {
  switch (action.type) {
    case OPEN_MODAL_CREATE:
      return true;
    case CLOSE_MODAL:
      return false;
    default:
      return state;
  }
};

const editVisible = (state = false, action) => {
  switch (action.type) {
    case OPEN_MODAL_EDIT:
      return true;
    case CLOSE_MODAL:
      return false;
    default:
      return state;
  }
};

const language = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL_EDIT:
      return action.payload;
    default:
      return state;
  }
};

const parent = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL_CREATE:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  createVisible,
  editVisible,
  language,
  parent,
});
