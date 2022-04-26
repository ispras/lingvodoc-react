import { gql } from "@apollo/client";
import { call, put, select, takeLatest } from "redux-saga/effects";

import { setTranslations, stringsToTranslate } from "api/i18n";
import locale, { getLocales } from "api/locale";
import { CHANGE, requestLocales, resetTranslations, selectLocale, setLocales } from "ducks/locale";
import { err } from "ducks/snackbar";

const getTranslationsQuery = gql`
  query getTranslations($searchstrings: [String]!) {
    optimized_translation_search(searchstrings: $searchstrings)
  }
`;

function* reloadTranslations(locales, action) {
  const client = yield select(state => state.apolloClient);
  if (action) {
    locale.set(action.payload.id);
  }
  const response = yield call(client.query, {
    query: getTranslationsQuery,
    variables: { searchstrings: stringsToTranslate },
    fetchPolicy: "network-only"
  });
  if (response.data) {
    setTranslations(response.data.optimized_translation_search, locales, locale.get());
    yield put(resetTranslations());
  } else {
    yield put(err("Could not load translations"));
  }
  if (action) {
    yield put(selectLocale(action.payload));
  }
}

export default function* languageInit() {
  yield put(requestLocales());
  const response = yield call(getLocales);
  if (response.data) {
    yield call(reloadTranslations, response.data);
    yield put(setLocales(response.data));
    yield takeLatest(CHANGE, reloadTranslations, response.data);
  } else {
    yield put(err("Could not get locales"));
  }
}
