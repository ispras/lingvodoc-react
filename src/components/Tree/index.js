import React from 'react';
import SortableTree, { map } from 'react-sortable-tree';

function stateFromProps({ data, expanded }) {
  return {
    tree: map({
      treeData: data.toJS(),
      callback: ({ node }) => ({ ...node, expanded: !!expanded }),
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: false,
    }),
  };
}

class LanguageTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = stateFromProps(props);
  }

  componentWillReceiveProps(nextProps) {
    this.setState(stateFromProps(nextProps));
  }

  render() {
    return (
      <SortableTree
        canDrag={false}
        rowHeight={42}
        scaffoldBlockPxWidth={32}
        treeData={this.state.tree}
        onChange={tree => this.setState({ tree })}
        generateNodeProps={this.props.generateNodeProps}
      />
    );
  }
}

export default LanguageTree;
