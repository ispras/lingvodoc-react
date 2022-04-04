import { fromJS } from "immutable";
// Actions
export const SET_RUNNER = "@saga/SET_RUNNER";
export const RUN = "@saga/RUN";
export const STOP = "@saga/STOP";

// Reducers
function runAndUpdate(state, { saga, sagaId }) {
  const runner = state.get("run");
  if (runner) {
    const task = runner(saga);
    return state.setIn(["sagas", sagaId], task);
  }
  return state;
}

function stopAndUpdate(state, sagaId) {
  const task = state.getIn(["sagas", sagaId]);
  if (task && task.isRunning()) {
    task.cancel();
  }
  return state.deleteIn(["sagas", sagaId]);
}

const sagaInit = fromJS({
  run: null,
  sagas: {}
});

function sagaReducer(state = sagaInit, action = {}) {
  switch (action.type) {
    case SET_RUNNER:
      return state.set("run", action.payload);
    case RUN:
      return runAndUpdate(state, action.payload);
    case STOP:
      return stopAndUpdate(state, action.payload);
    default:
      return state;
  }
}

export default sagaReducer;

// Action Creators
export function setRunner(payload) {
  return { type: SET_RUNNER, payload };
}

export function run(payload) {
  return { type: RUN, payload };
}

export function stop(payload) {
  return { type: STOP, payload };
}
