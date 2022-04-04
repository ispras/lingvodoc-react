import React from "react";
import { Container } from "semantic-ui-react";
import Immutable, { fromJS } from "immutable";
import PropTypes from "prop-types";

import LangsNav from "components/Home/components/LangsNav";
import { assignDictsToTree, buildDictTrees } from "pages/Search/treeBuilder";

import Tree from "./Tree";

function AllDicts(props) {
  const { languagesTree, dictionaries, perspectives, isAuthenticated, selectorMode } = props;

  const tree = assignDictsToTree(
    buildDictTrees(
      fromJS({
        lexical_entries: [],
        perspectives,
        dictionaries
      })
    ),
    languagesTree
  );

  return (
    <div>
      <LangsNav data={tree} />

      <Container className="container-gray">
        <Tree tree={tree} canSelectDictionaries={isAuthenticated} selectorMode={selectorMode} />
      </Container>
    </div>
  );
}

AllDicts.propTypes = {
  languagesTree: PropTypes.instanceOf(Immutable.List).isRequired,
  dictionaries: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  isAuthenticated: PropTypes.bool,
  selectorMode: PropTypes.bool
};

AllDicts.defaultProps = {
  isAuthenticated: false,
  selectorMode: false
};

export default AllDicts;
