import { put, select, takeLatest } from "redux-saga/effects";

import { SELECT } from "ducks/locale";
import { request, selectors, SET_FILTER } from "ducks/perspective";

export function* updateForFilter({ payload: filter }) {
  const { params } = yield select(selectors.getPerspective);
  if (filter.value.length) {
    params.page = 1;
  }
  yield put(request({ ...params, filter }, true));
}

export function* updateCurrent() {
  const { params } = yield select(selectors.getPerspective);
  yield put(request(params, false));
}

export default function* perspectiveFlow() {
  yield takeLatest(SET_FILTER, updateForFilter);
  yield takeLatest(SELECT, updateCurrent);
}
