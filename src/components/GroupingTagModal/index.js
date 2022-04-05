import React from "react";
import { graphql } from "react-apollo";
import { Button, Checkbox, Dimmer, Header, Icon, Modal, Segment, Tab } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";
import styled from "styled-components";

import { queryLexicalEntries, queryPerspective } from "components/PerspectiveView";

import ConnectedEntries from "./ConnectedEntries";
import {
  acceptMutation,
  connectedQuery,
  connectMutation,
  disconnectMutation,
  languageTreeSourceQuery,
  publishMutation
} from "./graphql";
import Search from "./search";

const ModalContentWrapper = styled("div")`
  min-height: 60vh;
`;

const EditGroupingTag = props => {
  const {
    lexicalEntry,
    fieldId,
    entitiesMode,
    allLanguages,
    allDictionaries,
    allPerspectives,
    connectedWords,
    joinGroup,
    leaveGroup
  } = props;

  const panes = [
    {
      menuItem: getTranslation("View"),
      render: () => (
        <div>
          <Segment textAlign="center">
            <Button negative content={getTranslation("Disconnect")} onClick={leaveGroup} />
          </Segment>
          <Segment padded="very" textAlign="center" className="lingvo-grouping-tag">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              entitiesMode={entitiesMode}
              mode="edit"
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
              connectedWords={connectedWords}
            />
          </Segment>
        </div>
      )
    },
    {
      menuItem: getTranslation("Add connection"),
      render: () => (
        <Search
          lexicalEntry={lexicalEntry}
          fieldId={fieldId}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          connectedWords={connectedWords}
          joinGroup={joinGroup}
          entitiesMode={entitiesMode}
        />
      )
    }
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
  connectedWords: PropTypes.object,
  joinGroup: PropTypes.func.isRequired,
  leaveGroup: PropTypes.func.isRequired
};

const ViewGroupingTag = props => {
  const { lexicalEntry, fieldId, entitiesMode, allLanguages, allDictionaries, allPerspectives, connectedWords } = props;

  const panes = [
    {
      menuItem: getTranslation("View"),
      render: () => (
        <div>
          <Segment padded="very" textAlign="center" className="lingvo-grouping-tag">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              entitiesMode={entitiesMode}
              mode="view"
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
              connectedWords={connectedWords}
            />
          </Segment>
        </div>
      )
    }
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
  connectedWords: PropTypes.object
};

const PublishGroupingTag = props => {
  const {
    lexicalEntry,
    fieldId,
    entitiesMode,
    allLanguages,
    allDictionaries,
    allPerspectives,
    connectedWords,
    publish
  } = props;

  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: getTranslation("Publish"),
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Checkbox toggle checked={entity.published} onChange={(e, { checked }) => publish(entity, checked)} />
              {entity.published && (
                <span>{getTranslation("The entity is currently published. Click to unpublish.")}</span>
              )}
              {!entity.published && (
                <span>{getTranslation("The entity is NOT currently published. Click to publish.")}</span>
              )}
            </Segment>
          )}
          <Segment padded="very" textAlign="center" className="lingvo-grouping-tag">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              entitiesMode={entitiesMode}
              mode="publish"
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
              connectedWords={connectedWords}
            />
          </Segment>
        </div>
      )
    }
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
  connectedWords: PropTypes.object,
  publish: PropTypes.func.isRequired
};

const ContributionsGroupingTag = props => {
  const {
    lexicalEntry,
    fieldId,
    entitiesMode,
    allLanguages,
    allDictionaries,
    allPerspectives,
    connectedWords,
    accept
  } = props;

  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: getTranslation("Contibutions"),
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Button
                positive
                content={getTranslation("Accept")}
                disabled={entity.accepted}
                onClick={() => accept(entity, true)}
              />
            </Segment>
          )}
          <Segment padded="very" textAlign="center" className="lingvo-grouping-tag">
            <ConnectedEntries
              id={lexicalEntry.id}
              fieldId={fieldId}
              entitiesMode={entitiesMode}
              mode="contributions"
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
              connectedWords={connectedWords}
            />
          </Segment>
        </div>
      )
    }
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
  connectedWords: PropTypes.object,
  accept: PropTypes.func.isRequired
};

