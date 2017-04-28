import { call, takeLatest, put, select } from 'redux-saga/effects';
import { LOCATION_CHANGE } from 'react-router-redux';
import { perspective } from 'api/perspective';
import { REQUEST, SET_FILTER, request, set, selectors } from 'ducks/perspective';
import { SELECT } from 'ducks/locale';
import { err } from 'ducks/snackbar';

import getParams from './utils';

function* getFields(pers, lazy) {
  const { params, fields } = yield select(selectors.getPerspective);
  if (lazy && fields.length > 0 && params.cid === pers.cid && params.oid === pers.oid) {
    return fields;
  }

  const { data } = yield call(pers.fields);
  return data;
}

function* getValues(pers, opts) { // No lazy ATM
  return yield call(pers.get, opts);
}

export function* getPerspective({ payload, meta }) {
  const { oid, cid, pcid, poid, ...rest } = payload;
  const { lazy = true } = meta;
  const api = perspective(oid, cid, pcid, poid);
  const [fields, values] = yield [
    getFields(api, lazy),
    getValues(api, rest, lazy),
  ];
  if (fields && values) {
    yield put(set({ fields, ...values }));
  } else {
    yield put(err('Could not get perspective info'));
  }
}

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
  yield takeLatest(REQUEST, getPerspective);
  yield takeLatest(SET_FILTER, updateForFilter);
  yield takeLatest(SELECT, updateCurrent);
  yield takeLatest(LOCATION_CHANGE, locationChanged);
}
