import { combineReducers } from 'redux';
import { fromJS } from 'immutable';

// Actions
export const SET_QUERY = '@search/SET_QUERY';
export const STORE_SEARCH_RESULT = '@search/STORE_SEARCH_RESULT';
export const NEW_SEARCH = '@search/NEW_SEARCH';
export const DELETE_SEARCH = '@search/DELETE_SEARCH';

export const setQuery = (searchId, query, category, adopted, etymology, langs, dicts) => ({
  type: SET_QUERY,
  payload: {
    searchId,
    query,
    category,
    adopted,
    etymology,
    langs,
    dicts,
  },
});

export const storeSearchResult = (searchId, results) => ({
  type: STORE_SEARCH_RESULT,
  payload: { searchId, results },
});

export const newSearch = () => ({
  type: NEW_SEARCH,
});

export const deleteSearch = searchId => ({
  type: DELETE_SEARCH,
  payload: searchId,
});

const newBlock = {
  search_string: '',
  matching_type: 'full_string',
};

const emptyQuery = [[newBlock]];

let counter = 1;

function buildNewQuery() {
  counter += 1;
  return {
    id: counter,
    query: emptyQuery,
    categoty: null,
    adopted: null,
    etymology: null,
    results: [],
  };
}

const initialState = {
  id: 1,
  query: emptyQuery,
  categoty: null,
  adopted: null,
  etymology: null,
  langs: null,
  results: [],
};


const searches = (state = [initialState], action) => {
  switch (action.type) {
    case NEW_SEARCH:
      return [...state, buildNewQuery()];
    case DELETE_SEARCH:
      return state.length > 1 ? state.filter(search => search.id !== action.payload) : state;
    case SET_QUERY:
      return state.map(search =>
        (search.id === action.payload.searchId
          ? {
            ...search,
            query: action.payload.query,
            category: action.payload.category,
            adopted: action.payload.adopted,
            etymology: action.payload.etymology,
            langs: action.payload.langs,
            dicts: action.payload.dicts,
          }
          : search));
    case STORE_SEARCH_RESULT:
      return state.map(search => (search.id === action.payload.searchId ? { ...search, results: action.payload.results } : search));
    default:
      return state;
  }
};

export default combineReducers({
  searches,
});
