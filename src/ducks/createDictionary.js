import { Map, List, fromJS } from 'immutable';

// Actions
const NEXT_STEP = '@create/NEXT_STEP';
const GOTO_STEP = '@create/GOTO_STEP';
const PARENT_LANGUAGE_SET = '@create/PARENT_LANGUAGE_SET';
const DICTIONARY_TRANSLATIONS_SET = '@create/DICTIONARY_TRANSLATIONS_SET';
const DICTIONARY_METADATA_SET = '@create/DICTIONARY_METADATA_SET';
const DICTIONARY_PERSPECTIVES_SET = '@create/DICTIONARY_PERSPECTIVES_SET';
const DICTIONARY_PERSPECTIVE_CREATE = '@create/DICTIONARY_PERSPECTIVES_CREATE';

function updateNextStep(step) {
  return (
    {
      PARENT_LANGUAGE: 'TRANSLATIONS',
      TRANSLATIONS: 'PERSPECTIVES',
      PERSPECTIVES: 'FINISH',
    }[step] || null
  );
}

function addEmptyPerspective(perspectives) {
  const perspective = fromJS({
    index: perspectives.size,
    translations: new List(),
    fields: new List(),
  });
  return perspectives.push(perspective);
}

const initial = new Map({
  step: 'PARENT_LANGUAGE',
  parentLanguage: null,
  translations: new List(),
  metadata: null,
  perspectives: new List(),
});

export default function (state = initial, { type, payload }) {
  let newState = state;
  switch (type) {
    case NEXT_STEP:
      newState = state.update('step', updateNextStep);
      break;
    case GOTO_STEP:
      newState = state.set('step', payload);
      break;
    case PARENT_LANGUAGE_SET:
      newState = state.set('parentLanguage', payload);
      break;
    case DICTIONARY_TRANSLATIONS_SET:
      newState = state.set('translations', payload);
      break;
    case DICTIONARY_METADATA_SET:
      newState = state.set('metadata', payload);
      break;
    case DICTIONARY_PERSPECTIVES_SET:
      newState = state.set('perspectives', payload);
      break;
    case DICTIONARY_PERSPECTIVE_CREATE:
      newState = state.update('perspectives', addEmptyPerspective);
      break;
    default:
      return state;
  }

  return newState;
}

// Selectors
export const selectors = {
  getStep(state) {
    return state.createDictionary.get('step');
  },
  getNextStep(state) {
    switch (state.createDictionary.get('step')) {
      case 'PARENT_LANGUAGE':
        return state.createDictionary.get('parentLanguage') !== null;
      case 'TRANSLATIONS':
        return (
          state.createDictionary.get('translations').size > 0 &&
          state.createDictionary.get('translations').every(translation => translation.get('content').length > 0)
        );
      case 'PERSPECTIVES':
        return (
          state.createDictionary.get('perspectives').size > 0 &&
          state.createDictionary
            .get('perspectives')
            .every(perspective =>
              perspective.get('translations').size > 0 &&
                perspective.get('translations').every(translation => translation.get('content').length > 0))
        );
      default:
        return false;
    }
  },
  getParentLanguage(state) {
    return state.createDictionary.get('parentLanguage');
  },
  getTranslations(state) {
    return state.createDictionary.get('translations');
  },
  getMetadata(state) {
    return state.createDictionary.get('metadata');
  },
  getPerspectives(state) {
    return state.createDictionary.get('perspectives');
  },
};

// Action Creators
export function nextStep() {
  return { type: NEXT_STEP };
}

export function goToStep(payload) {
  return { type: GOTO_STEP, payload };
}
export function setParentLanguage(parentLanguage) {
  return {
    type: PARENT_LANGUAGE_SET,
    payload: parentLanguage,
  };
}

export function setTranslations(translations) {
  return {
    type: DICTIONARY_TRANSLATIONS_SET,
    payload: fromJS(translations),
  };
}

export function setMetadata(metadata) {
  return {
    type: DICTIONARY_METADATA_SET,
    payload: fromJS(metadata),
  };
}

export function setPerspectives(payload) {
  return {
    type: DICTIONARY_PERSPECTIVES_SET,
    payload,
  };
}

export function createPerspective() {
  return {
    type: DICTIONARY_PERSPECTIVE_CREATE,
  };
}
