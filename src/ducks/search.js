import { combineReducers } from "redux";

// Actions
export const SET_QUERY = "@search/SET_QUERY";
export const STORE_SEARCH_RESULT = "@search/STORE_SEARCH_RESULT";
export const NEW_SEARCH = "@search/NEW_SEARCH";
export const NEW_SEARCH_WITH_ADDITIONAL_FIELDS = "@search/NEW_SEARCH_WITH_ADDITIONAL_FIELDS";
export const DELETE_SEARCH = "@search/DELETE_SEARCH";
export const SET_SEARCHES = "@search/SET_SEARCHES";

export const setQuery = (
  searchId,
  query,
  category,
  adopted,
  etymology,
  diacritics,
  langs,
  dicts,
  searchMetadata,
  grammaticalSigns,
  languageVulnerability,
  blocks,
  xlsxExport
) => ({
  type: SET_QUERY,
  payload: {
    searchId,
    query,
    category,
    adopted,
    etymology,
    diacritics,
    langs,
    dicts,
    searchMetadata,
    grammaticalSigns,
    languageVulnerability,
    blocks,
    xlsxExport
  }
});

export const storeSearchResult = (searchId, results) => ({
  type: STORE_SEARCH_RESULT,

  payload: { searchId, results }
});

export const newSearch = () => ({
  type: NEW_SEARCH
});

export const newSearchWithAdditionalFields = additionalFields => ({
  type: NEW_SEARCH_WITH_ADDITIONAL_FIELDS,
  payload: {
    ...additionalFields
  }
});

export const deleteSearch = searchId => ({
  type: DELETE_SEARCH,
  payload: searchId
});

export const setSearches = searches => ({
  type: SET_SEARCHES,
  payload: searches
});

const newBlock = {
  search_string: "",
  matching_type: "full_string"
};

const emptyQuery = [[newBlock]];

let counter = 1;

function buildNewQuery() {
  counter += 1;
  return {
    id: counter,
    query: emptyQuery,
    category: null,
    adopted: null,
    etymology: null,
    diacritics: null,
    langs: null,
    dicts: null,
    searchMetadata: null,
    grammaticalSigns: null,
    languageVulnerability: null,
    blocks: false,
    results: null,
    subQuery: false
  };
}

const initialState = {
  id: 1,
  query: emptyQuery,
  category: null,
  adopted: null,
  etymology: null,
  diacritics: null,
  langs: null,
  dicts: null,
  searchMetadata: null,
  grammaticalSigns: null,
  languageVulnerability: null,
  blocks: false,
  results: null,
  subQuery: false
};

const searches = (state = [initialState], action) => {
  switch (action.type) {
    case NEW_SEARCH:
      return [...state, buildNewQuery()];
    case NEW_SEARCH_WITH_ADDITIONAL_FIELDS:
      return [
        ...state,
        {
          ...buildNewQuery(),
          ...action.payload,
          subQuery: true
        }
      ];
    case DELETE_SEARCH:
      return state.length > 1 ? state.filter(search => search.id !== action.payload) : state;
    case SET_QUERY:
      return state.map(search =>
        search.id === action.payload.searchId
          ? {
              ...search,
              query: action.payload.query,
              category: action.payload.category,
              adopted: action.payload.adopted,
              etymology: action.payload.etymology,
              diacritics: action.payload.diacritics,
              langs: action.payload.langs,
              dicts: action.payload.dicts,
              searchMetadata: action.payload.searchMetadata,
              grammaticalSigns: action.payload.grammaticalSigns,
              languageVulnerability: action.payload.languageVulnerability,
              blocks: action.payload.blocks,
              xlsxExport: action.payload.xlsxExport,
              subQuery: false
            }
          : search
      );
    case STORE_SEARCH_RESULT:
      return state.map(search =>
        search.id === action.payload.searchId ? { ...search, results: action.payload.results } : search
      );
    case SET_SEARCHES:
      return action.payload;
    default:
      return state;
  }
};

export default combineReducers({
  searches
});
