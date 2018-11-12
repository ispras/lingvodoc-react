import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';
import SortableTree, { map } from 'react-sortable-tree';
import { openModal } from 'ducks/modals';
import LexicalEntryModal from 'components/LexicalEntryModal';

const Link = styled.a`
  cursor: pointer;
  color: #2185d0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

const LexicalEntryLinkComponent = ({
  node, actions, entitiesMode, mode, openModal,
}) => {
  const { translation, lexicalEntries } = node;
  return (
    <Link onClick={() => openModal(LexicalEntryModal, { node, actions, entitiesMode, mode })}>
      {translation}: {lexicalEntries.length} result(s)
    </Link>
  );
};

LexicalEntryLinkComponent.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired,
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  mode: PropTypes.string,
  openModal: PropTypes.func.isRequired,
};

LexicalEntryLinkComponent.defaultProps = {
  actions: [],
  entitiesMode: 'published',
};

const mapDispatchToProps = dispatch => bindActionCreators({ openModal }, dispatch);

export const LexicalEntryLink = connect(
  null,
  mapDispatchToProps
)(LexicalEntryLinkComponent);

class LanguageTree extends React.Component {

  static generateNodeProps({ node }) {
    const { translation } = node;
    const defaultTitle = translation || 'None';

    const title = node.type === 'perspective' ? <LexicalEntryLink node={node} /> : defaultTitle;
    return { title };
  }

  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.searchResultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: !!props.expanded }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
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
    toJS: PropTypes.func.isRequired,
  }).isRequired,
  expanded: PropTypes.bool,
};

LanguageTree.defaultProps = {
  expanded: false,
};

export default LanguageTree;
