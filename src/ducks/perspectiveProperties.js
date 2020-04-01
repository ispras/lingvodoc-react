import { combineReducers } from 'redux';

// Actions
const OPEN_MODAL = '@perspective/properties/OPEN_MODAL';
const CLOSE_MODAL = '@perspective/properties/CLOSE_MODAL';

export const openPerspectivePropertiesModal = (id, parentId, title) => ({
  type: OPEN_MODAL,
  payload: {
    id,
    parentId,
    title
  }
});

export const closePerspectivePropertiesModal = () => ({ type: CLOSE_MODAL });

const perspective = (state = null, { type, payload }) => {
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
  perspective
});
