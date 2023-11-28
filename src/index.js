import React from "react";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import { createRoot } from 'react-dom/client';
import { ApolloProvider } from "@apollo/client";
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux";
import createSagaMiddleware from "redux-saga";

import apollo from "apolo";
// eslint-disable-next-line import/no-unresolved
import config from "config";
import { setApolloClient } from "ducks/apolloClient";
import { setRunner } from "ducks/saga";
import { err, log, suc, warn } from "ducks/snackbar";
import { initMatomo } from "utils/matomo";

import Layout from "./Layout";
import combinedReducer from "./reducer";
import mainFlow from "./sagas";

const sagaMiddleware = createSagaMiddleware();

const store = createStore(combinedReducer, compose(applyMiddleware(sagaMiddleware)));

store.dispatch(setApolloClient(apollo));

sagaMiddleware.run(mainFlow);
if (process.env.NODE_ENV !== "development" && config.buildType !== "desktop") {
  initMatomo();
}
store.dispatch(setRunner(sagaMiddleware.run));

window.logger = bindActionCreators(
  {
    log,
    suc,
    warn,
    err
  },
  store.dispatch
);

window.dispatch = store.dispatch;

const root = createRoot(document.getElementById("root"));

root.render(<Provider store={store}>
  <ApolloProvider client={apollo}>
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  </ApolloProvider>
</Provider>);
