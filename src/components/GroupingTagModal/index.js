import React, { useState, useContext } from "react";
import { Button, Checkbox, Dimmer, Header, Icon, Modal, Segment, Tab } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";
import styled from "styled-components";

import { queryLexicalEntries, queryPerspective } from "components/PerspectiveView";
import TranslationContext from "Layout/TranslationContext";

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
  background: #fff;
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

  const getTranslation = useContext(TranslationContext);

  const panes = [
    {
      menuItem: getTranslation("View"),
      render: () => (
        <div>
          <Segment textAlign="center">
            <Button
              className="lingvo-button-redder"
              content={getTranslation("Disconnect")}
              onClick={leaveGroup}
              style={{ marginTop: "6px", marginBottom: "6px" }}
            />
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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
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

  const getTranslation = useContext(TranslationContext);

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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
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
    publish,
    published
  } = props;

  const getTranslation = useContext(TranslationContext);

  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: getTranslation("Publish"),
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Checkbox
                toggle
                label={
                  (published && getTranslation("The entity is currently published. Click to unpublish.")) ||
                  getTranslation("The entity is NOT currently published. Click to publish.")
                }
                checked={published}
                onChange={(e, { checked }) => publish(entity, checked)}
                className="lingvo-radio-toggle"
                style={{ marginTop: "10px", marginBottom: "10px" }}
              />
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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
};

PublishGroupingTag.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  connectedWords: PropTypes.object,
  publish: PropTypes.func.isRequired,
  published: PropTypes.bool.isRequired
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

  const getTranslation = useContext(TranslationContext);

  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: getTranslation("Contibutions"),
      render: () => (
        <div>
          {entity && (
            <Segment textAlign="center">
              <Button
                content={getTranslation("Accept")}
                disabled={entity.accepted}
                onClick={() => accept(entity, true)}
                className="lingvo-button-greenest"
                style={{ marginTop: "6px", marginBottom: "6px" }}
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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
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

const GroupingTagModal = ({
  accept,
  connect: mutate,
  connectedQueryData,
  data,
  disconnect,
  lexicalEntry,
  fieldId,
  entitiesMode,
  mode,
  onClose,
  publish
}) => {
  const getTranslation = useContext(TranslationContext);

  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, fieldId));

  const [entityPublish, setEntityPublish] = useState((entity && entity.published) || false);

  const joinGroup = targetEntry => {
    // connect to lexical group
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
  };

  const leaveGroup = () => {
    // disconnect lexical entry from group

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
  };

  const changePublished = (entity, published) => {
    publish({
      variables: { id: entity.id, published },
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
    }).then(() => {
      setEntityPublish(published);
    });
  };

  const changeAccepted = (entity, accepted) => {
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
  };

  const {
    loading,
    error,
    languages: allLanguages,
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
              published={entityPublish}
              entitiesMode={entitiesMode}
              allLanguages={allLanguages}
              allDictionaries={allDictionaries}
              allPerspectives={allPerspectives}
              connectedWords={connectedQueryData.connected_words}
              joinGroup={joinGroup}
              leaveGroup={leaveGroup}
              publish={changePublished}
              accept={changeAccepted}
            />
          </ModalContentWrapper>
        </Modal.Content>
        <Modal.Actions>
          <Button content={getTranslation("Cancel")} onClick={onClose} className="lingvo-button-basic-black" />
        </Modal.Actions>
      </Modal>
    </div>
  );
};

GroupingTagModal.propTypes = {
  data: PropTypes.shape({
    languages: PropTypes.array,
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
