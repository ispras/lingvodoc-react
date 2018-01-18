import React from 'react';
import { Popup, Button } from 'semantic-ui-react';
import SortableTree, { map } from 'react-sortable-tree';
import { LexicalEntryViewByIds } from 'components/PerspectiveView/index';


class LanguageTree extends React.Component {
  static generateNodeProps({ node }) {
    switch (node.type) {
      case 'perspective':
        return {
          subtitle: (
            <Popup trigger={<Button compact>{node.translation}:  {node.lexicalEntries.length} result(s)</Button>} hideOnScroll position="top center" on="click">
              <LexicalEntryViewByIds
                className="perspective"
                perspectiveId={node.id}
                entriesIds={node.lexicalEntries.map(e => e.id)}
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

export default LanguageTree;
