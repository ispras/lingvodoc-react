import React from "react";
import { useLocation } from "react-router-dom";
import { openModal as cognateAnalysisOpenModal } from "ducks/cognateAnalysis";
import { matchPath } from "react-router-dom";
import { compose } from "recompose";
import { connect } from "react-redux";

function getSugg(location) {
  const match = matchPath(
    {
      path: "/suggestions/:sugg"
    },
    location.path
  );
  return match && match.params && match.params.sugg;
}

const ViewSuggestions = ({ cognateAnalysisOpenModal }) => {
  const location = useLocation();
  cognateAnalysisOpenModal(null, "view_suggestions", getSugg(location));
  return null;
};

const ViewSuggestionsWrapper = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ cognateAnalysisOpenModal }, dispatch)
  }))
)(ViewSuggestions);

export default ViewSuggestionsWrapper;
