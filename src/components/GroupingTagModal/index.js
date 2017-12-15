import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import { Confirm, Button, Modal, Header, Input, Tab } from 'semantic-ui-react';
import { closeModal } from 'ducks/groupingTag';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import SortableTree, { map, getVisibleNodeInfoAtIndex } from 'react-sortable-tree';
import { compositeIdToString } from 'utils/compositeId';
import { LexicalEntryView } from 'components/PerspectiveView';
import styled from 'styled-components';

import { connectedQuery, connectMutation, disconnectMutation, searchQuery, languageTreeSourceQuery } from './graphql';
import Tree from './Tree';
import Search from './search';
import buildPartialLanguageTree from './partialTree';

const ModalContentWrapper = styled('div')`min-height: 60vh;`;

const ConnectedLexicalEntries = (props) => {
  const {
    data: { loading, error, connected_words: connectedWords },
    allLanguages,
    allDictionaries,
    allPerspectives,
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
  }).isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
};

const ConnectedLexicalEntriesWithData = graphql(connectedQuery)(ConnectedLexicalEntries);

class GroupingTagModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      confirm: false,
    };

    this.handleConfirm = this.handleConfirm.bind(this);
    this.joinGroup = this.joinGroup.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
  }

  joinGroup(targetEntry) {
    // disconnect lexical entry from group
    const {
      connect: mutate, lexicalEntry, fieldId, mode,
    } = this.props;

    mutate({
      variables: { fieldId, connections: [lexicalEntry.id, targetEntry.id] },
      refetchQueries: [
        {
          query: connectedQuery,
          variables: {
            id: lexicalEntry.id,
            fieldId,
            mode,
          },
        },
      ],
    });
  }

  leaveGroup() {
    // disconnect lexical entry from group
    const {
      disconnect, lexicalEntry, fieldId, mode,
    } = this.props;
    disconnect({
      variables: { lexicalEntryId: lexicalEntry.id, fieldId },
      refetchQueries: [
        {
          query: connectedQuery,
          variables: {
            id: lexicalEntry.id,
            fieldId,
            mode,
          },
        },
      ],
    });
  }

  handleConfirm() {
    this.setState({ confirm: false });
    this.leaveGroup();
  }

  render() {
    const {
      data, visible, lexicalEntry, fieldId, mode, controlsMode,
    } = this.props;

    if (!visible) {
      return null;
    }

    const {
      loading,
      error,
      language_tree: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives,
    } = data;

    if (loading || error) {
      return null;
    }

    const panes = [
      {
        menuItem: 'View',
        render: () => (
          <ConnectedLexicalEntriesWithData
            id={lexicalEntry.id}
            fieldId={fieldId}
            mode={mode}
            allLanguages={allLanguages}
            allDictionaries={allDictionaries}
            allPerspectives={allPerspectives}
          />
        ),
      },
    ];

    if (controlsMode === 'edit') {
      panes.push({
        menuItem: 'Add connection',
        render: () => (
          <Search
            lexicalEntry={lexicalEntry}
            fieldId={fieldId}
            connect={this.joinGroup}
            allLanguages={allLanguages}
            allDictionaries={allDictionaries}
            allPerspectives={allPerspectives}
          />
        ),
      });
    }

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>Grouping tag</Modal.Header>
          <Modal.Content>
            <ModalContentWrapper>
              <Tab panes={panes} />
            </ModalContentWrapper>
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
            <Button icon="minus" content="Cancel" onClick={this.props.closeModal} />
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
  data: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    perspectives: PropTypes.array,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  lexicalEntry: PropTypes.object,
  fieldId: PropTypes.array,
  mode: PropTypes.string.isRequired,
  controlsMode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

const mapDispatchToProps = dispatch => bindActionCreators({ closeModal }, dispatch);

export default compose(
  connect(state => state.groupingTag, mapDispatchToProps),
  graphql(languageTreeSourceQuery),
  graphql(disconnectMutation, { name: 'disconnect' }),
  graphql(connectMutation, { name: 'connect' })
)(GroupingTagModal);
