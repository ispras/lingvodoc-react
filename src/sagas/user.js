import { call, put, select, takeLatest } from 'redux-saga/effects';
import { getId, getUser, signIn, signUp, signOut, editProfile } from 'api/user';
import { setUser, requestUser, SIGN_OUT, signInForm, signUpForm, editForm } from 'ducks/user';
import { err } from 'ducks/snackbar';

import { SubmissionError } from 'redux-form';

export function* resetApollo() {
  const client = yield select(state => state.apolloClient);
  yield call(client.resetStore);
}

export function* requestRoutine() {
  if (yield call(getId)) {
    yield put(requestUser());
    const response = yield call(getUser);
    if (response.data) {
      yield put(setUser(response.data));
    } else {
      yield put(err('Could not get user info'));
    }
  }
}

export function* signOutRoutine() {
  const response = yield call(signOut);
  if (response.data) {
    yield put(setUser({}));
    yield call(resetApollo);
  } else {
    yield put(err('Could not sign out'));
  }
  yield* requestRoutine();
}

export function* signInRoutine({ payload }) {
  const response = yield call(signIn, payload);
  if (response.data) {
    yield put(signInForm.success());
    yield call(resetApollo);
  } else {
    yield put(signInForm.failure(new SubmissionError({
      _error: response.err.statusText,
    })));
  }
  yield* requestRoutine();
}

export function* signUpRoutine({ payload }) {
  const response = yield call(signUp, payload);
  if (response.data) {
    yield put(signUpForm.success());
    yield call(signIn, payload);
  }
  if (response.err) {
    yield put(signUpForm.failure(new SubmissionError({
      _error: response.err.error,
    })));
  }
  yield* requestRoutine();
}

export function* editRoutine({ payload }) {
  const response = yield call(editProfile, payload);
  if (response.data) {
    yield put(editForm.success());
  }
  if (response.err) {
    yield put(editForm.failure(new SubmissionError({
      _error: response.err.error,
    })));
  }
  yield* requestRoutine();
}

export default function* main() {
  yield takeLatest(signInForm.REQUEST, signInRoutine);
  yield takeLatest(signUpForm.REQUEST, signUpRoutine);
  yield takeLatest(editForm.REQUEST, editRoutine);
  yield takeLatest(SIGN_OUT, signOutRoutine);
  yield* requestRoutine();
}
