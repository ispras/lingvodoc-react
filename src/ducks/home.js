import { combineReducers } from 'redux';
import Immutable, { fromJS } from 'immutable';
import { LOCATION_CHANGE } from 'react-router-redux';
import config from 'config';

// Actions
export const TOGGLE_DICT = '@home/TOGGLE_DICT';
export const RESET_DICTS = '@home/RESET_DICTS';
export const TOGGLE_GRANTS_MODE = '@home/TOGGLE_GRANTS_MODE';
export const SET_GRANTS_MODE = '@home/SET_GRANTS_MODE';

export const toggleDictionary = id => ({
  type: TOGGLE_DICT,
  payload: id,
});

export const resetDictionaries = () => ({ type: RESET_DICTS });

export const toggleGrantsMode = () => ({
  type: TOGGLE_GRANTS_MODE,
});

export const setGrantsMode = mode => ({ type: SET_GRANTS_MODE, payload: mode });

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

function grantsMode(state = false, { type, payload }) {
  switch (type) {
    case TOGGLE_GRANTS_MODE:
      return !state;
    case SET_GRANTS_MODE:
      return payload;
    case LOCATION_CHANGE:
      if (payload.pathname === config.homePath) {
        const params = new URLSearchParams(payload.search);
        const mode = params.get('mode');
        return mode ? mode !== 'dicts' : state;
      }
      return state;
    default:
      return state;
  }
}

export default combineReducers({
  selected,
  grantsMode,
});
