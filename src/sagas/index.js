import { spawn } from 'redux-saga/effects';

import language from './language';
import task from './task';
import user from './user';

export default function* mainFlow() {
  yield spawn(language);
  yield spawn(user);
  yield spawn(task);
}
