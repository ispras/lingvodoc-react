import { combineReducers } from 'redux';
// Actions
export const SET_DICTIONARIES_GROUP = '@distance/SET_DICTIONARIES_GROUP';
export const SET_DEFAULT_GROUP = '@distance/SET_DEFAULT_GROUP';
export const SET_DATA_FOR_TREE = '@distance/SET_DATA_FOR_TREE';
export const SET_MAIN_GROUP_LANGUAGES = '@distance/SET_MAIN_GROUP_LANGUAGES';
export const SET_CHECK_STATE_TREE_FLAT = '@distance/SET_CHECK_STATE_TREE_FLAT';
export const SET_DEFAULT_DATA_FOR_TREE = '@distance/SET_DEFAULT_DATA_FOR_TREE';
// Action Creators

export function setDictionariesGroup(payload) {
  return { type: SET_DICTIONARIES_GROUP, payload };
}
export function setDefaultGroup(payload) {
  return { type: SET_DEFAULT_GROUP, payload };
}
export function setDataForTree(payload) {
  return { type: SET_DATA_FOR_TREE, payload };
}
export function setDefaultDataForTree(payload) {
  return { type: SET_DEFAULT_DATA_FOR_TREE, payload };
}
export function setMainGroupLanguages(payload) {
  return { type: SET_MAIN_GROUP_LANGUAGES, payload };
}
export function setCheckStateTreeFlat(payload) {
  return { type: SET_CHECK_STATE_TREE_FLAT, payload };
}
// Reducer

function checkStateTreeFlat(state = {}, { type, payload }) {
  switch (type) {
    case SET_CHECK_STATE_TREE_FLAT:
      return payload;

    default:
      return state;
  }
}
function dictionariesGroupState(state = { arrDictionariesGroup: [] }, { type, payload }) {
  switch (type) {
    case SET_DICTIONARIES_GROUP:
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
        allField: payload.allField,
        idLocale: payload.id
      };
    case SET_DEFAULT_DATA_FOR_TREE:
      return state;
    default:
      return state;
  }
}

function mainGroupDictionaresAndLanguages(state = {}, { type, payload }) {
  switch (type) {
    case SET_MAIN_GROUP_LANGUAGES:
      return payload;
    default:
      return state;
  }
}
export default combineReducers({
  dataForTree,
  dictionariesGroupState,
  mainGroupDictionaresAndLanguages,
  checkStateTreeFlat,
  setDefaultDataForTree
});

