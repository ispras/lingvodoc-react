import { delay } from 'redux-saga';
import { call, put, spawn } from 'redux-saga/effects';
import { getTasks } from 'api';
import { setTasks, requestTasks } from 'ducks/task';
import config from 'config';

export function* requestFlow() {
  const response = yield call(getTasks);
  if (response.data) {
    yield put(setTasks(response.data));
  } else {

  }
}

export function* polling() {
  while (true) {
    yield* requestFlow();
    yield call(delay, config.pollingInterval);
  }
}

export default function* tasksInit() {
  yield put(requestTasks());
  yield spawn(polling);
}
