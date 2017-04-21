import { call, put } from 'redux-saga/effects';
import { all, DataType } from 'api/dataType';
import { setDataTypes } from 'ducks/data';
import { err } from 'ducks/snackbar';

export default function* dataTypesInit() {
  const { data } = yield call(all);
  if (data) {
    const processed = data.map(dt => new DataType(dt));
    yield put(setDataTypes(processed));
  } else {
    yield put(err('Could not get locales'));
  }
}
