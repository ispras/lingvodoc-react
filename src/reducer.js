import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';
import { reducer as formReducer } from 'redux-form';

import ducks from './ducks';

import apollo from './graphql'

export default combineReducers({
  ...ducks,
  router: routerReducer,
  form: formReducer,
  apollo: apollo.reducer()
});
