import { is } from 'immutable';

import { requestPublished, selectors } from 'ducks/data';

import enhance from 'pages/utils';

import Component from './component';
import saga from './saga';

export default enhance({
  props(state) {
    return {
      languages: selectors.getDictionaries(state),
      loading: selectors.getLoading(state),
      perspectives: selectors.getPerspectives(state),
    };
  },
  updateWhen({ perspectives: op, loading: ol }, { perspectives: np, loading: nl }) {
    return !is(op, np) || ol !== nl;
  },
  init: requestPublished,
  saga,
})(Component);
