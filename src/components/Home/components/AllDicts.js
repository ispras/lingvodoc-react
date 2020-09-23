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
    dictionariesAll,
    /*     selectedDict, */
    /*     languagesGroup, */
    statusLangsNav,
    allField
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
        languagesTree={languagesTree}
        dictionaries={dictionaries}
        perspectives={perspectives}
        canSelectDictionaries={isAuthenticated}
        selectorMode={selectorMode}
        allField={allField}
        dictionariesAll={dictionariesAll}
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
  selectedDict: PropTypes.func,
  languagesGroup: PropTypes.func,
  statusLangsNav: PropTypes.bool

};

AllDicts.defaultProps = {
  isAuthenticated: false,
  languagesGroup: null,
  selectedDict: null,
  selectorMode: false,
  statusLangsNav: true
};

export default AllDicts;
