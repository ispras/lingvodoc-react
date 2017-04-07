import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import injectTapEventPlugin from 'react-tap-event-plugin';

import { createStore, applyMiddleware, compose } from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import combinedReducer from './reducer';

import Layout from './Layout';

const history = createHistory();
const middlewares = [
  routerMiddleware(history),
];

let composeEnhancers = compose;
// eslint-disable-next-line no-underscore-dangle
const devTools = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__;
if (__DEVELOPMENT__ && __DEVTOOLS__ && devTools) {
  composeEnhancers = devTools;
}

const store = createStore(
  combinedReducer,
  composeEnhancers(
    applyMiddleware(...middlewares),
  )
);

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
