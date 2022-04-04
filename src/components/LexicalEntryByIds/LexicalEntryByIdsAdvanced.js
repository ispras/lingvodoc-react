import { shallowEqual } from "recompose";

import { request, selectors, setFilter } from "ducks/perspective";
import enhance from "pages/utils";

import saga from "../../pages/Perspective/saga";

import Component from "./component";
import { getParams } from "./utils";

function init(props) {
  return request(getParams(props));
}

function submitFilter(value) {
  return setFilter(value);
}

export default enhance({
  props(state) {
    return {
      perspective: selectors.getPerspective(state)
    };
  },
  actions: {
    submitFilter
  },
  updateWhen({ perspective: np }, { perspective: op }) {
    return !shallowEqual(np, op);
  },
  init,
  saga
})(Component);
