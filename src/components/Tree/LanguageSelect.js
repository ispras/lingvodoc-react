import React from 'react';
import styled from 'styled-components';
import SortableTree, { map } from 'react-sortable-tree';

import { languagesTree } from 'pages/Search';

const plainData = map({
  treeData: languagesTree.toJS(),
  callback: ({ node }) => ({ ...node, expanded: false }),
  getNodeKey: ({ treeIndex }) => treeIndex,
  ignoreCollapsed: false,
});

const Language = styled.div`
  cursor: pointer;
  text-decoration: ${props => props.selected ? 'underline' : 'none'};
`;

class LanguageSelect extends React.PureComponent {
  constructor(props) {
    super(props);

    this.generateNodeProps = this.generateNodeProps.bind(this);

    this.state = { tree: plainData };
  }

  generateNodeProps({ node, path }) {
    return {
      title: (
        <Language
          selected={this.props.selected}
          onClick={() => this.props.onSelect(node)}
        >
          {node.translation}
        </Language>
      ),
    };
  }

  render() {
    return (
      <div style={{ height: 600 }}>
        <SortableTree
          canDrag={false}
          rowHeight={42}
          scaffoldBlockPxWidth={32}
          treeData={this.state.tree}
          onChange={tree => this.setState({ tree })}
          generateNodeProps={this.generateNodeProps}
        />
      </div>
    );
  }
}

export default LanguageSelect;
