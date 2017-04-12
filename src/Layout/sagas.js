import { spawn, call, put } from 'redux-saga/effects';
import { getLangs } from 'Api';
import { setLangs } from 'Ducks/language';

export function* languageInit() {
  const response = yield call(getLangs);
  if (response.data) {
    yield put(setLangs(response.data));
  } else {

  }
}

export default function* mainFlow() {
  yield spawn(languageInit);
}
