import React from 'react';
import { gql, graphql } from 'react-apollo';
import { compose, pure } from 'recompose';
import styled from 'styled-components';
import Immutable from 'immutable';
import { Dimmer, Loader, Popup, Button } from 'semantic-ui-react';
import SortableTree, { map } from 'react-sortable-tree';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { LexicalEntryView } from 'components/PerspectiveView/index';

const query = gql`
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
        additional_metadata {
          location
        }
        tree {
          id
          translation
        }
      }
      lexical_entries {
        id
        parent_id
        entities {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
        }
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

const Wrapper = styled('div')`height: 600;`;

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
      treeData: {},
    };
  }

  componentWillReceiveProps(props) {
    const { data } = props;
    const { loading } = data;

    if (!loading) {
      const { languages: allLanguages, advanced_search } = data;

      const searchResults = Immutable.fromJS(advanced_search);
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
  }

  render() {
    const { data } = this.props;
    const { loading } = data;

    if (loading) {
      return (
        <Dimmer active={loading} inverted>
          <Loader>Loading</Loader>
        </Dimmer>
      );
    }

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

export default compose(graphql(query), pure)(LanguageTree);
