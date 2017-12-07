import React from 'react';
import { gql, graphql } from 'react-apollo';
import styled from 'styled-components';
import SortableTree, { map } from 'react-sortable-tree';
import Immutable from 'immutable';
import { buildLanguageTree } from 'pages/Search/treeBuilder';


const languagesQuery = gql`
query languagesQuery {
  language_tree {
    id
    parent_id
    translation
    created_at
  }
}
`;

const Language = styled.div`
  cursor: pointer;
  text-decoration: ${props => props.selected ? 'underline' : 'none'};
`;

class LanguageSelect extends React.PureComponent {
  constructor(props) {
    super(props);

    this.generateNodeProps = this.generateNodeProps.bind(this);
    const { languagesTree } = props;
    const plainData = map({
      treeData: languagesTree.toJS(),
      callback: ({ node }) => ({ ...node, expanded: false }),
      getNodeKey: ({ treeIndex }) => treeIndex,
      ignoreCollapsed: false,
    });

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


const Wrapper = ({ data, select, onSelect }) => {

  if (data.loading || data.error) {
    return null;
  }

  const { language_tree: languages } = data;
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));
  return (<LanguageSelect languagesTree={languagesTree} select={select} onSelect={onSelect} />);
};

export default graphql(languagesQuery)(Wrapper);
