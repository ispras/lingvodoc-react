import React from 'react';
import { Popup, Button } from 'semantic-ui-react';
import SortableTree, { map } from 'react-sortable-tree';
import { LexicalEntryView } from 'components/PerspectiveView/index';


class LanguageTree extends React.Component {
  static generateNodeProps({ node, path }) {
    switch (node.type) {
      case 'perspective':
        return {
          subtitle: (
            <Popup trigger={<Button compact>{node.lexicalEntries.length}</Button>} hideOnScroll position="top center" on="click">
              <LexicalEntryView
                className="perspective"
                perspectiveId={node.id}
                entries={node.lexicalEntries}
                mode="view"
                entitiesMode="published"
              />
            </Popup>
          ),
        };
      default:
        return {
          title: node.translation || 'None',
        };
    }
  }

  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.searchResultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: false }),
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

export default LanguageTree;
