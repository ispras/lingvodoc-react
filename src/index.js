import React from "react";
import { ApolloProvider } from "react-apollo";
import { Provider } from "react-redux";
import { ConnectedRouter, routerMiddleware } from "react-router-redux";
import ReactDOM from "react-dom";
import createHistory from "history/createBrowserHistory";
import { applyMiddleware, bindActionCreators, compose, createStore } from "redux";
import formActionSaga from "redux-form-saga";
import createSagaMiddleware from "redux-saga";
import WebFont from "webfontloader";

import config from "config";
import { setApolloClient } from "ducks/apolloClient";
import { setRunner } from "ducks/saga";
import { err, log, suc, warn } from "ducks/snackbar";

import matomo from "./sagas/matomo";
import apollo from "./graphql";
import Layout from "./Layout";
import combinedReducer from "./reducer";
import mainFlow from "./sagas";

const sagaMiddleware = createSagaMiddleware();
const history = createHistory();
const middlewares = [routerMiddleware(history), sagaMiddleware];

let composeEnhancers = compose;
// eslint-disable-next-line no-underscore-dangle
const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
if (__DEVELOPMENT__ && __DEVTOOLS__ && devTools) {
  composeEnhancers = devTools;
}

const store = createStore(combinedReducer, composeEnhancers(applyMiddleware(...middlewares)));

store.dispatch(setApolloClient(apollo));

sagaMiddleware.run(mainFlow);
sagaMiddleware.run(formActionSaga);
if (!__DEVELOPMENT__ && config.buildType !== "desktop") {
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

WebFont.load({
  google: {
    families: ["Noto Sans"]
  }
});

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
