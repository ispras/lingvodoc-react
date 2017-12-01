import React from 'react';
import SortableTree, { map } from 'react-sortable-tree';

class LanguageTree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.data.toJS(),
        callback: ({ node }) => ({ ...node, expanded: !!props.expanded }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    };
  }

  generateNodeProps({ node, path }) {
    switch (node.type) {
      case 'entity':
        return {
          subtitle: ' Entity',
          title: <i>{node.content}</i>,
        };
      default:
        return {
          title: node.translation || 'None',
        };
    }
  }

  render() {
    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          rowHeight={42}
          scaffoldBlockPxWidth={32}
          treeData={this.state.treeData}
          onChange={treeData => this.setState({ treeData })}
          generateNodeProps={this.generateNodeProps}
        />
      </div>
    );
  }
}

export default LanguageTree;
