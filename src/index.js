import React from "react";
import { Provider } from "react-redux";
import { ConnectedRouter, routerMiddleware } from "react-router-redux";
import ReactDOM from "react-dom";
import { ApolloProvider } from "@apollo/client";
import createHistory from "history/createBrowserHistory";
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux";
import formActionSaga from "redux-form-saga";
import createSagaMiddleware from "redux-saga";

// eslint-disable-next-line import/no-unresolved
import config from "config";
import { setApolloClient } from "ducks/apolloClient";
import { setRunner } from "ducks/saga";
import { err, log, suc, warn } from "ducks/snackbar";

import matomo from "./sagas/matomo";
import apollo from "./apollo";
import Layout from "./Layout";
import combinedReducer from "./reducer";
import mainFlow from "./sagas";

const sagaMiddleware = createSagaMiddleware();
const history = createHistory();
const middlewares = [routerMiddleware(history), sagaMiddleware];

const store = createStore(combinedReducer, compose(applyMiddleware(...middlewares)));

store.dispatch(setApolloClient(apollo));

sagaMiddleware.run(mainFlow);
sagaMiddleware.run(formActionSaga);
if (process.env.NODE_ENV !== "development" && config.buildType !== "desktop") {
  sagaMiddleware.run(matomo);
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

ReactDOM.render(
  <Provider store={store}>
    <ApolloProvider client={apollo}>
      <ConnectedRouter history={history}>
        <Layout />
      </ConnectedRouter>
    </ApolloProvider>
  </Provider>,
  document.getElementById("root")
);
