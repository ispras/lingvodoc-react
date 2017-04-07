import { combineReducers } from 'redux';
import { routerReducer } from 'react-router-redux';

import ducks from './ducks';

export default combineReducers({
  ...ducks,
  router: routerReducer,
});