const getComponent = mode => {
  switch (mode) {
    case "edit":
      return EditGroupingTag;
    case "view":
      return ViewGroupingTag;
    case "publish":
      return PublishGroupingTag;
    case "contributions":
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
    // connect to lexical group
    const { connect: mutate, lexicalEntry, fieldId, entitiesMode } = this.props;

    mutate({
      variables: { fieldId, connections: [lexicalEntry.id, targetEntry.id] },
      refetchQueries: [
        // XXX: https://github.com/apollographql/react-apollo/issues/1314
        // It seems that with fetchPolicy: 'network-only' works ok.
        {
          query: connectedQuery,
          variables: {
            id: lexicalEntry.id,
            fieldId,
            entitiesMode
          },
          fetchPolicy: "network-only"
        }
      ]
    }).then(() => {
      window.logger.suc(getTranslation("Connected"));
    });
  }

  leaveGroup() {
    // disconnect lexical entry from group
    const { disconnect, lexicalEntry, fieldId, entitiesMode } = this.props;
    disconnect({
      variables: { lexicalEntryId: lexicalEntry.id, fieldId },
      refetchQueries: [
        {
          query: connectedQuery,
          variables: {
            id: lexicalEntry.id,
            fieldId,
            entitiesMode
          }
        }
      ]
    }).then(() => {
      window.logger.suc(getTranslation("Disconnected"));
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
            entitiesMode
          }
        }
      ]
    });
  }

  changeAccepted(entity, accepted) {
    const { accept, lexicalEntry, entitiesMode } = this.props;

    accept({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          // XXX: Expensive operation!
          query: queryLexicalEntries,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode
          }
        }
      ]
    });
  }

  render() {
    const { data, connectedQueryData, lexicalEntry, fieldId, entitiesMode, mode, onClose } = this.props;

    const {
      loading,
      error,
      language_tree: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives
    } = data;

    if (error || connectedQueryData.error) {
      return null;
    }

    if (loading || connectedQueryData.loading) {
      return (
        <Modal
          dimmer
          open
          size="fullscreen"
          closeOnDimmerClick={false}
          closeIcon
          onClose={onClose}
          className="lingvo-modal2"
        >
          <Modal.Content>
            <ModalContentWrapper>
              <Dimmer active style={{ minHeight: "60vh", background: "none" }}>
                <Header as="h2" icon>
                  <Icon name="spinner" loading />
                </Header>
              </Dimmer>
            </ModalContentWrapper>
          </Modal.Content>
        </Modal>
      );
    }

    const Component = getComponent(mode);

    return (
      <div>
        <Modal
          dimmer
          open
          size="fullscreen"
          closeOnDimmerClick={false}
          closeIcon
          onClose={onClose}
          className="lingvo-modal2"
        >
          <Modal.Header>{getTranslation("Grouping tag")}</Modal.Header>
          <Modal.Content scrolling>
            <ModalContentWrapper>
              <Component
                lexicalEntry={lexicalEntry}
                fieldId={fieldId}
                entitiesMode={entitiesMode}
                allLanguages={allLanguages}
                allDictionaries={allDictionaries}
                allPerspectives={allPerspectives}
                connectedWords={connectedQueryData.connected_words}
                joinGroup={this.joinGroup}
                leaveGroup={this.leaveGroup}
                publish={this.changePublished}
                accept={this.changeAccepted}
              />
            </ModalContentWrapper>
          </Modal.Content>
          <Modal.Actions>
            <Button content={getTranslation("Cancel")} onClick={onClose} className="lingvo-button-basic-black" />
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
    perspectives: PropTypes.array
  }).isRequired,
  lexicalEntry: PropTypes.object,
  fieldId: PropTypes.array,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
  connect: PropTypes.func.isRequired,
  disconnect: PropTypes.func.isRequired,
  publish: PropTypes.func.isRequired,
  accept: PropTypes.func.isRequired
};

GroupingTagModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null
};

export default compose(
  pure,
  graphql(languageTreeSourceQuery),
  graphql(connectedQuery, {
    name: "connectedQueryData",
    options: props => ({
      variables: {
        id: props.lexicalEntry.id,
        fieldId: props.fieldId,
        entitiesMode: props.entitiesMode
      },
      fetchPolicy: "network-only"
    })
  }),
  graphql(disconnectMutation, { name: "disconnect" }),
  graphql(connectMutation, { name: "connect" }),
  graphql(publishMutation, { name: "publish" }),
  graphql(acceptMutation, { name: "accept" })
)(GroupingTagModal);
