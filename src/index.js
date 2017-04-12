import React from 'react';
import T from 'prop-types';
import ReactDOM from 'react-dom';
import Perf from 'react-addons-perf';
import { AppContainer } from 'react-hot-loader';

import injectTapEventPlugin from 'react-tap-event-plugin';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';

import combinedReducer from './reducer';
import mainFlow from './sagas';
import Layout from './Layout';

const sagaMiddleware = createSagaMiddleware();
const history = createHistory();
const middlewares = [
  routerMiddleware(history),
  sagaMiddleware,
];

let composeEnhancers = compose;
// eslint-disable-next-line no-underscore-dangle
const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
if (__DEVELOPMENT__ && __DEVTOOLS__ && devTools) {
  composeEnhancers = devTools;
}
if (__DEVELOPMENT__) {
  window.Perf = Perf;
}

const store = createStore(
  combinedReducer,
  composeEnhancers(
    applyMiddleware(...middlewares),
  )
);

sagaMiddleware.run(mainFlow);

const dest = document.getElementById('root');

function render() {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ConnectedRouter history={history}>
          <Layout />
        </ConnectedRouter>
      </Provider>
    </AppContainer>,
    dest
  );
}

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

render(Layout);

if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./Layout', render);
  module.hot.accept('./reducer', () => store.replaceReducer(combinedReducer));
}
