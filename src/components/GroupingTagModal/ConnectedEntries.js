import React from "react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { pure } from "recompose";

import buildPartialLanguageTree from "./partialTree";
import Tree from "./Tree";

const ConnectedLexicalEntries = props => {
  const { allLanguages, allDictionaries, allPerspectives, connectedWords, mode, entitiesMode } = props;

  if (!connectedWords || connectedWords.lexical_entries.length === 0) {
    return <span>{getTranslation("No entries")}</span>;
  }

  const resultsTree = buildPartialLanguageTree({
    lexicalEntries: connectedWords.lexical_entries,
    allLanguages,
    allDictionaries,
    allPerspectives
  });

  return <Tree resultsTree={resultsTree} entitiesMode={entitiesMode} mode={mode} />;
};

ConnectedLexicalEntries.propTypes = {
  entitiesMode: PropTypes.string,
  mode: PropTypes.string,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  connectedWords: PropTypes.object
};

export default pure(ConnectedLexicalEntries);
