import { spawn } from "redux-saga/effects";

import locale from "./locale";
import snackbar from "./snackbar";
import task from "./task";

export default function* mainFlow() {
  yield spawn(snackbar);
  yield spawn(locale);
  yield spawn(task);
}
