// Actions
export const SET_IS_AUTHENTICATED = '@home/SET_IS_AUTHENTICATED';

// Action Creators
export function setIsAuthenticated(payload) {
  return { type: SET_IS_AUTHENTICATED, payload };
}

// Reducer
function isAuthenticatedState(state = { isAuthenticated: false }, { type, payload }) {
  switch (type) {
    case SET_IS_AUTHENTICATED:
      return payload;
    default:
      return state;
  }
}
export default isAuthenticatedState;
