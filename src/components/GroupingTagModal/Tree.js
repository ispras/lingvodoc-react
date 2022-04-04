import React from "react";
import SortableTree, { map } from "react-sortable-tree";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { pure } from "recompose";

import { LexicalEntryLink } from "components/Search/LanguageTree";

class Tree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.resultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: true }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false
      })
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
  }

  generateNodeProps({ node }) {
    const { actions, entitiesMode, mode } = this.props;
    const defaultTitle = node.translation || getTranslation("None");
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
  }

  render() {
    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          treeData={this.state.treeData}
          rowHeight={42}
          generateNodeProps={this.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
  }
}

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
