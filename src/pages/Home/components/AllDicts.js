import React from 'react';
import PropTypes from 'prop-types';
import Immutable, { fromJS } from 'immutable';
import { assignDictsToTree, buildDictTrees } from 'pages/Search/treeBuilder';
import LangsNav from 'pages/Home/components/LangsNav';
import Tree from './Tree';


function AllDicts(props) {
  const {
    languagesTree,
    dictionaries,
    perspectives,
    isAuthenticated,
    selectorMode,
    selectedDict,
    languagesGroup,
    statusLangsNav
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
      <Tree tree={tree} canSelectDictionaries={isAuthenticated} selectorMode={selectorMode} selectedDict={selectedDict} languagesGroup={languagesGroup} />
    </div>
  );
}

AllDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  selectorMode: PropTypes.bool.isRequired,
  selectedDict: PropTypes.func.isRequired,
  languagesGroup: PropTypes.func.isRequired,
  statusLangsNav: PropTypes.bool.isRequired

};

AllDicts.defaultProps = {
  isAuthenticated: false,
};

export default AllDicts;
