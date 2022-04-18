import Immutable, { fromJS } from "immutable";
import { combineReducers } from "redux";

export const TOGGLE_DICT = "@home/TOGGLE_DICT";
export const RESET_DICTS = "@home/RESET_DICTS";
export const SET_SORT_MODE = "@home/SET_SORT_MODE";

export const toggleDictionary = id => ({
  type: TOGGLE_DICT,
  payload: id
});

export const resetDictionaries = () => ({ type: RESET_DICTS });

export const setSortMode = mode => ({ type: SET_SORT_MODE, payload: mode });

function selected(state = new Immutable.Set(), { type, payload }) {
  const id = fromJS(payload);
  switch (type) {
    case TOGGLE_DICT:
      return state.has(id) ? state.delete(id) : state.add(id);
    case RESET_DICTS:
      return new Immutable.Set();
    default:
      return state;
  }
}

function sortMode(state = false, { type, payload }) {
  switch (type) {
    case SET_SORT_MODE:
      return payload;
    default:
      return state;
  }
}

export default combineReducers({
  selected,
  sortMode
});
