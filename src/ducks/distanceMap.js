// Actions
export const SET_LANGUAGES_GROUP = '@home/SET_LANGUAGES_GROUP';



// Action Creators

export function setLanguagesGroup(payload) {
  return { type: SET_LANGUAGES_GROUP, payload };
}

// Reducer

function grantsMode(state = {}, { type, payload }) {
  console.log('payload', payload);
  switch (type) {
    case SET_LANGUAGES_GROUP:
      return { arrDictionariesGroup: payload };
    default:
      return state;
  }
}

export default grantsMode;

