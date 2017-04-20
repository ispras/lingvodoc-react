import { call, takeLatest, put, fork, select } from 'redux-saga/effects';
import { perspective } from 'api/perspective';
import { REQUEST_PERSPECTIVE } from 'ducks/data';

export function* getPerspective({ payload }) {
  const { oid, cid, pcid, poid } = payload;
  const api = perspective(oid, cid, pcid, poid);
  const [fields, total, published] = yield [
    call(api.fields),
    call(api.total),
    call(api.published),
  ];
}

export default function* perspectiveFlow() {
  yield takeLatest(REQUEST_PERSPECTIVE, getPerspective);
}
