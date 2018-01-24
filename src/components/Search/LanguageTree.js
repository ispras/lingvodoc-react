import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';
import styled from 'styled-components';
import SortableTree, { map } from 'react-sortable-tree';
import { LexicalEntryViewByIds } from 'components/PerspectiveView/index';

const LexicalEntryLink = styled.span`
  cursor: pointer;
  color: #2185D0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

function LexicalEntryModal({ node }) {
  const { id, translation, lexicalEntries } = node;
  const trigger = <LexicalEntryLink>{translation}: {lexicalEntries.length} result(s)</LexicalEntryLink>;

  return (
    <Modal
      closeIcon
      size="fullscreen"
      trigger={trigger}
    >
      <Modal.Header>
        {translation}
      </Modal.Header>
      <Modal.Content scrolling>
        <LexicalEntryViewByIds
          className="perspective"
          perspectiveId={id}
          entriesIds={lexicalEntries.map(e => e.id)}
          mode="view"
          entitiesMode="published"
        />
      </Modal.Content>
    </Modal>
  );
}

LexicalEntryModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired,
  }).isRequired,
};

class LanguageTree extends React.Component {
  static generateNodeProps({ node }) {
    const defaultTitle = node.translation || 'None';
    const title = node.type === 'perspective' ? <LexicalEntryModal node={node} /> : defaultTitle;
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
