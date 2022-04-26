import React from "react";
import SortableTree, { map } from "react-sortable-tree";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import Immutable from "immutable";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import { buildLanguageTree } from "pages/Search/treeBuilder";

const languagesQuery = gql`
  query languagesQuery {
    language_tree {
      id
      parent_id
      translations
      created_at
    }
  }
`;

const Language = styled.div`
  cursor: pointer;
  text-decoration: ${props => (props.selected ? "underline" : "none")};
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
      ignoreCollapsed: false
    });

    this.state = { tree: plainData };
  }

  generateNodeProps({ node, path }) {
    return {
      title: (
        <Language selected={this.props.selected} onClick={() => this.props.onSelect(node)}>
          {T(node.translations)}
        </Language>
      )
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
  return <LanguageSelect languagesTree={languagesTree} select={select} onSelect={onSelect} />;
};

export default graphql(languagesQuery)(Wrapper);
