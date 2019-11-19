import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL = '@create_organization/OPEN_MODAL';
export const CLOSE_MODAL = '@create_organization/CLOSE_MODAL';

export const openModal = () => ({ type: OPEN_MODAL });
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

export default combineReducers({
  visible,
});
