import { combineReducers } from 'redux';

// Actions
export const OPEN_LEXICAL_ENTRY = '@lexical_entry/OPEN';
export const CLOSE_LEXICAL_ENTRY = '@lexical_entry/CLOSE';

export const openLexicalEntry = (node, actions, entitiesMode) => ({
  type: OPEN_LEXICAL_ENTRY,
  payload: { node, actions, entitiesMode },
});

export const closeLexicalEntry = () => ({ type: CLOSE_LEXICAL_ENTRY });

const visible = (state = false, action) => {
  switch (action.type) {
    case OPEN_LEXICAL_ENTRY:
      return true;
    case CLOSE_LEXICAL_ENTRY:
      return false;
    default:
      return state;
  }
};

const node = (state = null, action) => {
  switch (action.type) {
    case OPEN_LEXICAL_ENTRY:
      return action.payload.node;
    case CLOSE_LEXICAL_ENTRY:
      return null;
    default:
      return state;
  }
};

const actions = (state = null, action) => {
  switch (action.type) {
    case OPEN_LEXICAL_ENTRY:
      return action.payload.actions;
    case CLOSE_LEXICAL_ENTRY:
      return [];
    default:
      return state;
  }
};

const entitiesMode = (state = null, action) => {
  switch (action.type) {
    case OPEN_LEXICAL_ENTRY:
      return action.payload.entitiesMode;
    case CLOSE_LEXICAL_ENTRY:
      return 'published';
    default:
      return state;
  }
};

export default combineReducers({
  visible,
  node,
  actions,
  entitiesMode,
});
