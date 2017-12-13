import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, Popup } from 'semantic-ui-react';
import Immutable, { fromJS } from 'immutable';
import { closeModal } from 'ducks/groupingTag';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { uniq } from 'lodash';
import SortableTree, { map } from 'react-sortable-tree';
import { compositeIdToString } from 'utils/compositeId';
import { buildLanguageTree, buildSearchResultsTree } from 'pages/Search/treeBuilder';
import { LexicalEntryView } from 'components/PerspectiveView';

class Tree extends React.Component {
  static generateNodeProps({ node, path }) {
    switch (node.type) {
      case 'perspective':
        return {
          subtitle: (
            <Popup
              trigger={<Button compact>{node.lexicalEntries.length}</Button>}
              hideOnScroll
              position="top center"
              on="click"
            >
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
        treeData: props.resultsTree.toJS(),
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
          treeData={this.state.treeData}
          generateNodeProps={Tree.generateNodeProps}
          onChange={treeData => this.setState({ treeData })}
        />
      </div>
    );
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

  const { lexical_entries } = connectedWords;

  const perspectiveCompositeIds = uniq(lexical_entries.map(entry => entry.parent_id)).map(compositeIdToString);
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

  const treeData = Immutable.fromJS({ dictionaries, perspectives, lexical_entries });
  const languagesTree = buildLanguageTree(Immutable.fromJS(languages));
  const resultsTree = buildSearchResultsTree(treeData, languagesTree);

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

class GroupingTagModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      visible, lexicalEntry, fieldId, mode,
    } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal dimmer open fluid>
        <Modal.Header>Grouping tag</Modal.Header>
        <Modal.Content>
          <ConnectedLexicalEntriesWithData id={lexicalEntry.id} fieldId={fieldId} mode={mode} />
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Cancel" onClick={this.props.actions.closeModal} />
        </Modal.Actions>
      </Modal>
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
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(connect(state => state.groupingTag, mapDispatchToProps))(GroupingTagModal);
