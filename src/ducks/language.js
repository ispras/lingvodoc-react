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

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_MODAL_CREATE:
      return true;
    case OPEN_MODAL_EDIT:
      return true;
    case CLOSE_MODAL:
      return false;
    default:
      return state;
  }
};

const edit = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL_EDIT:
      return action.payload;
    default:
      return state;
  }
};

const create = (state = null, action) => {
  switch (action.type) {
    case OPEN_MODAL_CREATE:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  create,
  edit,
  visible,
});
