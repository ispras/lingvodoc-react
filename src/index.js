import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose, bindActionCreators } from 'redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import formActionSaga from 'redux-form-saga';
import { ApolloProvider } from 'react-apollo';
import { setRunner } from 'ducks/saga';
import { setApolloClient } from 'ducks/apolloClient';
import { log, suc, warn, err } from 'ducks/snackbar';
import combinedReducer from './reducer';
import mainFlow from './sagas';
import Layout from './Layout';
import apollo from './graphql';
import WebFont from 'webfontloader';
import config from 'config';
import matomo from './sagas/matomo';

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
if (!__DEVELOPMENT__ && config.buildType !== 'desktop') {
  sagaMiddleware.run(matomo);
}
store.dispatch(setRunner(sagaMiddleware.run));

window.logger = bindActionCreators(
  {
    log,
    suc,
    warn,
    err,
  },
  store.dispatch
);

window.dispatch = store.dispatch;

WebFont.load({
  google: {
    families: ['Noto Sans']
  }
});

const dest = document.getElementById('root');

function render() {
  ReactDOM.render(
    <AppContainer>
      <Provider store={store}>
        <ApolloProvider client={apollo}>
          <ConnectedRouter history={history}>
            <Layout />
          </ConnectedRouter>
        </ApolloProvider>
      </Provider>
    </AppContainer>,
    dest
  );
}

render(Layout);

if (__DEVELOPMENT__ && module.hot) {
  module.hot.accept('./Layout', render);
  module.hot.accept('./reducer', () => store.replaceReducer(combinedReducer));
}
