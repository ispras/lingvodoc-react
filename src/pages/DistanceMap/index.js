import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Label } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import Placeholder from "components/Placeholder";
import { setCheckStateTreeFlat, setDataForTree, setDefaultGroup, setMainGroupLanguages } from "ducks/distanceMap";

import checkCoordAndLexicalEntries from "./checkCoordinatesAndLexicalEntries";
import { allFieldQuery, dictionaryWithPerspectivesQuery } from "./graphql";
import SelectorDictionary from "./selectorDictionary";

import "./styles.scss";

const DistanceMap = ({
  dataForTree,
  dictionaryWithPerspectives,
  allField,
  actions,
  selected,
  mainGroupDictionaresAndLanguages,
  user
}) => {
  if (!user || user.id !== 1) {
    return (
      <div style={{ marginTop: "1em" }}>
        <Label>
          {getTranslation("For the time being Distance Map functionality is available only for the administrator.")}
        </Label>
      </div>
    );
  }

  const {
    language_tree: languageTree,
    dictionaries,
    loading,
    perspectives,
    is_authenticated: isAuthenticated
  } = dictionaryWithPerspectives;

  if (loading && !dataForTree.dictionaries) {
    return <Placeholder />;
  }

  useEffect(() => {
    if (!dataForTree.dictionaries) {
      actions.setDataForTree({
        ...dictionaryWithPerspectives,
        allField: allField.all_fields,
        id: selected.id
      });
    }
  }, []);

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

  useEffect(() => {
    if (mainGroupDictionaresAndLanguages.length !== 0) {
      actions.setMainGroupLanguages({});
      actions.setCheckStateTreeFlat({});
    }
  }, []);

  const newDictionaries = checkCoordAndLexicalEntries(dictionaries || dataForTree.dictionaries);
  const newLanguagesTree = languageTree || dataForTree.languageTree;
  const fileredLanguageTree = newLanguagesTree.map(lang => ({
    ...lang,
    dictionaries: checkCoordAndLexicalEntries(lang.dictionaries)
  }));

  return (
    <div>
      <SelectorDictionary
        languageTree={fileredLanguageTree}
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
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    loading: PropTypes.bool
  }),
  allField: PropTypes.object,
  actions: PropTypes.object.isRequired,
  dataForTree: PropTypes.object.isRequired,
  selected: PropTypes.object.isRequired,
  mainGroupDictionaresAndLanguages: PropTypes.object.isRequired
};

export default compose(
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
  connect(state => state.user),
  graphql(dictionaryWithPerspectivesQuery, { name: "dictionaryWithPerspectives", skip: props => props.user.id !== 1 }),
  graphql(allFieldQuery, { name: "allField", skip: props => props.user.id !== 1 })
)(DistanceMap);
