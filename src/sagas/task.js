import { getTasks } from "api";
import { delay } from "redux-saga";
import { call, put, spawn } from "redux-saga/effects";

import config from "config";
import { err } from "ducks/snackbar";
import { requestTasks, setTasks } from "ducks/task";

export function* requestFlow() {
  const response = yield call(getTasks);
  if (response.data) {
    yield put(setTasks(response.data));
  } else {
    yield put(err("Could not get tasks"));
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
