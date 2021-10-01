import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'components/Home/components/LangsNav';
import { compositeIdToString as id2str } from 'utils/compositeId';
import Tree from 'components/Home/components/Tree';
import { Container } from 'semantic-ui-react';

function TreeWithoutGrants(props) {
  const {
    languagesTree, dictionaries, perspectives, grants, isAuthenticated,
  } = props;

  const arrayIdsGrants = [];
  grants.forEach((grant) => {
    grant.getIn(['additional_metadata', 'participant']).toJS().forEach((id) => {
      arrayIdsGrants.push(id2str(id));
    });
  });


  const dictionariesWithoutGrants = dictionaries.filter((dict) => {
    const dictId = dict.getIn(['id']) || new Immutable.List();
    return !arrayIdsGrants.some(el =>
      el === id2str(dictId.toJS()));
  });


  const treeNoGrants = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries: dictionariesWithoutGrants.toList(),
    })),
    languagesTree
  );


  return (
    <div>
      <LangsNav data={treeNoGrants} />
      <Container className="container-gray">
        <Tree tree={treeNoGrants} canSelectDictionaries={isAuthenticated} />
      </Container>
    </div>
  );
}

TreeWithoutGrants.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  grants: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
};

TreeWithoutGrants.defaultProps = {
  isAuthenticated: false,
};

export default TreeWithoutGrants;
