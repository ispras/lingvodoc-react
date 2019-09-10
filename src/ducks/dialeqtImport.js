import { compose } from 'redux';
import { OrderedMap, Map, Set, List, fromJS, is } from 'immutable';

// Actions
const INITIALIZE = '@import_dialeqt/INITIALIZE';
const NEXT_STEP = '@import_dialeqt/NEXT_STEP';
const GOTO_STEP = '@import_dialeqt/GOTO_STEP';
const SET_DIALEQT_BLOB_ID = '@import_dialeqt/SET_DIALEQT_BLOB_ID';
const SET_DIALEQT_ACTION = '@import_dialeqt/SET_DIALEQT_ACTION';
const SET_PARENT_LANGUAGE = '@create/SET_PARENT_LANGUAGE';
const SET_DICTIONARY_TRANSLATIONS = '@create/SET_DICTIONARY_TRANSLATIONS';
const SET_UPDATE_DICTIONARY_ID = '@create/SET_UPDATE_DICTIONARY_ID';

// Reducers
function meta(blob) {
  return blob
    .set('translation', new Map());
}

function updateNextStep(state, step) {
  return ({
    CHOICE:
      state.get('dialeqt_action') == 'create' ?
        'PARENT_LANGUAGE' :
        'UPDATE_DICTIONARY',
    PARENT_LANGUAGE: 'TRANSLATIONS',
    TRANSLATIONS: 'FINISH',
    UPDATE_DICTIONARY: 'FINISH',
  })[step] || null;
}

const initial = new Map({
  step: 'CHOICE',
  dialeqt_blob_id: null,
  dialeqt_action: 'create',
  parentLanguage: null,
  translations: new List(),
  update_dictionary_id: null,
});

export default function (state = initial, { type, payload }) {
  let newState = state;
  switch (type) {
    case INITIALIZE:
      newState = new Map(initial);
      break;
    case NEXT_STEP:
      newState = state.update('step', (step) => updateNextStep(state, step));
      break;
    case GOTO_STEP:
      newState = state.set('step', payload);
      break;
    case SET_DIALEQT_BLOB_ID:
      newState = state.set('dialeqt_blob_id', payload);
      break;
    case SET_DIALEQT_ACTION:
      newState = state.set('dialeqt_action', payload);
      break;
    case SET_PARENT_LANGUAGE:
      newState = state.set('parentLanguage', payload);
      break;
    case SET_DICTIONARY_TRANSLATIONS:
      newState = state.set('translations', payload);
      break;
    case SET_UPDATE_DICTIONARY_ID:
      newState = state.set('update_dictionary_id', payload);
      break;
    default:
      return state;
  }

  return newState;
}

// Selectors
export const selectors = {

  getStep(state) {
    return state.dialeqtImport.get('step');
  },

  getNextStep(state) {

    switch (state.dialeqtImport.get('step')) {

      case 'CHOICE':
        return !!state.dialeqtImport.get('dialeqt_blob_id');

      case 'PARENT_LANGUAGE':
        return !!state.dialeqtImport.get('parentLanguage');

      case 'TRANSLATIONS':

        return (
          state.dialeqtImport.get('translations').size > 0 &&
          state.dialeqtImport.get('translations').every(
            translation => translation.get('content').length > 0));

      case 'UPDATE_DICTIONARY':
        return !!state.dialeqtImport.get('update_dictionary_id');

      default:
        return false;
    }  
  },

  getDialeqtBlobId(state) {
    return state.dialeqtImport.get('dialeqt_blob_id');
  },

  getDialeqtAction(state) {
    return state.dialeqtImport.get('dialeqt_action');
  },

  getParentLanguage(state) {
    return state.dialeqtImport.get('parentLanguage');
  },

  getTranslations(state) {
    return state.dialeqtImport.get('translations');
  },

  getUpdateDictionaryId(state) {
    return state.dialeqtImport.get('update_dictionary_id');
  },
};

// Action Creators
export function initialize() {
  return { type: INITIALIZE };
}

export function nextStep() {
  return { type: NEXT_STEP };
}

export function goToStep(payload) {
  return { type: GOTO_STEP, payload };
}

export function setDialeqtBlobId(payload) {
  return { type: SET_DIALEQT_BLOB_ID, payload };
}

export function setDialeqtAction(payload) {
  return { type: SET_DIALEQT_ACTION, payload };
}

export function setParentLanguage(parentLanguage) {
  return {
    type: SET_PARENT_LANGUAGE,
    payload: parentLanguage,
  };
}

export function setTranslations(translations) {
  return {
    type: SET_DICTIONARY_TRANSLATIONS,
    payload: fromJS(translations),
  };
}

export function setUpdateDictionaryId(payload) {
  return { type: SET_UPDATE_DICTIONARY_ID, payload };
}

