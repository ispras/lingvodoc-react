import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Button } from 'semantic-ui-react';
import { connectedQuery } from './graphql';
import Tree from './Tree';
import buildPartialLanguageTree from './partialTree';

const ConnectedLexicalEntries = (props) => {
  const {
    leaveGroup,
    data: { loading, error, connected_words: connectedWords },
    allLanguages,
    allDictionaries,
    allPerspectives,
  } = props;

  if (error || loading) {
    return null;
  }

  const { lexical_entries: lexicalEntries } = connectedWords;

  if (lexicalEntries.length === 0) {
    return <span>No entries</span>;
  }

  const resultsTree = buildPartialLanguageTree({
    lexicalEntries,
    allLanguages,
    allDictionaries,
    allPerspectives,
  });

  return <Tree resultsTree={resultsTree} />;
};

ConnectedLexicalEntries.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    connected_words: PropTypes.object,
  }).isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  leaveGroup: PropTypes.func.isRequired,
};

export default compose(graphql(connectedQuery), pure)(ConnectedLexicalEntries);
