// Actions
export const OPEN_MODAL_CREATE = '@language/OPEN_MODAL_CREATE';
export const OPEN_MODAL_EDIT = '@language/OPEN_MODAL_EDIT';
export const CLOSE_MODAL = '@language/CLOSE_MODAL';

export const openModalCreate = parent => (
  {
    type: OPEN_MODAL_CREATE,
    parent,
  }
);

export const openModalEdit = language => (
  {
    type: OPEN_MODAL_EDIT,
    language,
  }
);


export const closeModal = () => (
  {
    type: CLOSE_MODAL,
  }
);

const initialState = {};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case OPEN_MODAL_CREATE:
      return {
        ...state,
        parent: action.parent,
      };
    case OPEN_MODAL_EDIT:
      return {
        ...state,
        language: action.language,
      };
    case CLOSE_MODAL: {
      const { language, parent, ...rest } = state;
      return rest;
    }

    default:
      return state;
  }
};
