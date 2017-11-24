import React from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, withApollo } from 'react-apollo';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import Immutable from 'immutable';
import SortableTree, { map } from 'react-sortable-tree';
import { Segment, Button, Divider, Select, Input } from 'semantic-ui-react';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';

const advancedSearchQuery = gql`
  query Search($query: [[ObjectVal]]!) {
    advanced_search(search_strings: $query) {
      dictionaries {
        id
        parent_id
        translation
        additional_metadata {
          location
        }
      }
      perspectives {
        id
        parent_id
        translation
        tree {
          id
          translation
        }
      }
      lexical_entries {
        id
        parent_id
      }
      entities {
        id
        parent_id
        content
      }
    }
    languages {
      id
      parent_id
      translation
      created_at
    }
  }
  
`;

class LanguageTree extends React.Component {
  
  static generateNodeProps({ node, path }) {
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
  
  constructor(props) {
    super(props);
    this.state = {};
    this.executeSearch = this.executeSearch.bind(this);
  }

  executeSearch = async () => {
    const { query } = this.props;
    const result = await this.props.client.query({
      query: advancedSearchQuery,
      variables: { query },
    });
  
    const { data: { languages: allLanguages, advanced_search: searchResults } } = result;
    const languages = Immutable.fromJS(allLanguages);
    const languagesTree = buildLanguageTree(languages);
    const searchResultsTree = buildSearchResultsTree(searchResults, languagesTree);
    this.setState({
      treeData: map({
        treeData: searchResultsTree.toJS(),
        callback: ({ node }) => ({ ...node, expanded: false }),
        getNodeKey: ({ treeIndex }) => treeIndex,
        ignoreCollapsed: false,
      }),
    });
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
          generateNodeProps={LanguageTree.generateNodeProps}
        />
        <Button basic onClick={this.executeSearch}>Search!</Button>
      </div>
    );
  }
}

export default compose(pure, connect(state => state.search), withApollo)(LanguageTree);
