import { request, selectors, setFilter } from 'ducks/perspective';
import enhance from 'pages/utils';
import { shallowEqual } from 'recompose';
import getParams from './utils';

import Component from './component';
import saga from './saga';

function init({ location }) {
  return request(getParams(location));
}

function submitFilter(value) {
  return setFilter(value);
}

export default enhance({
  props(state) {
    return {
      perspective: selectors.getPerspective(state),
    };
  },
  actions: { submitFilter },
  updateWhen({ perspective: np }, { perspective: op }) {
    return !shallowEqual(np, op);
  },
  init,
  saga,
})(Component);
