import { call, put, takeEvery, select } from 'redux-saga/effects';
import { getLocales } from 'api/locale';
import { setLocales, requestLocales, SELECT } from 'ducks/locale';
import { err } from 'ducks/snackbar';

export function* resetApollo() {
  const client = yield select(state => state.apolloClient);
  yield call(client.resetStore);
}

export default function* languageInit() {
  yield put(requestLocales());
  const response = yield call(getLocales);
  if (response.data) {
    yield put(setLocales(response.data));
    yield takeEvery(SELECT, resetApollo);
  } else {
    yield put(err('Could not get locales'));
  }
}
