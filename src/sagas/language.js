import { call, put } from 'redux-saga/effects';
import { getLangs } from 'api';
import { setLangs } from 'ducks/language';

export default function* languageInit() {
  const response = yield call(getLangs);
  if (response.data) {
    yield put(setLangs(response.data));
  } else {

  }
}
