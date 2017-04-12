// Actions
const SELECT = '@lang/SELECT';

const initial = {
  langs: {
    ru: 'Russian (Русский)',
    gb: 'English',
    fi: 'Finnish (Suomi)',
    fr: 'French (Français)',
    gr: 'German (Deutsch)',
  },
  selected: 'gb',
};

// Reducer
export default function reducer(state = initial, action = {}) {
  switch (action.type) {
    case SELECT:
      return { ...state, selected: action.payload };
    default:
      return state;
  }
}

// Action Creators
export function selectLang(payload) {
  return { type: SELECT, payload };
}
