// Actions
export const SET_CLIENT = "@apollo/SET_CLIENT";

// Reducers
export default function (state = null, action = {}) {
  switch (action.type) {
    case SET_CLIENT:
      return action.payload;
    default:
      return state;
  }
}

// Action Creators
export function setApolloClient(payload) {
  return { type: SET_CLIENT, payload };
}

export const selectors = {
  client: state => state.apolloClient
};
