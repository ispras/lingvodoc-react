import React from 'react';
import PropTypes from 'prop-types';
import SortableTree, { map } from 'react-sortable-tree';
import LexicalEntryModal from './LexicalEntryModal';

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
