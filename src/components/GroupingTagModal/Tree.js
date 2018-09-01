import React from 'react';
import PropTypes from 'prop-types';
import { pure } from 'recompose';
import SortableTree, { map } from 'react-sortable-tree';
import { LexicalEntryModal } from 'components/Search/LanguageTree';

class Tree extends React.Component {
  constructor(props) {
    super(props);


    this.state = {
      treeData: map({
        treeData: props.resultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: true }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
  }

  generateNodeProps({ node }) {
    const { actions, mode } = this.props;
    const defaultTitle = node.translation || 'None';
    const title =
      node.type === 'perspective' ? (
        <LexicalEntryModal node={node} actions={actions} entitiesMode={mode} />
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
  mode: PropTypes.string,
};

Tree.defaultProps = {
  actions: [],
  mode: 'all',
};

export default pure(Tree);
