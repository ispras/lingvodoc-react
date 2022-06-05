import React, { useContext } from "react";
import { Container, Label, Segment } from "semantic-ui-react";
import { fromJS, Map } from "immutable";
import PropTypes from "prop-types";

import BackTopButton from "components/BackTopButton";
import { getScrollContainer } from "components/Home/common";
import AllDicts from "components/Home/components/AllDicts";
import TranslationContext from "Layout/TranslationContext";
import { buildLanguageTree } from "pages/Search/treeBuilder";

import "components/Home/published.scss";
import "./styles.scss";

const SelectorDict = props => {
  const getTranslation = useContext(TranslationContext);

  const { languages, dictionaries, perspectives, isAuthenticated } = props;

  const localDictionaries = dictionaries;
  const languagesTree = buildLanguageTree(fromJS(languages));

  if (languagesTree.size <= 0) {
    return null;
  }

  const dictsSource = fromJS(dictionaries);
  const localDicts = fromJS(localDictionaries);
  const isDownloaded = dict => !!localDicts.find(d => d.get("id").equals(dict.get("id")));

  const dicts = dictsSource.reduce(
    (acc, dict) => acc.set(dict.get("id"), dict.set("isDownloaded", isDownloaded(dict))),
    new Map()
  );

  const perspectivesList = fromJS(perspectives).map(perspective =>
    fromJS({
      ...perspective.toJS()
    })
  );

  const scrollContainer = getScrollContainer();

  return (
    <div className="distanceMapPage">
      <div className="background-header">
        <Container className="published">
          <h1 className="page-title"> {getTranslation("Select a dictionary for analysis")}</h1>
        </Container>
      </div>

      <Container className="published">
        <AllDicts
          languagesTree={languagesTree}
          dictionaries={dicts}
          dictionariesAll={dictionaries}
          isAuthenticated={isAuthenticated}
          perspectives={perspectivesList}
          selectorMode
        />
        <BackTopButton scrollContainer={scrollContainer} />
      </Container>
    </div>
  );
};

SelectorDict.defaultProps = {
  isAuthenticated: false
};
SelectorDict.propTypes = {
  perspectives: PropTypes.array.isRequired,
  languages: PropTypes.array.isRequired,
  isAuthenticated: PropTypes.bool,
  dictionaries: PropTypes.array.isRequired
};

export default SelectorDict;
