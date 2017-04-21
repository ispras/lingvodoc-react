import { call, takeLatest, put, fork, select } from 'redux-saga/effects';
import { perspective } from 'api/perspective';
import { REQUEST, set } from 'ducks/perspective';

export function* getPerspective({ payload }) {
  const { oid, cid, pcid, poid } = payload;
  const api = perspective(oid, cid, pcid, poid);
  const [{ data: fields }, { data: total }, { data: published }] = yield [
    call(api.fields),
    call(api.total),
    call(api.published),
  ];
  if (fields) {
    yield put(set({ fields }));
  }
  if (total) {
    yield put(set({ total }));
  }
  if (published) {
    yield put(set({ entries: published }));
  }
}

export default function* perspectiveFlow() {
  yield takeLatest(REQUEST, getPerspective);
}
