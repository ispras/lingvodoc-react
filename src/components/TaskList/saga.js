import { call, takeLatest } from 'redux-saga/effects';
import { REMOVE } from 'ducks/task';
import { removeTask } from 'api';

function* remove({ payload }) {
  console.log('detected!');
  yield call(removeTask, payload);
}

export default function* watchRequest() {
  console.log('watch');
  yield* takeLatest(REMOVE, remove);
}
