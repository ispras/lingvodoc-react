import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { Container, Segment, Header, List } from 'semantic-ui-react';

import { getTranslation } from 'api/i18n';
import Tree from './Tree';

const grantId = id => `grant_entry_${id}`;

function restDictionaries(dicts, grants) {
  const grantedDicts = grants
    .flatMap(grant => grant.getIn(['additional_metadata', 'participant']) || new Immutable.List())
    .toSet();
  return dicts.reduce((acc, dict, id) => (grantedDicts.has(id) ? acc : acc.push(dict)), new Immutable.List());
}

function GrantedDicts(props) {
  const {
    mode, languagesTree, dictionaries, perspectives, grants, isAuthenticated,
  } = props;

  const dicts = fromJS(dictionaries)
    .reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map());

  // build grant trees
  const trees = grants.map((grant) => {
    // list of dictionary ids involved in this grant
    const dictIds = grant.getIn(['additional_metadata', 'participant']) || new Immutable.List();
    const pickedDicts = dictIds.map(id => dicts.get(id)).filter(d => !!d);

    const result = {
      id: grant.get('id'),
      title: grant.get('translation'),
      tree: assignDictsToTree(
        buildDictTrees(fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries: pickedDicts,
        })),
        languagesTree
      ),
    };

    if (mode == 'grant')
    {
      result.issuer = grant.get('issuer');
      result.number = grant.get('grant_number');
    }

    return result;

  }).filter(t => t.tree.size > 0);


  // build tree of dictionaries not included in grants
  const restTree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: restDictionaries(dicts, grants),
    })),
    languagesTree
  );

  const navigateToGrant = (e, grant) => {
    e.preventDefault();
    document.getElementById(grantId(grant.id)).scrollIntoView();
  };

  return (
    <div>
      <Container className="container-gray">
        {mode == 'grant' && (
          <Header>{`${getTranslation('The work is supported by the following grants')}:`}</Header>)}
        <List ordered className="lingvo-list">
          {trees.map(grant => (
            <List.Item key={grant.id} as="a" onClick={e => navigateToGrant(e, grant)}>
              {grant.title + (mode == 'grant' ? ` (${grant.issuer} ${grant.number})` : '')}
            </List.Item>
          ))}
        </List>
      </Container>

      <Container className="container-gray">
        {trees.map(grant => (
          <div id={grantId(grant.id)} key={grant.id} className="grant">
            <Header>
              {grant.title + (mode == 'grant' ? `(${grant.issuer} ${grant.number})` : '')}
            </Header>
            <Tree tree={grant.tree} canSelectDictionaries={isAuthenticated} />
          </div>
        ))}
      </Container>

      <Container className="container-gray">
        <div className="grant">
          <div className="grant-title">{getTranslation('Индивидуальная работа')}</div>
          <Tree tree={restTree} canSelectDictionaries={isAuthenticated} />
        </div>
      </Container>
    </div>
  );
}

GrantedDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  grants: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

GrantedDicts.defaultProps = {
  isAuthenticated: false,
};

export default pure(GrantedDicts);
