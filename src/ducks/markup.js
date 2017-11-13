import { combineReducers } from 'redux';

// Actions
export const OPEN_VIEWER = '@markup/OPEN_VIEWER';
export const CLOSE_VIEWER = '@markup/CLOSE_VIEWER';

export const openViewer = (audio, markup) => ({
  type: OPEN_VIEWER,
  payload: { audio, markup },
});

export const closeViewer = () => ({ type: CLOSE_VIEWER });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_VIEWER:
      return true;
    case CLOSE_VIEWER:
      return false;
    default:
      return state;
  }
};

const data = (state = { audio: {}, markup: {} }, action) => {
  switch (action.type) {
    case OPEN_VIEWER:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  data,
  visible,
});
