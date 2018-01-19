import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import Tree from './Tree';

function AllDicts(props) {
  const {
    languagesTree, dictionaries, perspectives, canSelectDictionaries,
  } = props;
  const tree = assignDictsToTree(
    buildDictTrees(fromJS({
      lexical_entries: [],
      perspectives,
      dictionaries,
    })),
    languagesTree
  );

  return (
    <div>
      <Tree tree={tree} canSelectDictionaries={canSelectDictionaries} />
    </div>
  );
}

AllDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  canSelectDictionaries: PropTypes.bool,
};

AllDicts.defaultProps = {
  canSelectDictionaries: false,
};

export default AllDicts;
