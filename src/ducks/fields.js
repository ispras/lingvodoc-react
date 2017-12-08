import { combineReducers } from 'redux';

// Actions
export const OPEN_CREATE_MODAL = '@fields/OPEN_CREATE_MODAL';
export const CLOSE_CREATE_MODAL = '@fields/CLOSE_CREATE_MODAL';

export const openCreateFieldModal = () => ({
  type: OPEN_CREATE_MODAL,
});

export const closeCreateFieldModal = () => ({ type: CLOSE_CREATE_MODAL });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_CREATE_MODAL:
      return true;
    case CLOSE_CREATE_MODAL:
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  visible,
});
