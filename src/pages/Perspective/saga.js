import { LOCATION_CHANGE } from "react-router-redux";
import { all, put, select, takeLatest } from "redux-saga/effects";

import { SELECT } from "ducks/locale";
import { request, selectors, SET_FILTER } from "ducks/perspective";

import getParams from "./utils";

export function* updateForFilter({ payload: filter }) {
  const { params } = yield select(selectors.getPerspective);
  yield put(request({ ...params, filter }, true));
}

export function* updateCurrent() {
  const { params } = yield select(selectors.getPerspective);
  yield put(request(params, false));
}

function* locationChanged({ payload }) {
  const params = getParams(payload);
  if (params) {
    yield put(request(params, true));
  }
}

export default function* perspectiveFlow() {
  yield takeLatest(SET_FILTER, updateForFilter);
  yield takeLatest(SELECT, updateCurrent);
  yield takeLatest(LOCATION_CHANGE, locationChanged);
}
