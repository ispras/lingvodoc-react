import { combineReducers } from "redux";

// Actions
export const OPEN_MODAL = "@create_perspective/OPEN_MODAL";
export const CLOSE_MODAL = "@create_perspective/CLOSE_MODAL";

export const openModal = dictionaryId => ({ type: OPEN_MODAL, payload: dictionaryId });
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

const dictionaryId = (state = null, { type, payload }) => {
  switch (type) {
    case OPEN_MODAL:
      return payload;
    case CLOSE_MODAL:
      return null;
    default:
      return state;
  }
};

export default combineReducers({
  dictionaryId,
  visible
});
