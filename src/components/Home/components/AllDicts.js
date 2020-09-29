import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'components/Home/components/LangsNav';
import Tree from './Tree';


function AllDicts(props) {
  const {
    languagesTree,
    dictionaries,
    perspectives,
    isAuthenticated,
    selectorMode,
    statusLangsNav,
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
      {(statusLangsNav) && (<LangsNav data={tree} />)}
      <Tree
        tree={tree}
        canSelectDictionaries={isAuthenticated}
        selectorMode={selectorMode}
      />
    </div>
  );
}

AllDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  selectorMode: PropTypes.bool,
  statusLangsNav: PropTypes.bool

};

AllDicts.defaultProps = {
  isAuthenticated: false,
  selectorMode: false,
  statusLangsNav: true
};

export default AllDicts;
