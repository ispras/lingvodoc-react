import React from 'react';
import PropTypes from 'prop-types';
import SortableTree, { map, getVisibleNodeInfoAtIndex } from 'react-sortable-tree';
import { Header } from 'semantic-ui-react';
import { LexicalEntryView } from 'components/PerspectiveView';

class Tree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.resultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: !!props.expanded }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
  }

  generateNodeProps({ node }) {
    const { connect } = this.props;
    switch (node.type) {
      case 'perspective':
        return {
          subtitle: (
            <div>
              <Header size="large">{node.translation}</Header>

              <LexicalEntryView
                className="perspective"
                perspectiveId={node.id}
                entries={node.lexicalEntries}
                mode="view"
                entitiesMode="all"
                entryAction={{ title: 'Connect', action: entry => connect(entry) }}
              />
            </div>
          ),
          // XXX: move style to CSS class
          className: 'inlinePerspective',
          style: { overflowY: 'scroll', height: '290px' },
        };
      default:
        return {
          title: node.translation || 'None',
        };
    }
  }

  render() {
    const getHeight = ({ index }) => {
      const { node } = getVisibleNodeInfoAtIndex({
        treeData: this.state.treeData,
        index,
        getNodeKey: ({ treeIndex }) => treeIndex,
      });
      return node.type === 'perspective' ? 300 : 64;
    };

    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          treeData={this.state.treeData}
          rowHeight={getHeight}
          generateNodeProps={this.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
  }
}

Tree.propTypes = {
  resultsTree: PropTypes.object.isRequired,
};

export default Tree;
