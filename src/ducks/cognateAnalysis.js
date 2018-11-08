import { combineReducers } from 'redux';

// Actions
export const OPEN_MODAL = '@cognateAnalysis/OPEN_MODAL';
export const CLOSE_MODAL = '@cognateAnalysis/CLOSE_MODAL';

export const openModal = perspectiveId => ({ type: OPEN_MODAL, payload: perspectiveId });
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

const perspectiveId = (state = null, { type, payload }) => {
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
  perspectiveId,
  visible,
});
