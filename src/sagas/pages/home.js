import { call, take, put, fork, select } from 'redux-saga/effects';
import { publishedDicts } from 'api';
import { published, meta, Perspective } from 'api/perspective';
import { REQUEST_PUBLISHED_DICTS, requestPublished, setDictionaries, setPerspectives } from 'ducks/data';
import { SELECT } from 'ducks/locale';

export function* getDictionaries() {
  const { data } = yield call(publishedDicts);
  if (data) {
    yield put(setDictionaries(data));
  }
}

export function* getPerspective(apiCall) {
  const { data } = yield call(apiCall);
  if (data) {
    const processed = data.map(p => new Perspective(p));
    yield put(setPerspectives(processed));
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

export function* watchLang() {
  while (yield take(SELECT)) {
    const pathname = yield select(state => state.router.location.pathname);
    if (pathname === '/') {
      yield put(requestPublished());
    }
  }
}

export default function* home() {
  yield fork(watchLang);
  while (yield take(REQUEST_PUBLISHED_DICTS)) {
    yield* dataFlow();
  }
}
