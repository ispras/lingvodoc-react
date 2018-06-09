import { call, takeLatest } from 'redux-saga/effects';
import { REMOVE } from 'ducks/task';
import { removeTask } from 'api';

function* remove({ payload }) {
  yield call(removeTask, payload);
}

export default function* watchRequest() {
  yield takeLatest(REMOVE, remove);
}
