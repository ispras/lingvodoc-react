import { spawn } from 'redux-saga/effects';
import languageInit from './language';

export default function* mainFlow() {
  yield spawn(languageInit);
}
