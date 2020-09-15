import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import Immutable, { fromJS, Map } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import { Segment, Header, List } from 'semantic-ui-react';
import { compositeIdToString as id2str } from 'utils/compositeId';
import Tree from 'components/Home/components/Tree';

const grantId = id => `grant_entry_${id}`;

function GrantedDicts(props) {
  const {
    languagesTree, dictionaries, perspectives, grants, isAuthenticated,
  } = props;

  const dicts = fromJS(dictionaries)
    .reduce((acc, dict) => acc.set(dict.get('id'), dict), new Map());

    // build grant trees
  const trees = grants.map((grant) => {
    // list of dictionary ids involved in this grant
    const dictIds = grant.getIn(['additional_metadata', 'participant']) || new Immutable.List();

    const pickedDicts = dictIds.map(id => dicts.get(id)).filter(d => !!d);

    return {
      id: grant.get('id'),
      title: grant.get('translation'),
      issuer: grant.get('issuer'),
      number: grant.get('grant_number'),
      tree: assignDictsToTree(
        buildDictTrees(fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries: pickedDicts,
        })),
        languagesTree
      ),
    };
  }).filter(t => t.tree.size > 0);


  const arrayIdsGrants = [];
  grants.forEach((grant) => {
    grant.getIn(['additional_metadata', 'participant']).toJS().forEach((id) => {
      arrayIdsGrants.push(id2str(id));
    });
  });


  const test = dictionaries.filter((dict) => {
    const dictId = dict.getIn(['id']) || new Immutable.List();
    return !arrayIdsGrants.some(el =>
      el === id2str(dictId.toJS()));
  });



        const treeNoGrants = assignDictsToTree(
            buildDictTrees(fromJS({
              lexical_entries: [],
              perspectives,
              dictionaries: test.toList(),
            })),
            languagesTree
          );
  console.log('treeNoGrants', treeNoGrants);
  console.log('trees', trees);

  return (
    <div>
      <Segment>
      {/*   {trees.map(({
                    id, title, issuer, number, tree,
                }) => (
                  <div id={grantId(id)} key={id} className="grant">
                    <Header>
                      {title} ({issuer} {number})
                    </Header>
                    <Tree tree={tree} canSelectDictionaries={isAuthenticated} />
                  </div>
                    ))} */}
                    <Tree tree={treeNoGrants} canSelectDictionaries={isAuthenticated} />
      </Segment>
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
