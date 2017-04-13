import { spawn } from 'redux-saga/effects';

import language from './language';
import task from './task';

export default function* mainFlow() {
  yield spawn(language);
  yield spawn(task);
}
