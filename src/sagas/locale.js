import { call, put } from 'redux-saga/effects';
import { getLocales } from 'api/locale';
import { setLocales, requestLocales } from 'ducks/locale';
import { err } from 'ducks/snackbar';

export default function* languageInit() {
  yield put(requestLocales());
  const response = yield call(getLocales);
  if (response.data) {
    yield put(setLocales(response.data));
  } else {
    yield put(err('Could not get locales'));
  }
}
