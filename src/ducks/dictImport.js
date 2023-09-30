import { fromJS, is, List, Map, OrderedMap, Set } from "immutable";
import { compose } from "redux";

// Actions
const SET_BLOBS = "@import/SET_BLOBS";
const NEXT_STEP = "@import/NEXT_STEP";
const GOTO_STEP = "@import/GOTO_STEP";
const LINKING_SELECT = "@import/LINKING_SELECT";
const LINKING_ADD = "@import/LINKING_ADD";
const LINKING_DELETE = "@import/LINKING_DELETE";
const LINKING_SET_COLUMN = "@import/LINKING_SET_COLUMN";
const LINKING_TOGGLE_ADD_COLUMN = "@import/LINKING_TOGGLE_ADD_COLUMN";
const COLUMN_SET_TYPE = "@import/COLUMN_SET_TYPE";
const LANGUAGE_SET = "@import/LANGUAGE_SET";
const LICENSE_SET = "@import/LICENSE_SET";
const LOCALE_SET = "@import/LOCALE_SET";

// Reducers
function meta(blob) {
  return blob.set("translation", new Map());
}

function replaceSelect(state, payload) {
  const id = fromJS(payload);
  const blob = state.get("blobs").find(x => is(x.get("id"), id));
  return state.set("linking", new OrderedMap([[id, meta(blob)]]));
}

function addBlobSelect(state, payload) {
  const id = fromJS(payload);
  if (state.getIn(["linking", id], false)) {
    return state;
  }
  const blob = state.get("blobs").find(x => is(x.get("id"), id));
  return state.setIn(["linking", id], meta(blob));
}

function deleteBlobSelect(state, payload) {
  const id = fromJS(payload);
  return state.deleteIn(["linking", id]);
}

function setColumn(state, { id, column, value }) {
  let subState = state;

  if (value && value.includes("/")) {
    subState = addBlobSelect(
      state,
      value.split("/").map(x => parseInt(x, 10))
    );
  }
  return subState.setIn(["linking", id, "values", column], value);
}

function updateSingleSpread(result, blob) {
  const spreadColumns = blob
    .get("values")
    .filter(value => value === "spread")
    .keySeq()
    .map(
      column =>
        new Map({
          from: blob.get("id"),
          column
        })
    );
  const spreadTo = blob
    .get("values")
    .filter(value => value && value.includes("/"))
    .valueSeq()
    .map(value => fromJS([parseInt(value.split("/")[0], 10), parseInt(value.split("/")[1], 10)]));

  return result.withMutations(map => {
    spreadTo.forEach(id => {
      if (!map.get(id, false)) {
        map.set(id, new Set());
      }
      map.update(id, v => v.withMutations(set => spreadColumns.forEach(col => set.add(col))));
    });
  });
}

function updateSpread(state) {
  const extractedSpreads = state.get("linking").reduce((acc, blob) => updateSingleSpread(acc, blob), new Map());
  return state.set("spreads", extractedSpreads);
}

function updateNextStep(step) {
  return (
    {
      LINKING: "COLUMNS",
      COLUMNS: "LANGUAGES"
    }[step] || null
  );
}

function updateColumnTypes(state) {
  const blobs = state.get("linking");
  const columnTypes = state.get("columnTypes");

  return state.withMutations(map => {
    columnTypes.forEach((blob, id) => {
      if (!blobs.get(id)) {
        map.deleteIn(["columnTypes", id]);
      }
    });

    blobs.forEach((blob, id) => {
      if (!columnTypes.get(id)) {
        map.setIn(["columnTypes", id], new OrderedMap());
      }

      blob.get("values").forEach((value, column) => {
        if (value !== null) {
          const defaultField = value && value.includes("/") ? "LINK" : null;
          map.updateIn(["columnTypes", id, column], v => v || defaultField);
        }
      });
    });
  });
}

const initial = new Map({
  step: "LINKING",
  blobs: new List(),
  linking: new OrderedMap(),
  spreads: new Map(),
  columnTypes: new OrderedMap(),
  languages: new Map(),
  licenses: new Map()
});

const computeStore = compose(updateColumnTypes, updateSpread);

