import { request, selectors, setFilter } from 'ducks/perspective';
import enhance from 'pages/utils';

import { getPage } from 'utils/getParams';

import Component from './component';
import saga from './saga';

function init({ match, location }) {
  return request({
    ...match.params,
    page: getPage(location),
  });
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
