import { combineReducers } from 'redux';

// Actions
export const OPEN_STATISTICS = '@statistics/OPEN';
export const CLOSE_STATISTICS = '@statistics/CLOSE';

export const openStatistics = (id, mode, title) => ({
  type: OPEN_STATISTICS,
  payload: { id, mode, title }
});

export const closeStatistics = () => ({ type: CLOSE_STATISTICS });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_STATISTICS:
      return true;
    case CLOSE_STATISTICS:
      return false;
    default:
      return state;
  }
};

const id = (state = [], action) => {
  switch (action.type) {
    case OPEN_STATISTICS:
      return action.payload.id;
    default:
      return state;
  }
};

const mode = (state = 'dictionary', action) => {
  switch (action.type) {
    case OPEN_STATISTICS:
      return action.payload.mode;
    default:
      return state;
  }
};

const title = (state = null, action) => {
  switch (action.type) {
    case OPEN_STATISTICS:
      return action.payload.title;
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  id,
  mode,
  title
});
