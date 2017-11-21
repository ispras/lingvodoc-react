import { combineReducers } from 'redux';

// Actions
export const OPEN_ROLES = '@roles/OPEN';
export const CLOSE_ROLES = '@roles/CLOSE';

export const openRoles = (id, mode) => ({
  type: OPEN_ROLES,
  payload: { id, mode },
});

export const closeRoles = () => ({ type: CLOSE_ROLES });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_ROLES:
      return true;
    case CLOSE_ROLES:
      return false;
    default:
      return state;
  }
};

const id = (state = [], action) => {
  switch (action.type) {
    case OPEN_ROLES:
      return action.payload.id;
    default:
      return state;
  }
};

const mode = (state = '', action) => {
  switch (action.type) {
    case OPEN_ROLES:
      return action.payload.mode;
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  id,
  mode,
});
