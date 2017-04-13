import { call, put } from 'redux-saga/effects';
import { getLangs } from 'api';
import { setLangs, requestLangs } from 'ducks/language';

export default function* languageInit() {
  yield put(requestLangs());
  const response = yield call(getLangs);
  if (response.data) {
    yield put(setLangs(response.data));
  } else {

  }
}
