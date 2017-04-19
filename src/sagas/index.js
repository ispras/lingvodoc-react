import { spawn } from 'redux-saga/effects';

import locale from './locale';
import task from './task';
import user from './user';
import snackbar from './snackbar';

import home from './pages/home';
import perspective from './pages/perspective';

export default function* mainFlow() {
  yield spawn(locale);
  yield spawn(user);
  yield spawn(task);
  yield spawn(snackbar);

  yield spawn(home);
  yield spawn(perspective);
}
