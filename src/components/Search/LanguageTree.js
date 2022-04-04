import React from "react";
import { connect } from "react-redux";
import SortableTree, { map } from "react-sortable-tree";
import PropTypes from "prop-types";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import LexicalEntryModal from "components/LexicalEntryModal";
import { openModal } from "ducks/modals";

const Link = styled.a`
  cursor: pointer;
  color: #2185d0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

const LexicalEntryLinkComponent = ({ node, actions, entitiesMode, defaultMode, openModalAction, onlyViewMode }) => {
  const { translation, lexicalEntries } = node;
  return (
    <Link
      onClick={() => openModalAction(LexicalEntryModal, { node, actions, entitiesMode, defaultMode, onlyViewMode })}
    >
      {translation}: {lexicalEntries.length} result(s)
    </Link>
  );
};

LexicalEntryLinkComponent.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  defaultMode: PropTypes.string,
  onlyViewMode: PropTypes.bool,
  openModalAction: PropTypes.func.isRequired
};

LexicalEntryLinkComponent.defaultProps = {
  actions: [],
  entitiesMode: "published",
  defaultMode: "view",
  onlyViewMode: false
};

const mapDispatchToProps = dispatch => bindActionCreators({ openModalAction: openModal }, dispatch);

export const LexicalEntryLink = connect(null, mapDispatchToProps)(LexicalEntryLinkComponent);

class LanguageTree extends React.Component {
  static generateNodeProps({ node }) {
    const { translation } = node;
    const defaultTitle = translation || "None";

    const title = node.type === "perspective" ? <LexicalEntryLink node={node} /> : defaultTitle;
    return { title };
  }

  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.searchResultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: !!props.expanded }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false
      })
    };
  }

  render() {
    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          rowHeight={42}
          scaffoldBlockPxWidth={32}
          treeData={this.state.treeData}
          generateNodeProps={LanguageTree.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
  }
}

LanguageTree.propTypes = {
  searchResultsTree: PropTypes.shape({
    toJS: PropTypes.func.isRequired
  }).isRequired,
  expanded: PropTypes.bool
};

LanguageTree.defaultProps = {
  expanded: false
};

export default LanguageTree;
