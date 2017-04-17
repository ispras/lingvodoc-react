import { delay } from 'redux-saga';
import { take, put, spawn } from 'redux-saga/effects';
import { ADD, remove } from 'ducks/snackbar';

export function* dismiss(message) {
  if (message.ttl && !message.dismissable) {
    yield delay(message.ttl);
    yield put(remove(message));
  }
}

export default function* snackbarInit() {
  while (true) {
    const { payload } = yield take(ADD);
    yield spawn(dismiss, payload);
  }
}
