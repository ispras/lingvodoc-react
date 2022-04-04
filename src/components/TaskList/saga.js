import { removeTask } from "api";
import { call, takeLatest } from "redux-saga/effects";

import { REMOVE } from "ducks/task";

function* remove({ payload }) {
  yield call(removeTask, payload);
}

export default function* watchRequest() {
  yield takeLatest(REMOVE, remove);
}
