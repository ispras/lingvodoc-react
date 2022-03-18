import { call, put, select, takeLatest } from 'redux-saga/effects';
import { push } from 'react-router-redux';
import { getId, getUser, signIn, signUp, signOut, editProfile } from 'api/user';
import { setUser, requestUser, SIGN_OUT, signInForm, signUpForm, editForm, setError } from 'ducks/user';
import { startTrackUser, stopTrackUser } from './matomo';
import { err } from 'ducks/snackbar';

import { SubmissionError } from 'redux-form';

export function* requestRoutine() {
  if (yield call(getId)) {
    yield put(requestUser());
    const response = yield call(getUser);
    if (response.data) {
      yield put(setUser(response.data));
    } else {
      yield put(setError());
      yield put(err('Could not get user info'));
    }
  }
}

export function* signOutRoutine() {
  let success = false;
  const response = yield call(signOut);
  if (response.data) {
    success = true;
    yield call(window.dispatch, push('/'));
    yield put(setUser({}));
    const client = yield select(state => state.apolloClient);
    yield call([client.cache, client.cache.reset]);
  } else {
    yield put(err('Could not sign out'));
  }
  yield* requestRoutine();
  if (success) {
    stopTrackUser();
  }
}

export function* signInRoutine({ payload }) {
  let success = false;
  const response = yield call(signIn, payload);
  if (response.data) {
    success = true;
    yield put(signInForm.success());
  } else {
    yield put(signInForm.failure(new SubmissionError({
      _error: response.err.statusText,
    })));
  }
  yield* requestRoutine();
  if (success) {
    const client = yield select(state => state.apolloClient);
    yield call([client, client.resetStore]);
    yield* startTrackUser();
  }
}

export function* signUpRoutine({ payload }) {
  const response = yield call(signUp, payload);

  if (response.data) {
    yield put(signUpForm.success());

    if (response.data.result == 'Signup success.')
      yield call(signIn, payload);
    else if (response.data.result == 'Signup approval pending.')
      window.logger.suc(response.data.result);
    else
      window.logger.log(response.data.result);
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
