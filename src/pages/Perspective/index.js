import { request, selectors } from 'ducks/perspective';

import enhance from 'pages/utils';

import Component from './component';
import saga from './saga';

function init({ match }) {
  return request(match.params);
}

export default enhance({
  props(state, props) {
    return {
      perspective: selectors.getPerspective(state, props.match.params),
    };
  },
  updateWhen() {
    return true;
  },
  init,
  saga,
})(Component);
