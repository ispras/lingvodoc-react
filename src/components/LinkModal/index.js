import React from "react";
import { Button, Checkbox, Dimmer, Header, Icon, Modal, Segment, Tab } from "semantic-ui-react";
import { graphql } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import styled from "styled-components";

import buildPartialLanguageTree from "components/GroupingTagModal/partialTree";
import SearchLexicalEntries from "components/GroupingTagModal/search";
import Tree from "components/GroupingTagModal/Tree";
import { LexicalEntryByIds, queryPerspective } from "components/PerspectiveView";

import { acceptMutation, createMutation, languageTreeSourceQuery, publishMutation, removeMutation } from "./graphql";

const ModalContentWrapper = styled("div")`
  min-height: 60vh;
`;

function buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives) {
  const entities = lexicalEntry.entities.filter(e => isEqual(e.field_id, column.field_id));

  // old-style links have perspective id stored in column while newer directed links
  // store perspective id in the metadata of each entity
  const lexicalEntries = column.link_id
    ? entities.map(e => ({ id: e.link_id, parent_id: column.link_id }))
    : entities.map(e => ({ id: e.link_id, parent_id: e.additional_metadata.link_perspective_id }));

  return buildPartialLanguageTree({
    lexicalEntries,
    allLanguages,
    allDictionaries,
    allPerspectives
  });
}

const ViewLink = props => {
  const { lexicalEntry, column, allLanguages, allDictionaries, allPerspectives } = props;

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);

  const panes = [
    {
      menuItem: getTranslation("View"),
      render: () => (
        <div>
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} mode="view" />
          </Segment>
        </div>
      )
    }
  ];
  return <Tab panes={panes} />;
};

ViewLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired
};

const EditLink = props => {
  const { lexicalEntry, column, allLanguages, allDictionaries, allPerspectives, create, remove } = props;

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);

  const actions = [
    {
      title: getTranslation("Remove"),
      action: entry => {
        const entity = lexicalEntry.entities.find(
          e => isEqual(e.link_id, entry.id) && isEqual(e.field_id, column.field_id)
        );
        if (entity) {
          remove(entity);
        }
      }
    }
  ];

  const panes = [
    {
      menuItem: getTranslation("View"),
      render: () => (
        <div>
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryByIds} actions={actions} mode="edit" />
          </Segment>
        </div>
      )
    },
    {
      menuItem: getTranslation("Add link"),
      render: () => (
        <SearchLexicalEntries
          lexicalEntry={lexicalEntry}
          perspectiveId={column.link_id}
          fieldId={column.field_id}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          joinGroup={create}
        />
      )
    }
  ];
  return <Tab panes={panes} />;
};

EditLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  create: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired
};

const PublishLink = props => {
  const { lexicalEntry, column, allLanguages, allDictionaries, allPerspectives, publish } = props;

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, column.field_id));
  const label = entity.published
    ? getTranslation("The entity is currently published. Click to unpublish.")
    : getTranslation("The entity is NOT currently published. Click to publish.");

  const panes = [
    {
      menuItem: getTranslation("Publish"),
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Checkbox
                toggle
                label={label}
                checked={entity.published}
                onChange={(e, { checked }) => publish(entity, checked)}
              />
            </Segment>
          )}
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryByIds} mode="publish" />
          </Segment>
        </div>
      )
    }
  ];
  return <Tab panes={panes} />;
};

PublishLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  publish: PropTypes.func.isRequired
};

const ContributionsLink = props => {
  const { lexicalEntry, column, allLanguages, allDictionaries, allPerspectives, accept } = props;

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, column.field_id));

  const panes = [
    {
      menuItem: getTranslation("Contributions"),
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
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryByIds} mode="contributions" />
          </Segment>
        </div>
      )
    }
  ];
  return <Tab panes={panes} />;
};

ContributionsLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  accept: PropTypes.func.isRequired
};

const getComponent = mode => {
  switch (mode) {
    case "edit":
      return EditLink;
    case "view":
      return ViewLink;
    case "publish":
      return PublishLink;
    case "contributions":
      return ContributionsLink;
    default:
      return <Segment negative>Mode {mode} not supported</Segment>;
  }
};

class LinkModalContent extends React.PureComponent {
  constructor(props) {
    super(props);

    this.createEntity = this.createEntity.bind(this);
    this.changePublished = this.changePublished.bind(this);
    this.changeAccepted = this.changeAccepted.bind(this);
    this.removeEntity = this.removeEntity.bind(this);
  }

  createEntity(targetLexicalEntry) {
    const { create, lexicalEntry, entitiesMode, fieldId } = this.props;

    create({
      variables: {
        parent_id: lexicalEntry.id,
        field_id: fieldId,
        linkId: targetLexicalEntry.id,
        linkPerspectiveId: targetLexicalEntry.parent_id
      },
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
          query: queryPerspective,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode
          }
        }
      ]
    });
  }

  removeEntity(entity) {
    const { remove, lexicalEntry, entitiesMode } = this.props;
    remove({
      variables: { id: entity.id },
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

  render() {
    const { data, lexicalEntry, fieldId, entitiesMode, mode } = this.props;

    const {
      loading,
      error,
      language_tree: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives,
      perspective
    } = data;

    if (error) {
      return null;
    }

    if (loading) {
      return (
        <ModalContentWrapper>
          <Dimmer active style={{ minHeight: "60vh", background: "none" }}>
            <Header as="h2" icon>
              <Icon name="spinner" loading />
            </Header>
          </Dimmer>
        </ModalContentWrapper>
      );
    }

    const column = perspective.columns.find(c => isEqual(c.field_id, fieldId) && !!c.link_id);

    const Component = getComponent(mode);

    return (
      <ModalContentWrapper>
        <Component
          lexicalEntry={lexicalEntry}
          fieldId={fieldId}
          column={column}
          entitiesMode={entitiesMode}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          create={this.createEntity}
          remove={this.removeEntity}
          publish={this.changePublished}
          accept={this.changeAccepted}
        />
      </ModalContentWrapper>
    );
  }
}

LinkModalContent.propTypes = {
  data: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    perspectives: PropTypes.array
  }).isRequired,
  perspectiveId: PropTypes.array.isRequired,
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  create: PropTypes.func.isRequired,
  publish: PropTypes.func.isRequired,
  accept: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired
};

const Content = compose(
  graphql(languageTreeSourceQuery),
  graphql(createMutation, { name: "create" }),
  graphql(publishMutation, { name: "publish" }),
  graphql(acceptMutation, { name: "accept" }),
  graphql(removeMutation, { name: "remove" })
)(LinkModalContent);

const LinkModal = props => {
  return (
    <Modal
      dimmer
      open
      size="fullscreen"
      closeOnDimmerClick={false}
      closeIcon
      onClose={props.onClose}
      className="lingvo-modal2"
    >
      <Modal.Content>
        <Content {...props} />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Cancel")} onClick={props.onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

LinkModal.propTypes = {
  perspectiveId: PropTypes.array,
  lexicalEntry: PropTypes.object,
  fieldId: PropTypes.array,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired
};

LinkModal.defaultProps = {
  perspectiveId: null,
  lexicalEntry: null,
  fieldId: null
};

export default LinkModal;
