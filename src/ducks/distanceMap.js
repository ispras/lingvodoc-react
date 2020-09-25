import { combineReducers } from 'redux';
// Actions
export const SET_LANGUAGES_GROUP = '@home/SET_LANGUAGES_GROUP';
export const SET_DEFAULT_GROUP = '@home/SET_DEFAULT_GROUP';
export const SET_DATA_FOR_TREE = '@home/SET_DATA_FOR_TREE';

// Action Creators

export function setLanguagesGroup(payload) {
  return { type: SET_LANGUAGES_GROUP, payload };
}
export function setDefaultGroup(payload) {
  return { type: SET_DEFAULT_GROUP, payload };
}
export function setDataForTree(payload) {
  return { type: SET_DATA_FOR_TREE, payload };
}
// Reducer

function languagesGroupState(state = { arrDictionariesGroup: [] }, { type, payload }) {
  switch (type) {
    case SET_LANGUAGES_GROUP:
      return payload;
    case SET_DEFAULT_GROUP:
      return { arrDictionariesGroup: [] };
    default:
      return state;
  }
}
function dataForTree(state = {}, { type, payload }) {
  switch (type) {
    case SET_DATA_FOR_TREE:
      return {
        dictionaries: payload.dictionaries,
        languageTree: payload.language_tree,
        perspectives: payload.perspectives,
        isAuthenticated: payload.is_authenticated,
        allField: payload.allField.all_fields
      };
    default:
      return state;
  }
}
export default combineReducers({ dataForTree, languagesGroupState });

