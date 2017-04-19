import { call, put, fork, take } from 'redux-saga/effects';
import { getId, getUser, signIn, signUp, signOut, editProfile } from 'api/user';
import { setUser, requestUser, SIGN_OUT, signInForm, signUpForm, editForm } from 'ducks/user';
import { err } from 'ducks/snackbar';

import { SubmissionError } from 'redux-form';

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
  yield take(SIGN_OUT);
  const response = yield call(signOut);
  if (response.data) {
    yield put(setUser({}));
  } else {
    yield put(err('Could not sign out'));
  }
}

export function* signInRoutine() {
  const { payload } = yield take(signInForm.REQUEST);
  const response = yield call(signIn, payload);
  if (response.data) {
    yield put(signInForm.success());
  } else {
    yield put(signInForm.failure(
      new SubmissionError({
        _error: response.err.statusText,
      })
    ));
  }
}

export function* signUpRoutine() {
  const { payload } = yield take(signUpForm.REQUEST);
  const response = yield call(signUp, payload);
  if (response.data) {
    yield put(signUpForm.success());
    yield call(signIn, payload);
  }
  if (response.err) {
    yield put(signUpForm.failure(
      new SubmissionError({
        _error: response.err.error,
      })
    ));
  }
}

export function* editRoutine() {
  const { payload } = yield take(editForm.REQUEST);
  const response = yield call(editProfile, payload);
  if (response.data) {
    yield put(editForm.success());
  }
  if (response.err) {
    yield put(editForm.failure(
      new SubmissionError({
        _error: response.err.error,
      })
    ));
  }
}

function* signUpFlow() {
  while (true) {
    yield* signUpRoutine();
    yield* requestRoutine();
  }
}

function* signInFlow() {
  while (true) {
    yield* signInRoutine();
    yield* requestRoutine();
  }
}

function* signOutFlow() {
  while (true) {
    yield* signOutRoutine();
    yield* requestRoutine();
  }
}

function* editFlow() {
  while (true) {
    yield* editRoutine();
    yield* requestRoutine();
  }
}

export default function* main() {
  yield fork(signInFlow);
  yield fork(signUpFlow);
  yield fork(signOutFlow);
  yield fork(editFlow);
  yield* requestRoutine();
}
