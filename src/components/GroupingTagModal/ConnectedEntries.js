import React, { useContext } from "react";
import PropTypes from "prop-types";
import { pure } from "recompose";

import TranslationContext from "Layout/TranslationContext";

import buildPartialLanguageTree from "./partialTree";
import Tree from "./Tree";

const ConnectedLexicalEntries = props => {
  const { allLanguages, allDictionaries, allPerspectives, connectedWords, mode, entitiesMode } = props;

  const getTranslation = useContext(TranslationContext);

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
