import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';

import Tree from './Tree';

function restDictionaries(dicts, grants) {
  const grantedDicts = grants
    .flatMap(grant => grant.getIn(['additional_metadata', 'participant']) || new Immutable.List())
    .toSet();
  return dicts.reduce((acc, dict, id) => (grantedDicts.has(id) ? acc : acc.push(dict)), new Immutable.List());
}

function GrantedDicts(props) {
  const {
    languagesTree, dictionaries, perspectives, grants, selected,
  } = props;

  const dicts = fromJS(dictionaries)
    .reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map())
    .map((d, id) => d.set('selected', !!selected.get(id) || false));

  // build grant trees
  const trees = grants.map((grant) => {
    // list of dictionary ids involved in this grant
    const dictIds = grant.getIn(['additional_metadata', 'participant']) || new Immutable.List();
    const pickedDicts = dictIds.map(id => dicts.get(id));
    return {
      id: grant.get('id'),
      text: grant.get('translation'),
      tree: assignDictsToTree(
        buildDictTrees(fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries: pickedDicts,
        })),
        languagesTree
      ),
    };
  });

  // build tree of dictionaries not included in grants
  const restTree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: restDictionaries(dicts, grants),
    })),
    languagesTree
  );

  return (
    <div>
      <div>
        {trees.map(({ id, text, tree }) => (
          <div key={id} className="grant">
            <div className="grant-title">{text}</div>
            <Tree tree={tree} />
          </div>
        ))}
      </div>
      <div className="grant">
        <div className="grant-title">Индивидуальная работа</div>
        <Tree tree={restTree} />
      </div>
    </div>
  );
}

GrantedDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  grants: PropTypes.instanceOf(Immutable.List).isRequired,
  selected: PropTypes.instanceOf(Immutable.Set).isRequired,
};

export default GrantedDicts;
