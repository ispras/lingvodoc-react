import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql } from 'react-apollo';
import Immutable, { fromJS, List, Map } from 'immutable';
import { Container } from 'semantic-ui-react';
import LanguageTree from 'components/Tree';
import { buildLanguageTree, assignDictsToTree } from 'pages/Search/treeBuilder';

const q = gql`
  query DictionaryWithPerspectives {
    dictionaries {
      id
      parent_id
      translation
      additional_metadata {
        authors
      }
      perspectives {
        id
        translation
      }
    }
    grants {
      id
      translation
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
  }
`;

function generateNodeProps({ node, path }) {
  switch (node.type) {
    case 'language':
      return {
        title: node.translation,
      };
    default:
      return {
        title: 'TODO',
      };
  }
}

const Component = (props) => {
  const { data: { loading, error, dictionaries, grants, language_tree: allLanguages } } = props;
  if (loading || error) {
    return null;
  }

  const languages = Immutable.fromJS(allLanguages);
  const languagesTree = buildLanguageTree(languages);

  const DICTS = fromJS(dictionaries).reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map());
  const trees = fromJS(grants).map((grant) => {
    const dictIds = grant.getIn(['additional_metadata', 'participant']) || new List();
    const dicts = dictIds.map(id => DICTS.get(id));
    return assignDictsToTree(dicts, languagesTree);
  });

  return (
    <Container className="published">
      {trees.map(tree => <LanguageTree expanded data={tree} generateNodeProps={generateNodeProps} />)}
    </Container>
  );
};

export default compose(graphql(q))(Component);
