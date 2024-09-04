import React from "react";
import { useLocation } from "react-router-dom";
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

function submitFilter(value, isCaseSens, isRegexp) {
  return setFilter({value, isCaseSens, isRegexp});
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

const EnhancedComponent = enhance({
  props(state) {
    return {
      perspective: selectors.getPerspective(state)
    };
  },
  actions: {
    init,
    submitFilter,
    openCognateAnalysisModal,
    openPhonemicAnalysisModal,
    openPhonologyModal
  },
  updateWhen({ perspective: np, location: nl }, { perspective: op, location: ol }) {
    return nl.pathname !== ol.pathname || nl.search !== ol.search || !shallowEqual(np, op);
  },
  init,
  saga
})(Component);

const Wrapper = props => {
  const location = useLocation();
  return <EnhancedComponent {...props} location={location} />;
};

export default Wrapper;
