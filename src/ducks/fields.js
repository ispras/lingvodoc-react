import { combineReducers } from "redux";

// Actions
export const OPEN_CREATE_MODAL = "@fields/OPEN_CREATE_MODAL";
export const CLOSE_CREATE_MODAL = "@fields/CLOSE_CREATE_MODAL";

export const openCreateFieldModal = (callback = null) => ({
  type: OPEN_CREATE_MODAL,
  payload: callback
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

const callback = (state = null, { type, payload }) => {
  switch (type) {
    case OPEN_CREATE_MODAL:
      return payload;
    case CLOSE_CREATE_MODAL:
      return null;
    default:
      return state;
  }
};

export default combineReducers({
  callback,
  visible
});
