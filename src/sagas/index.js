import { spawn } from 'redux-saga/effects';

import locale from './locale';
import task from './task';
import user from './user';
import snackbar from './snackbar';

export default function* mainFlow() {
  yield spawn(snackbar);
  yield spawn(locale);
  yield spawn(user);
  yield spawn(task);
}
