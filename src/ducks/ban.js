import { combineReducers } from "redux";

export const OPEN_MODAL = "@ban/OPEN_MODAL";
export const CLOSE_MODAL = "@ban/CLOSE_MODAL";

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
  visible
});
