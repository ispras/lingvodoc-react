import { getId, getUser } from "api/user";
import { call, put } from "redux-saga/effects";

import { requestUser } from "ducks/user";

function* init() {
  const url = "https://matomo.at.ispras.ru/";
  window._paq = window._paq || [];
  window._paq.push(["setTrackerUrl", `${url}matomo.php`]);
  window._paq.push(["setSiteId", 1]);
  const clientId = getId();
  if (clientId) {
    window._paq.push(["setCustomVariable", 1, "clientId", clientId]);
    yield put(requestUser());
    const response = yield call(getUser);
    if (response.data) {
      window._paq.push(["setUserId", response.data]);
    }
  }

  const script = document.createElement("script");
  script.type = "text/javascript";
  script.async = true;
  script.defer = true;
  script.src = `${url}matomo.js`;
  document.head.appendChild(script);

  window._paq.push(["trackPageView"]);
  window._paq.push(["enableLinkTracking"]);
}

export function* startTrackUser() {
  if (window._paq) {
    const clientId = getId();
    window._paq.push(["setCustomVariable", "1", "clientId", clientId]);
    yield put(requestUser());
    const response = yield call(getUser);
    if (response.data) {
      window._paq.push(["setUserId", response.data.login]);
      window._paq.push(["trackPageView"]);
    }
  }
}

export function stopTrackUser() {
  if (window._paq) {
    window._paq.push(["resetUserId"]);
    window._paq.push(["deleteCustomVariable", 1, "visit"]);
    window._paq.push(["trackPageView"]);
  }
}

export default function* main() {
  yield* init();
}
