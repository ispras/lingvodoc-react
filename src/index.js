import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import injectTapEventPlugin from 'react-tap-event-plugin';

import { createStore, applyMiddleware, compose, bindActionCreators, combineReducers} from 'redux';
import { Provider } from 'react-redux';
import createHistory from 'history/createBrowserHistory';
import { ConnectedRouter, routerMiddleware } from 'react-router-redux';
import createSagaMiddleware from 'redux-saga';
import formActionSaga from 'redux-form-saga';
import { ApolloProvider } from 'react-apollo';
import { setRunner } from 'ducks/saga';
import { log, suc, warn, err } from 'ducks/snackbar';
import combinedReducer from './reducer';
import mainFlow from './sagas';
import Layout from './Layout';
import apollo from './graphql';


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


const store = createStore(
  combinedReducer,
  composeEnhancers(
    applyMiddleware(...middlewares),
  )
);

sagaMiddleware.run(mainFlow);
sagaMiddleware.run(formActionSaga);
store.dispatch(setRunner(sagaMiddleware.run));

window.logger = bindActionCreators({ log, suc, warn, err }, store.dispatch);

const dest = document.getElementById('root');


function render() {
  ReactDOM.render(
    <AppContainer>
      <ApolloProvider store={store} client={apollo}>
        <ConnectedRouter history={history}>
          <Layout />
        </ConnectedRouter>
      </ApolloProvider>
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
