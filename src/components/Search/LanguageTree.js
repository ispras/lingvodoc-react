import React from "react";
import { connect } from "react-redux";
import SortableTree, { map } from "react-sortable-tree";
import PropTypes from "prop-types";
import { pure } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import LexicalEntryModal from "components/LexicalEntryModal";
import { openModal } from "ducks/modals";

const Link = styled.a`
  cursor: pointer;
`;

const LexicalEntryLinkComponent = ({ node, actions, entitiesMode, defaultMode, openModalAction, onlyViewMode }) => {
  const { translations, lexicalEntries } = node;
  return (
    <Link
      onClick={() => openModalAction(LexicalEntryModal, { node, actions, entitiesMode, defaultMode, onlyViewMode })}
    >
      {`${T(translations)}: ${lexicalEntries.length} result(s)`}
    </Link>
  );
};

LexicalEntryLinkComponent.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translations: PropTypes.object.isRequired,
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

const PerspectiveLink = ({ node }) => {
  return (
    <a href={`/dictionary/${node.parent_id.join("/")}/perspective/${node.id.join("/")}`}>{T(node.translations)}</a>
  );
};

class LanguageTree extends React.Component {
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

    this.generateNodeProps = this.props.onlyPerspectives
      ? this.generateNodePropsOnlyPerspectives.bind(this)
      : this.generateNodePropsWithEntries.bind(this);
  }

  generateNodePropsWithEntries({ node }) {
    const { translations } = node;
    const defaultTitle = translations ? T(translations) : "None";

    const title = node.type === "perspective" ? <LexicalEntryLink node={node} /> : defaultTitle;
    return { title };
  }

  generateNodePropsOnlyPerspectives({ node }) {
    const { translations } = node;
    const defaultTitle = translations ? T(translations) : "None";

    const title = node.type === "perspective" ? <PerspectiveLink node={node} /> : defaultTitle;
    return { title };
  }

  render() {
    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          rowHeight={52}
          scaffoldBlockPxWidth={64}
          treeData={this.state.treeData}
          generateNodeProps={this.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
          className="lingvo-rst-tree"
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

export default pure(LanguageTree);
