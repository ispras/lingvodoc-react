import { combineReducers } from 'redux';

// Actions
export const SET_QUERY = '@search/SET_QUERY';

export const setQuery = query => ({
  type: SET_QUERY,
  payload: query,
});

const query = (state = [], action) => {
  switch (action.type) {
    case SET_QUERY:
      return action.payload;
    default:
      return state;
  }
};


export default combineReducers({
  query,
});
