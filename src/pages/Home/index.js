import React from 'react';
import { fromJS, List, Map } from 'immutable';
import { Container } from 'semantic-ui-react';

import LanguageTree from 'components/Tree';

import { languagesTree } from '../Search';
import { assignDictsToTree } from '../Search/treeBuilder';

const DICTS = fromJS(require('./dicts.json')).reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map());
const GRANTS = fromJS(require('./grants.json'));

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

export default function () {
  const trees = GRANTS
    .map((grant) => {
      const dictIds = grant.getIn(['additional_metadata', 'participant']) || new List();
      const dicts = dictIds.map(id => DICTS.get(id));
      return assignDictsToTree(dicts, languagesTree);
    });

  return (
    <Container className="published">
      {
        trees.map(tree =>
          <LanguageTree
            expanded
            data={tree}
            generateNodeProps={generateNodeProps}
          />
        )
      }
    </Container>
  );
}
