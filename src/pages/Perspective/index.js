import { request, selectors, setFilter } from 'ducks/perspective';

import enhance from 'pages/utils';

import Component from './component';
import saga from './saga';

function init({ match }) {
  return request(match.params);
}

function submitFilter(value) {
  return setFilter(value);
}

export default enhance({
  props(state, props) {
    return {
      perspective: selectors.getPerspective(state, props.match.params),
    };
  },
  actions: { submitFilter },
  updateWhen() {
    return true;
  },
  init,
  saga,
})(Component);
