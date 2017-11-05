// Actions
export const PLAY_SOUND = '@lexicalEntry/PLAY_SOUND';

export const playSound = audioFile => ({
  type: PLAY_SOUND,
  payload: {
    audioFile,
  },
});

const initialState = {};

export default (state = initialState, action = {}) => {
  switch (action.type) {
    case PLAY_SOUND:
      return action.payload;
    default:
      return state;
  }
};
