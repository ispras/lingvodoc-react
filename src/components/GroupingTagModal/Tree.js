import React from 'react';
import PropTypes from 'prop-types';
import SortableTree, { map, getVisibleNodeInfoAtIndex } from 'react-sortable-tree';
import { Header } from 'semantic-ui-react';
import { LexicalEntryViewByIds } from 'components/PerspectiveView';

class Tree extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      treeData: map({
        treeData: props.resultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: false }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    };

    this.generateNodeProps = this.generateNodeProps.bind(this);
  }

  componentWillReceiveProps(props) {
    const { resultsTree: oldResultsTree } = this.props;
    const { resultsTree: newResultsTree } = props;
    if (!oldResultsTree.equals(newResultsTree)) {
      this.setState({
        treeData: map({
          treeData: props.resultsTree.toJS(),
          callback: ({ node }) => ({ ...node, expanded: false }),
          getNodeKey: ({ treeIndex }) => treeIndex,
          ignoreCollapsed: false,
        }),
      });
    }
  }

  generateNodeProps({ node }) {
    const { actions, TableComponent } = this.props;
    switch (node.type) {
      case 'perspective':
        return {
          subtitle: (
            <div>
              <Header size="large">{node.translation}</Header>

              <TableComponent
                className="perspective"
                perspectiveId={node.id}
                entries={node.lexicalEntries}
                mode="view"
                entitiesMode="all"
                actions={actions}
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
  TableComponent: PropTypes.func,
  actions: PropTypes.array,
};

Tree.defaultProps = {
  actions: [],
  TableComponent: LexicalEntryViewByIds,
};

export default Tree;
