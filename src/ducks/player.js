import { combineReducers } from 'redux';

// Actions
export const OPEN_PLAYER = '@player/OPEN_PLAYER';
export const CLOSE_PLAYER = '@player/CLOSE_PLAYER';

export const openPlayer = file => ({
  type: OPEN_PLAYER,
  payload: file,
});

export const closePlayer = () => ({ type: CLOSE_PLAYER });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_PLAYER:
      return true;
    case CLOSE_PLAYER:
      return false;
    default:
      return state;
  }
};

const play = (state = { content: '' }, action) => {
  switch (action.type) {
    case OPEN_PLAYER:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  play,
  visible,
});
