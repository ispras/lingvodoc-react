import { call, takeLatest, put, fork } from 'redux-saga/effects';
import { publishedDicts } from 'api';
import { published, meta, Perspective } from 'api/perspective';
import { REQUEST_PUBLISHED_DICTS, requestPublished, setDictionaries, setPerspectives } from 'ducks/data';
import { SELECT } from 'ducks/locale';
import { err } from 'ducks/snackbar';

export function* getDictionaries() {
  const { data } = yield call(publishedDicts);
  if (data) {
    yield put(setDictionaries(data));
  } else {
    yield put(err('Could not get dictionaries'));
  }
}

export function* getPerspective(apiCall) {
  const { data } = yield call(apiCall);
  if (data) {
    const processed = data.map(p => new Perspective(p));
    yield put(setPerspectives(processed));
  } else {
    yield put(err('Could not get perspectives'));
  }
}

export function* getPerspectives() {
  yield fork(getPerspective, published);
  yield fork(getPerspective, meta);
}

export function* dataFlow() {
  yield fork(getDictionaries);
  yield fork(getPerspectives);
}

export function* localeChange() {
  yield put(requestPublished());
}

export default function* home() {
  yield takeLatest(REQUEST_PUBLISHED_DICTS, dataFlow);
  yield takeLatest(SELECT, localeChange);
}
