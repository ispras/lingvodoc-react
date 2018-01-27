import { request, selectors, setFilter } from 'ducks/perspective';
import { openModal } from 'ducks/phonology';
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

function openPhonologyModal(perspectiveId) {
  return openModal(perspectiveId);
}

export default enhance({
  props(state) {
    return {
      perspective: selectors.getPerspective(state),
    };
  },
  actions: { submitFilter, openPhonologyModal },
  updateWhen({ perspective: np }, { perspective: op }) {
    return !shallowEqual(np, op);
  },
  init,
  saga,
})(Component);
