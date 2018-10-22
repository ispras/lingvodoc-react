const OPEN_MODAL = '@modals/OPEN';
const CLOSE_MODAL = '@modals/CLOSE';

export const openModal = (modal, parameters) => ({
  type: OPEN_MODAL,
  payload: { modal, parameters },
});

export const closeModal = () => ({
  type: CLOSE_MODAL
});

export default function reducer(state = { modals: [] }, action) {
	switch (action.type) {
		case OPEN_MODAL:
			return {
				modals: state.modals.concat({ modal: action.payload.modal, parameters: action.payload.parameters })
			};
    case CLOSE_MODAL:
      const { modals } = state;
      if (modals.length == 0) {
        return state;
      }

			return {
				modals: modals.slice(0, modals.length - 1)
			};
		default:
			return state;
	}
};
