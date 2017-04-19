import { call, put } from 'redux-saga/effects';
import { getLocales } from 'api/locale';
import { setLocales, requestLocales } from 'ducks/locale';

export default function* languageInit() {
  yield put(requestLocales());
  const response = yield call(getLocales);
  if (response.data) {
    yield put(setLocales(response.data));
  } else {

  }
}
