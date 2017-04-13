import { call, put, fork, take, select } from 'redux-saga/effects';
import { getId, getUser, signIn, signOut } from 'api/user';
import { setUser, requestUser, SIGN_OUT, SIGN_IN } from 'ducks/user';
import { close } from 'ducks/modal';

export function* requestFlow() {
  yield put(requestUser());
  const response = yield call(getUser);
  if (response.data) {
    yield put(setUser(response.data));
  } else {

  }
}

export function* logoutFlow() {
  yield take(SIGN_OUT);
  const response = yield call(signOut);
  if (response.data) {
    yield put(setUser({}));
  } else {

  }
}

export function* loginFlow() {
  yield take(SIGN_IN);
  const form = yield select(state => state.form.signin);
  const response = yield call(signIn, form && form.values);
  if (response.data) {
    yield put(close());
    yield fork(requestFlow);
  } else {

  }
}

export function* userFlow() {
  while (true) {
    const id = yield call(getId);
    if (id) {
      yield fork(requestFlow);
      yield* logoutFlow();
    } else {
      yield* loginFlow();
    }
  }
}

export default function* main() {
  yield fork(userFlow);
}
