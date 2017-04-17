import { LOCATION_CHANGE } from 'react-router-redux';
import { call, take, put, fork } from 'redux-saga/effects';
import { publishedDicts } from 'api';
import { published, meta } from 'api/perspective';
import { setDictionaries, setPerspectives } from 'ducks/data';

export function* getDictionaries() {
  const { data } = yield call(publishedDicts);
  if (data) {
    yield put(setDictionaries(data));
  }
}

export function* getPerspectives() {
  const [part1, part2] = yield [
    call(published),
    call(meta),
  ];
  if (part1.data) {
    yield put(setPerspectives(part1.data));
  }
  if (part2.data) {
    yield put(setPerspectives(part2.data));
  }
}

export function* dataFlow() {
  yield fork(getDictionaries);
  yield fork(getPerspectives);
}

export default function* home() {
  while (true) {
    const { payload } = yield take(LOCATION_CHANGE);
    if (payload.pathname === '/') {
      yield* dataFlow();
    }
  }
}
