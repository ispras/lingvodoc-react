import { combineReducers } from "redux";

// Actions
export const OPEN_VIEWER = "@markup/OPEN_VIEWER";
export const CLOSE_VIEWER = "@markup/CLOSE_VIEWER";
export const OPEN_CONVERT = "@markup/OPEN_CONVERT";
export const CLOSE_CONVERT = "@markup/CLOSE_CONVERT";

export const openViewer = (audio, markup, columns, allEntriesGenerator) => ({
  type: OPEN_VIEWER,
  payload: { audio, markup, columns, allEntriesGenerator }
});

export const closeViewer = () => ({ type: CLOSE_VIEWER });

export const openConvert = (audio, markup, columns, allEntriesGenerator) => ({
  type: OPEN_CONVERT,
  payload: { audio, markup, columns, allEntriesGenerator }
});

export const closeConvert = () => ({ type: CLOSE_CONVERT });

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

const data = (state = { audio: {}, markup: {}, columns: [], allEntriesGenerator: null }, action) => {
  switch (action.type) {
    case OPEN_VIEWER:
    case OPEN_CONVERT:
      return action.payload;
    default:
      return state;
  }
};

const convertVisible = (state = false, action) => {
  switch (action.type) {
    case OPEN_CONVERT:
      return true;
    case CLOSE_CONVERT:
      return false;
    default:
      return state;
  }
};

export default combineReducers({
  data,
  visible,
  convertVisible
});
