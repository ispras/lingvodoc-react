import { shallowEqual } from "recompose";

import { openModal as cognateAnalysisOpenModal } from "ducks/cognateAnalysis";
import { request, selectors, setFilter } from "ducks/perspective";
import { openModal as phonemicAnalysisOpenModal } from "ducks/phonemicAnalysis";
import { openModal as phonologyOpenModal } from "ducks/phonology";
import enhance from "pages/utils";

import Component from "./component";
import saga from "./saga";
import getParams from "./utils";

function init({ location }) {
  return request(getParams(location));
}

function submitFilter(value) {
  return setFilter(value);
}

function openCognateAnalysisModal(perspectiveId, mode = "") {
  return cognateAnalysisOpenModal(perspectiveId, mode);
}

function openPhonemicAnalysisModal(perspectiveId) {
  return phonemicAnalysisOpenModal(perspectiveId);
}

function openPhonologyModal(perspectiveId, mode = "") {
  return phonologyOpenModal(perspectiveId, mode);
}

export default enhance({
  props(state) {
    return {
      perspective: selectors.getPerspective(state)
    };
  },
  actions: {
    submitFilter,
    openCognateAnalysisModal,
    openPhonemicAnalysisModal,
    openPhonologyModal
  },
  updateWhen({ perspective: np }, { perspective: op }) {
    return !shallowEqual(np, op);
  },
  init,
  saga
})(Component);
