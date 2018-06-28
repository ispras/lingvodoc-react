// Actions
export const PUT = '@translations/PUT';

// Reducers
export default function translations(state = [], { type, payload }) {
  switch (type) {
    case PUT:
      return payload;
    default:
      return state;
  }
}

// Action Creators
export function putTranslations(payload) {
  return { type: PUT, payload };
}
