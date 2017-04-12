// Actions
const SELECT = '@lang/SELECT';
const SET = '@lang/SET';

// Reducer
const initial = {
  langs: [],
  selected: 0,
};

export default function reducer(state = initial, action = {}) {
  switch (action.type) {
    case SELECT:
      return { ...state, selected: action.payload };
    case SET:
      return { ...state, langs: action.payload };
    default:
      return state;
  }
}

// Action Creators
export function selectLang(payload) {
  return { type: SELECT, payload };
}

export function setLangs(payload) {
  return { type: SET, payload };
}
