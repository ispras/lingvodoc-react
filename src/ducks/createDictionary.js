import { fromJS, List, Map } from "immutable";

// Actions
const NEXT_STEP = "@create/NEXT_STEP";
const GOTO_STEP = "@create/GOTO_STEP";
const PARENT_LANGUAGE_SET = "@create/PARENT_LANGUAGE_SET";
const DICTIONARY_TRANSLATIONS_SET = "@create/DICTIONARY_TRANSLATIONS_SET";
const DICTIONARY_METADATA_SET = "@create/DICTIONARY_METADATA_SET";
const DICTIONARY_PERSPECTIVES_SET = "@create/DICTIONARY_PERSPECTIVES_SET";
const DICTIONARY_PERSPECTIVE_CREATE = "@create/DICTIONARY_PERSPECTIVES_CREATE";

function updateNextStep(step) {
  return (
    {
      PARENT_LANGUAGE: "TRANSLATIONS",
      TRANSLATIONS: "PERSPECTIVES",
      PERSPECTIVES: "FINISH"
    }[step] || null
  );
}

function addEmptyPerspective(perspectives) {
  const perspective = fromJS({
    index: perspectives.size,
    translations: new List(),
    fields: new List()
  });
  return perspectives.push(perspective);
}

const initial = new Map({
  step: "PARENT_LANGUAGE",
  parentLanguage: null,
  translations: new List(),
  metadata: new Map(),
  perspectives: new List(),
  update_flag: true
});

/*
 * A hacky way of optimization via preventing re-rerendering of the whole CreateDictionary translations tab
 * with its Translations and EditDictionaryMetadata / EditCorpusMetadata components when translations or
 * metadata change, we do not return the changed translations / changed metadata unless we switch the step.
 *
 * Changed translations and metadata are still saved in the state and are still shown to the user via
 * changed subcomponents of Translations and EditDictionaryMetadata / EditCorpusMetadata.
 */

export default function (state = initial, { type, payload }) {
  let newState = state.set("update_flag", false);
  switch (type) {
    case NEXT_STEP:
      newState = newState.update("step", updateNextStep).set("update_flag", true);
      break;
    case GOTO_STEP:
      newState = newState.set("step", payload).set("update_flag", true);
      break;
    case PARENT_LANGUAGE_SET:
      newState = newState.set("parentLanguage", payload);
      break;
    case DICTIONARY_TRANSLATIONS_SET:
      newState = newState.set("translations", payload);
      break;
    case DICTIONARY_METADATA_SET:
      newState = newState.update("metadata", metadata => metadata.merge(payload));
      break;
    case DICTIONARY_PERSPECTIVES_SET:
      newState = newState.set("perspectives", payload);
      break;
    case DICTIONARY_PERSPECTIVE_CREATE:
      newState = newState.update("perspectives", addEmptyPerspective);
      break;
    default:
      return state;
  }

  return newState;
}

// Selectors
export const selectors = {
  getStep(state) {
    return state.createDictionary.get("step");
  },
  getNextStep(state) {
    switch (state.createDictionary.get("step")) {
      case "PARENT_LANGUAGE":
        return state.createDictionary.get("parentLanguage") !== null;
      case "TRANSLATIONS":
        return (
          state.createDictionary.get("translations").size > 0 &&
          state.createDictionary.get("translations").every(translation => translation.get("content").length > 0)
        );
      case "PERSPECTIVES":
        return (
          state.createDictionary.get("perspectives").size > 0 &&
          state.createDictionary
            .get("perspectives")
            .every(
              perspective =>
                perspective.get("translations").size > 0 &&
                perspective.get("translations").every(translation => translation.get("content").length > 0)
            )
        );
      default:
        return false;
    }
  },
  getParentLanguage(state) {
    return state.createDictionary.get("parentLanguage");
  },
  getTranslations: (() => {
    let translations_value = null;

    return ({ createDictionary: state }) => {
      if (translations_value === null || state.get("update_flag")) {
        translations_value = state.get("translations");
      }
      return translations_value || state.get("translations");
    };
  })(),
  getMetadata: (() => {
    let metadata_value = null;

    return ({ createDictionary: state }) => {
      if (metadata_value === null || state.get("update_flag")) {
        metadata_value = state.get("metadata");
      }
      return metadata_value || state.get("metadata");
    };
  })(),
  getPerspectives(state) {
    return state.createDictionary.get("perspectives");
  }
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
    payload: parentLanguage
  };
}

export function setTranslations(translations) {
  return {
    type: DICTIONARY_TRANSLATIONS_SET,
    payload: fromJS(translations)
  };
}

export function setMetadata(metadata) {
  return {
    type: DICTIONARY_METADATA_SET,
    payload: fromJS(metadata)
  };
}

export function setPerspectives(payload) {
  return {
    type: DICTIONARY_PERSPECTIVES_SET,
    payload
  };
}

export function createPerspective() {
  return {
    type: DICTIONARY_PERSPECTIVE_CREATE
  };
}
