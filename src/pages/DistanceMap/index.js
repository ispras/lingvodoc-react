import React, { useContext, useEffect } from "react";
import { connect } from "react-redux";
import { Label } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import Placeholder from "components/Placeholder";
import { setCheckStateTreeFlat, setDataForTree, setDefaultGroup, setMainGroupLanguages } from "ducks/distanceMap";
import TranslationContext from "Layout/TranslationContext";

import checkCoordAndLexicalEntries from "./checkCoordinatesAndLexicalEntries";
import { allFieldQuery, dictionaryWithPerspectivesQuery } from "./graphql";
import SelectorDictionary from "./selectorDictionary";
import { isAdmin } from "utils/isadmin";

import "./styles.scss";

const DistanceMap = ({
  dataForTree,
  dictionaryWithPerspectives,
  allField,
  actions,
  selected,
  mainGroupDictionaresAndLanguages
}) => {
  const {
    languages,
    dictionaries,
    loading,
    perspectives,
    is_authenticated: isAuthenticated
  } = dictionaryWithPerspectives;

  useEffect(() => {
    if (!loading && !allField.loading && !dataForTree.dictionaries) {
      actions.setDataForTree({
        ...dictionaryWithPerspectives,
        allField: allField.all_fields,
        id: selected.id
      });
    }
  }, [loading, allField.loading, dataForTree.dictionaries]);

  useEffect(() => {
    if (mainGroupDictionaresAndLanguages.length !== 0) {
      actions.setMainGroupLanguages({});
      actions.setCheckStateTreeFlat({});
    }
  }, []);

  if (loading || allField.loading || !dataForTree.dictionaries) {
    return <Placeholder />;
  }

  if (selected.id !== dataForTree.idLocale) {
    if (!dictionaries) {
      actions.setDataForTree({
        ...dictionaryWithPerspectives,
        allField: allField.all_fields,
        id: selected.id
      });
      return <Placeholder />;
    }
  }

  const newDictionaries = checkCoordAndLexicalEntries(dictionaries || dataForTree.dictionaries);
  const newLanguages = languages || dataForTree.languages;
  const filteredLanguages = newLanguages.map(lang => ({
    ...lang,
    dictionaries: checkCoordAndLexicalEntries(lang.dictionaries)
  }));

  return (
    <div>
      <SelectorDictionary
        languages={filteredLanguages}
        dictionaries={newDictionaries}
        perspectives={perspectives || dataForTree.perspectives}
        isAuthenticated={isAuthenticated}
        allField={allField.all_fields || dataForTree.allField}
      />
    </div>
  );
};

DistanceMap.propTypes = {
  dictionaryWithPerspectives: PropTypes.shape({
    languages: PropTypes.array,
    dictionaries: PropTypes.array,
    loading: PropTypes.bool
  }),
  allField: PropTypes.object,
  actions: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  mainGroupDictionaresAndLanguages: PropTypes.object.isRequired
};

const DistanceMapC = compose(
  connect(
    state => state.distanceMap,
    dispatch => ({
      actions: bindActionCreators(
        {
          setDataForTree,
          setDefaultGroup,
          setMainGroupLanguages,
          setCheckStateTreeFlat
        },
        dispatch
      )
    })
  ),
  connect(state => state.locale),
  graphql(dictionaryWithPerspectivesQuery, { name: "dictionaryWithPerspectives" }),
  graphql(allFieldQuery, { name: "allField" })
)(DistanceMap);

const Wrapper = ({ user }) => {
  const getTranslation = useContext(TranslationContext);

  if (!user || !isAdmin(user.id)) {
    return (
      <div style={{ marginTop: "1em" }}>
        <Label>
          {getTranslation("For the time being Distance Map functionality is available only for the administrator.")}
        </Label>
      </div>
    );
  }

  return <DistanceMapC />;
};

export default connect(state => state.user)(Wrapper);