export default function (state = initial, { type, payload }) {
  let newState = state;
  switch (type) {
    case SET_BLOBS:
      newState = initial.set("blobs", payload);
      break;
    case NEXT_STEP:
      newState = state.update("step", updateNextStep);
      break;
    case GOTO_STEP:
      newState = state.set("step", payload);
      break;
    case LINKING_SELECT:
      newState = replaceSelect(state, payload);
      break;
    case LINKING_ADD:
      newState = addBlobSelect(state, payload);
      break;
    case LINKING_DELETE:
      newState = deleteBlobSelect(state, payload);
      break;
    case LINKING_SET_COLUMN:
      newState = setColumn(state, payload);
      break;
    case LINKING_TOGGLE_ADD_COLUMN:
      newState = state.updateIn(["linking", payload, "add"], false, v => !v);
      break;
    case COLUMN_SET_TYPE:
      newState = state.setIn(["columnTypes", payload.id, payload.column], payload.field);
      break;
    case LANGUAGE_SET:
      newState = state.setIn(["languages", payload.id], fromJS(payload.language));
      break;
    case LICENSE_SET:
      newState = state.setIn(["licenses", payload.id], payload.license);
      break;
    case LOCALE_SET:
      if (payload.value) {
        return state.setIn(["linking", payload.id, "translation", payload.locale], payload.value);
      } else {
        return state.deleteIn(["linking", payload.id, "translation", payload.locale]);
      }
    default:
      return state;
  }

  return computeStore(newState);
}

// Selectors
export const selectors = {
  getStep(state) {
    return state.dictImport.get("step");
  },
  getNextStep(state, minimum=0) {
    switch (state.dictImport.get("step")) {
      case "LINKING":
        return (
          state.dictImport
            .get("linking")
            .toArray()
            .reduce((count, info) => count + info.get("values").filter(value => value).size, 0) > minimum
        );

      case "COLUMNS":
        const linking = state.dictImport.get("linking");

        return state.dictImport.get("columnTypes").every((field_map, blob_id) => {
          const linking_map = linking.getIn([blob_id, "values"]);

          return field_map.every((field_id, field_name) => field_id !== null || !linking_map.get(field_name));
        });

      case "LANGUAGES":
        const languages = state.dictImport.get("languages");

        return state.dictImport
          .get("linking")
          .every((item, blob_id) => languages.has(blob_id) && item.get("translation").size > 0);

      default:
        return false;
    }
  },
  getBlobs(state) {
    return state.dictImport.get("blobs");
  },
  getLinking(state) {
    return state
             .dictImport.get("linking")
             .filter(v => v.get("id"));
  },
  getSpreads(state) {
    return state.dictImport.get("spreads");
  },
  getColumnTypes(state) {
    return state.dictImport.get("columnTypes");
  },
  getLanguages(state) {
    return state.dictImport.get("languages");
  },
  getLicenses(state) {
    return state.dictImport.get("licenses");
  }
};

// Action Creators
export function setBlobs(payload) {
  return { type: SET_BLOBS, payload };
}

export function nextStep() {
  return { type: NEXT_STEP };
}

export function goToStep(payload) {
  return { type: GOTO_STEP, payload };
}

export function linkingSelect(payload) {
  return { type: LINKING_SELECT, payload };
}

export function linkingAdd(payload) {
  return { type: LINKING_ADD, payload };
}

export function linkingDelete(payload) {
  return { type: LINKING_DELETE, payload };
}

export function updateColumn(id, column, value, oldValue) {
  return {
    type: LINKING_SET_COLUMN,
    payload: {
      id,
      column,
      value,
      oldValue
    }
  };
}

export function toggleAddColumn(payload) {
  return { type: LINKING_TOGGLE_ADD_COLUMN, payload };
}

export function setColumnType(id, column, field) {
  return {
    type: COLUMN_SET_TYPE,
    payload: {
      id,
      column,
      field
    }
  };
}

export function setLanguage(id, language) {
  return {
    type: LANGUAGE_SET,
    payload: { id, language }
  };
}

export function setLicense(id, license) {
  return {
    type: LICENSE_SET,
    payload: { id, license }
  };
}

export function setTranslation(id, locale, value) {
  return {
    type: LOCALE_SET,
    payload: { id, locale, value }
  };
}
