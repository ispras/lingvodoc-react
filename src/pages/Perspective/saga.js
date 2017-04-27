import { call, takeLatest, put, select } from 'redux-saga/effects';
import { perspective } from 'api/perspective';
import { REQUEST, SET_FILTER, request, set, selectors } from 'ducks/perspective';
import { SELECT } from 'ducks/locale';
import { err } from 'ducks/snackbar';

export function* getPerspective({ payload }) {
  const { oid, cid, pcid, poid } = payload;
  const api = perspective(oid, cid, pcid, poid);
  const [{ data: fields }, { data: total }, { data: published }] = yield [
    call(api.fields),
    call(api.total),
    call(api.published),
  ];
  if (fields && total && published) {
    yield put(set({ total, fields, entries: published }));
  } else {
    yield put(err('Could not get perspective info'));
  }
}

export function* updateForFilter({ payload: filter }) {
  const { params } = yield select(selectors.getPerspective);
  yield put(request({ ...params, filter }));
}

export function* updateCurrent() {
  const { params } = yield select(selectors.getPerspective);
  yield put(request(params));
}

export default function* perspectiveFlow() {
  yield takeLatest(REQUEST, getPerspective);
  yield takeLatest(SET_FILTER, updateForFilter);
  yield takeLatest(SELECT, updateCurrent);
}
