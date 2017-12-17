import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Checkbox, Button, Modal, Tab } from 'semantic-ui-react';
import { closeModal } from 'ducks/groupingTag';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { queryPerspective } from 'components/PerspectiveView';
import {
  connectedQuery,
  connectMutation,
  disconnectMutation,
  languageTreeSourceQuery,
  publishMutation,
  acceptMutation,
} from './graphql';
import ConnectedEntries from './ConnectedEntries';
import Search from './search';

const ModalContentWrapper = styled('div')`
  min-height: 60vh;
`;

const EditGroupingTag = (props) => {
  const {
    lexicalEntry,
    fieldId,
    entitiesMode,
    allLanguages,
    allDictionaries,
    allPerspectives,
    joinGroup,
    leaveGroup,
  } = props;

  const panes = [
    {
      menuItem: 'View',
      render: () => (
        <div>
          <Segment textAlign="center">
            <Button negative content="Disconnect" onClick={leaveGroup} />
          </Segment>
          <Segment padded="very" textAlign="center">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              mode={entitiesMode}
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
            />
          </Segment>
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
  leaveGroup: PropTypes.func.isRequired,
};

const ViewGroupingTag = (props) => {
  const {
    lexicalEntry, fieldId, entitiesMode, allLanguages, allDictionaries, allPerspectives,
  } = props;

  const panes = [
    {
      menuItem: 'View',
      render: () => (
        <div>
          <Segment padded="very" textAlign="center">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              mode={entitiesMode}
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
            />
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

ViewGroupingTag.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
};

const PublishGroupingTag = (props) => {
  const {
    lexicalEntry, fieldId, entitiesMode, allLanguages, allDictionaries, allPerspectives, publish,
  } = props;

  const entity = lexicalEntry.contains.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: 'Publish',
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Checkbox
                toggle
                defaultChecked={entity.published}
                onChange={(e, { checked }) => publish(entity, checked)}
              />
              {entity.published && <span>The entity is currently published. Click to unpublish.</span>}
              {!entity.published && <span>The entity is NOT currently published. Click to publish.</span>}
            </Segment>
          )}
          <Segment padded="very" textAlign="center">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              mode={entitiesMode}
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
            />
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

PublishGroupingTag.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  publish: PropTypes.func.isRequired,
};

const ContributionsGroupingTag = (props) => {
  const {
    lexicalEntry, fieldId, entitiesMode, allLanguages, allDictionaries, allPerspectives, accept,
  } = props;

  const entity = lexicalEntry.contains.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: 'Contibutions',
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Button positive onClick={() => accept(entity, true)} content="Accept" />
            </Segment>
          )}
          <Segment padded="very" textAlign="center">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              mode={entitiesMode}
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
            />
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

ContributionsGroupingTag.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  accept: PropTypes.func.isRequired,
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
    this.state = {};

    this.joinGroup = this.joinGroup.bind(this);
    this.leaveGroup = this.leaveGroup.bind(this);
    this.changePublished = this.changePublished.bind(this);
    this.changeAccepted = this.changeAccepted.bind(this);
  }

  joinGroup(targetEntry) {
    // disconnect lexical entry from group
    const {
      connect: mutate, lexicalEntry, fieldId, entitiesMode,
    } = this.props;

    mutate({
      variables: { fieldId, connections: [lexicalEntry.id, targetEntry.id] },
      refetchQueries: [
        {
          query: connectedQuery,
          variables: {
            id: lexicalEntry.id,
            fieldId,
            mode: entitiesMode,
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

  changePublished(entity, published) {
    const { publish, lexicalEntry, entitiesMode } = this.props;

    publish({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          // XXX: Expensive operation!
          query: queryPerspective,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode,
          },
        },
      ],
    });
  }

  changeAccepted(entity, accepted) {
    const {
      accept, lexicalEntry, entitiesMode, fieldId, mode,
    } = this.props;

    accept({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          // XXX: Expensive operation!
          query: queryPerspective,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode,
          },
        },
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
                leaveGroup={this.leaveGroup}
                publish={this.changePublished}
                accept={this.changeAccepted}
              />
            </ModalContentWrapper>
          </Modal.Content>
          <Modal.Actions>
            <Button icon="minus" content="Cancel" onClick={this.props.closeModal} />
          </Modal.Actions>
        </Modal>
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
  publish: PropTypes.func.isRequired,
  accept: PropTypes.func.isRequired,
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

export default compose(
  connect(state => state.groupingTag, dispatch => bindActionCreators({ closeModal }, dispatch)),
  graphql(languageTreeSourceQuery),
  graphql(disconnectMutation, { name: 'disconnect' }),
  graphql(connectMutation, { name: 'connect' }),
  graphql(publishMutation, { name: 'publish' }),
  graphql(acceptMutation, { name: 'accept' })
)(GroupingTagModal);
