import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql, withApollo } from 'react-apollo';
import { Confirm, Button, Modal, Header, Input } from 'semantic-ui-react';
import Immutable from 'immutable';
import { closeModal } from 'ducks/groupingTag';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { uniq } from 'lodash';
import SortableTree, { map, getVisibleNodeInfoAtIndex } from 'react-sortable-tree';
import { compositeIdToString } from 'utils/compositeId';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { LexicalEntryView } from 'components/PerspectiveView';

function buildPartialLanguageTree({
  lexicalEntries, allPerspectives, allDictionaries, allLanguages,
}) {
  const perspectiveCompositeIds = uniq(lexicalEntries.map(entry => entry.parent_id)).map(compositeIdToString);
  const perspectives = allPerspectives.filter(p => perspectiveCompositeIds.indexOf(compositeIdToString(p.id)) >= 0);
  const perspectiveParentCompositeIds = perspectives.map(p => compositeIdToString(p.parent_id));
  const dictionaries = allDictionaries.filter(d => perspectiveParentCompositeIds.indexOf(compositeIdToString(d.id)) >= 0);
  const dictionaryParentCompositeIds = dictionaries.map(d => compositeIdToString(d.parent_id));
  const seedLanguages = allLanguages.filter(lang => dictionaryParentCompositeIds.indexOf(compositeIdToString(lang.id)) >= 0);

  const reducer = (acc, lang) => {
    const id = compositeIdToString(lang.id);
    const parentIds = acc.filter(p => p.parent_id).map(p => compositeIdToString(p.parent_id));

    if (parentIds.indexOf(id) >= 0 && acc.map(p => compositeIdToString(p.id)).indexOf(id) < 0) {
      return [...acc, lang];
    }
    return acc;
  };

  let languages = seedLanguages;
  let prevLanguages = [];
  do {
    prevLanguages = languages;
    languages = allLanguages.reduce(reducer, prevLanguages);
  } while (prevLanguages.length !== languages.length);
  const treeData = Immutable.fromJS({ dictionaries, perspectives, lexical_entries: lexicalEntries });
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));
  return buildSearchResultsTree(treeData, languagesTree);
}

class Tree extends React.Component {
  static generateNodeProps({ node }) {
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
          generateNodeProps={Tree.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
  }
}

Tree.propTypes = {
  resultsTree: PropTypes.object.isRequired,
};

class GroupingTagEdit extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    return <div>edit</div>;
  }
}

const connectedQuery = gql`
  query connectedWords($id: LingvodocID!, $fieldId: LingvodocID!, $mode: String!) {
    connected_words(id: $id, field_id: $fieldId, mode: $mode) {
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
          additional_metadata {
            link_perspective_id
          }
        }
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
    dictionaries {
      id
      parent_id
      translation
    }
    perspectives {
      id
      parent_id
      translation
    }
  }
`;

const ConnectedLexicalEntries = (props) => {
  const {
    data: {
      loading,
      error,
      connected_words: connectedWords,
      language_tree: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives,
    },
  } = props;
  if (error || loading) {
    return null;
  }

  const { lexical_entries: lexicalEntries } = connectedWords;

  if (lexicalEntries.length === 0) {
    return null;
  }

  const resultsTree = buildPartialLanguageTree({
    lexicalEntries,
    allLanguages,
    allDictionaries,
    allPerspectives,
  });

  return <Tree resultsTree={resultsTree} />;
};

ConnectedLexicalEntries.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    connected_words: PropTypes.object,
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    perspectives: PropTypes.array,
  }).isRequired,
};

const ConnectedLexicalEntriesWithData = graphql(connectedQuery)(ConnectedLexicalEntries);

// const disconnectMutation = gql`

// `;

const searchQuery = gql`
  query EntriesList($searchString: String!, $fieldId: LingvodocID!) {
    lexicalentries(searchstring: $searchString, search_in_published: true, field_id: $fieldId, can_add_tags: true) {
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
        additional_metadata {
          link_perspective_id
        }
      }
    }
  }
`;

const languageTreeSourceQuery = gql`
  query languageTreeSource {
    language_tree {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
    dictionaries {
      id
      parent_id
      translation
    }
    perspectives {
      id
      parent_id
      translation
    }
  }
`;

@withApollo
@graphql(languageTreeSourceQuery)
class SearchLexicalEntries extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      searchString: '',
    };

    this.search = this.search.bind(this);
  }

  async search() {
    const { searchString } = this.state;
    const { data: { lexicalentries: lexicalEntries } } = await this.props.client.query({
      query: searchQuery,
      variables: { searchString, fieldId: [66, 25] },
    });

    const {
      data: {
        loading,
        error,
        language_tree: allLanguages,
        dictionaries: allDictionaries,
        perspectives: allPerspectives,
      },
    } = this.props;

    const resultsTree = buildPartialLanguageTree({
      lexicalEntries,
      allLanguages,
      allDictionaries,
      allPerspectives,
    });

    console.log(resultsTree.toJS());
  }

  render() {
    const {
      data: {
        loading,
        error,
        language_tree: allLanguages,
        dictionaries: allDictionaries,
        perspectives: allPerspectives,
      },
    } = this.props;

    if (loading || error) {
      return null;
    }

    return (
      <Input
        action={{ icon: 'search', onClick: this.search }}
        placeholder="Search..."
        onChange={(e, data) => this.setState({ searchString: data.value })}
      />
    );
  }
}

class GroupingTagModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirm: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    this.setState({ confirm: false });
  }

  render() {
    const {
      visible, lexicalEntry, fieldId, mode, controlsMode,
    } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>Grouping tag</Modal.Header>
          <Modal.Content>
            <ConnectedLexicalEntriesWithData id={lexicalEntry.id} fieldId={fieldId} mode={mode} />

            <SearchLexicalEntries />
          </Modal.Content>
          <Modal.Actions>
            {controlsMode === 'edit' && (
              <Button negative onClick={() => this.setState({ confirm: true })}>
                Disconnect
              </Button>
            )}
            {controlsMode === 'publish' && (
              <Button positive onClick={() => this.setState({ confirm: true })}>
                Publish
              </Button>
            )}
            {controlsMode === 'contributions' && (
              <Button negative onClick={() => this.setState({ confirm: true })}>
                Accept
              </Button>
            )}
            <Button icon="minus" content="Cancel" onClick={this.props.actions.closeModal} />
          </Modal.Actions>
        </Modal>

        <Confirm
          open={this.state.confirm}
          onCancel={() => this.setState({ confirm: false })}
          onConfirm={this.handleConfirm}
        />
      </div>
    );
  }
}

GroupingTagModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  lexicalEntry: PropTypes.object,
  fieldId: PropTypes.array,
  mode: PropTypes.string.isRequired,
  controlsMode: PropTypes.string.isRequired,
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(connect(state => state.groupingTag, mapDispatchToProps))(GroupingTagModal);
