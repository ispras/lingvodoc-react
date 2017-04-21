import { delay } from 'redux-saga';
import { takeEvery, put } from 'redux-saga/effects';
import { ADD, remove } from 'ducks/snackbar';

export function* dismiss({ payload: message }) {
  if (message.ttl && !message.dismissable) {
    yield delay(message.ttl);
    yield put(remove(message));
  }
}

export default function* snackbarInit() {
  yield takeEvery(ADD, dismiss);
}
