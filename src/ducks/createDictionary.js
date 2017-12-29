import { Map, List } from 'immutable';

// Actions
const NEXT_STEP = '@create/NEXT_STEP';
const GOTO_STEP = '@create/GOTO_STEP';
const PARENT_LANGUAGE_SET = '@create/PARENT_LANGUAGE_SET';

function updateNextStep(step) {
  return (
    {
      PARENT_LANGUAGE: 'TRANSLATIONS',
      TRANSLATIONS: 'PERSPECTIVES',
      PERSPECTIVES: 'FIELDS',
      FIELDS: 'FINISH',
    }[step] || null
  );
}

const initial = new Map({
  step: 'PARENT_LANGUAGE',
  parentLanguage: null,
  translations: new List(),
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
        return state.createDictionary.get('translations').every(translation => translation.content.size > 0);
      case 'PERSPECTIVES':
        return state.createDictionary.get('perpspectives').size > 0;
      case 'FIELDS':
        return state.createDictionary.get('perpspectives').size > 0;
      default:
        return false;
    }
  },
  getParentLanguage(state) {
    return state.createDictionary.get('parentLanguage');
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
