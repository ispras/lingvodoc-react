import { call, put, fork, take, race } from 'redux-saga/effects';
import { getId, getUser, signIn, signUp, signOut } from 'api/user';
import { setUser, requestUser, SIGN_OUT, signInForm, signUpForm } from 'ducks/user';
import { SubmissionError } from 'redux-form';

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

export function* signupFlow() {
  const { payload } = yield take(signUpForm.REQUEST);
  const response = yield call(signUp, payload);
  if (response.data) {
    yield put(signUpForm.success());
  }
  if (response.err) {
    yield put(signUpForm.failure(
      new SubmissionError({
        _error: response.err.error,
      })
    ));
  }
}

export default function* main() {
  while (true) {
    if (yield call(getId)) {
      yield fork(requestFlow);
      yield* logoutFlow();
    } else {
      const login = yield fork(loginFlow);
      const signup = yield fork(signupFlow);
      yield race([login.done, signup.done]);
      login.cancel();
      signup.cancel();
    }
  }
}
