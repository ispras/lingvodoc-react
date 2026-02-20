import React, { useState, useContext } from "react";
import SortableTree, { map } from "react-sortable-tree";
import PropTypes from "prop-types";
import { pure } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import { LexicalEntryLink } from "components/Search/LanguageTree";
import TranslationContext from "Layout/TranslationContext";

const Tree = ({ actions, entitiesMode, mode, resultsTree }) => {
  const getTranslation = useContext(TranslationContext);

  const [treeData, setTreeData] = useState(
    map({
      treeData: resultsTree.toJS(),
      callback: ({ node }) => ({ ...node, expanded: true }),
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: false
    })
  );

  const generateNodeProps = ({ node }) => {
    const defaultTitle = T(node.translations) || getTranslation("None");
    const onlyViewMode = true;
    const title =
      node.type === "perspective" ? (
        <LexicalEntryLink
          node={node}
          actions={actions}
          entitiesMode={entitiesMode}
          mode={mode}
          onlyViewMode={onlyViewMode}
        />
      ) : (
        defaultTitle
      );

    return { title };
  };

  return (
    <div style={{ height: 600 }}>
      <SortableTree
        canDrag={false}
        treeData={treeData}
        rowHeight={52}
        scaffoldBlockPxWidth={64}
        generateNodeProps={generateNodeProps}
        onChange={treeData => setTreeData(treeData)}
        className="lingvo-rst-tree"
      />
    </div>
  );
};

Tree.propTypes = {
  resultsTree: PropTypes.object.isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  mode: PropTypes.string
};

Tree.defaultProps = {
  actions: [],
  entitiesMode: "all",
  mode: "view"
};

export default pure(Tree);
