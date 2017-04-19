import { call, take, put, fork, select } from 'redux-saga/effects';
import { perspective } from 'api/perspective';
import { REQUEST_PERSPECTIVE } from 'ducks/data';

export function* getPerspective({ oid, cid, pcid, poid }) {
  const api = perspective(oid, cid, pcid, poid);
  const [fields, total, published] = yield [
    call(api.fields),
    call(api.total),
    call(api.published),
  ];
}

export default function* perspectiveFlow() {
  while (true) {
    const { payload } = yield take(REQUEST_PERSPECTIVE);
    if (payload) {
      yield* getPerspective(payload);
    }
  }
}
