import React from "react";
import { useLocation } from "react-router-dom";
import { openModal as cognateAnalysisOpenModal } from "ducks/cognateAnalysis";
import { matchPath } from "react-router-dom";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import TopSectionSelector from "pages/TopSectionSelector";

function getSugg(location) {
  const match = matchPath(
    {
      path: "/suggestions/:sugg"
    },
    location.pathname
  );
  return match && match.params && match.params.sugg;
}

const ViewSuggestions = ({ actions }) => {
  const location = useLocation();
  actions.cognateAnalysisOpenModal(null, "view_suggestions", getSugg(location) || null);
  return <TopSectionSelector />;
};

export default connect(
  null,
  dispatch => ({
    actions: bindActionCreators({
      cognateAnalysisOpenModal,
    },
    dispatch)
  })
)(ViewSuggestions);
