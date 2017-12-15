import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Confirm, Button, Modal, Tab } from 'semantic-ui-react';
import { closeModal } from 'ducks/groupingTag';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import styled from 'styled-components';

import { connectedQuery, connectMutation, disconnectMutation, languageTreeSourceQuery } from './graphql';
import ConnectedEntries from './ConnectedEntries';
import Search from './search';

const ModalContentWrapper = styled('div')`min-height: 60vh;`;

const EditGroupingTag = (props) => {
  const {
    lexicalEntry, fieldId, entitiesMode, allLanguages, allDictionaries, allPerspectives, joinGroup,
  } = props;

  const panes = [
    {
      menuItem: 'View',
      render: () => (
        <div>
          <ConnectedEntries
            id={lexicalEntry.id}
            fieldId={fieldId}
            mode={entitiesMode}
            allLanguages={allLanguages}
            allDictionaries={allDictionaries}
            allPerspectives={allPerspectives}
          />
        </div>
      ),
    },
    {
      menuItem: 'Add connection',
      render: () => (
        <Search
          lexicalEntry={lexicalEntry}
          fieldId={fieldId}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          joinGroup={joinGroup}
        />
      ),
    },
  ];
  return <Tab panes={panes} />;
};

EditGroupingTag.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  joinGroup: PropTypes.func.isRequired,
};

const ViewGroupingTag = (props) => {
  const { a } = props;
  return null;
};

const PublishGroupingTag = (props) => {
  const { a } = props;
  return null;
};

const ContributionsGroupingTag = (props) => {
  const { a } = props;
  return null;
};

const getComponent = (mode) => {
  switch (mode) {
    case 'edit':
      return EditGroupingTag;
    case 'view':
      return ViewGroupingTag;
    case 'publish':
      return PublishGroupingTag;
    case 'contributions':
      return ContributionsGroupingTag;
    default:
      return <Segment negative>Mode {mode} not supported</Segment>;
  }
};

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
      data, visible, lexicalEntry, fieldId, entitiesMode, mode,
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

    const Component = getComponent(mode);

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>Grouping tag</Modal.Header>
          <Modal.Content>
            <ModalContentWrapper>
              <Component
                lexicalEntry={lexicalEntry}
                fieldId={fieldId}
                entitiesMode={entitiesMode}
                allLanguages={allLanguages}
                allDictionaries={allDictionaries}
                allPerspectives={allPerspectives}
                joinGroup={this.joinGroup}
              />
            </ModalContentWrapper>
          </Modal.Content>
          <Modal.Actions>
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
  entitiesMode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

export default compose(
  connect(state => state.groupingTag, dispatch => bindActionCreators({ closeModal }, dispatch)),
  graphql(languageTreeSourceQuery),
  graphql(disconnectMutation, { name: 'disconnect' }),
  graphql(connectMutation, { name: 'connect' })
)(GroupingTagModal);
