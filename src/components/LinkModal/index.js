import React, { useContext, query } from "react";
import { InMemoryCache } from '@apollo/client';
import { Button, Checkbox, Dimmer, Header, Icon, Message, Modal, Segment, Tab } from "semantic-ui-react";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import styled from "styled-components";

import buildPartialLanguageTree from "components/GroupingTagModal/partialTree";
import SearchLexicalEntries from "components/GroupingTagModal/search";
import Tree from "components/GroupingTagModal/Tree";
import { LexicalEntryByIds, queryLexicalEntries, queryPerspective } from "components/PerspectiveView";
import TranslationContext from "Layout/TranslationContext";

import { acceptMutation, createMutation, languageTreeSourceQuery, publishMutation, removeMutation, entityQuery } from "./graphql";

const ModalContentWrapper = styled("div")`
  min-height: 60vh;
  background-color: #fff;
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

  const getTranslation = useContext(TranslationContext);

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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
};

ViewLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired
};

const EditLink = props => {
  const { client, lexicalEntry, column, allLanguages, allDictionaries, allPerspectives, create, remove } = props;

  const getTranslation = useContext(TranslationContext);

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);

  const get_link = async entry => {
    const entity = lexicalEntry.entities.find(
      e => isEqual(e.link_id, entry.id) && isEqual(e.field_id, column.field_id)
    );

    if (!entity) return null;

    //Checking in db
    const result = await client.query({
      query: entityQuery,
      variables: { id: entity.id },
      fetchPolicy: 'cache-first'
    });

    if (!result.errors &&
        result.data.entity &&
        result.data.entity.marked_for_deletion === false) {
      return entity;
    }
    return null;
  }

  const actions = [
    {
      title: getTranslation("Remove"),
      action: entry => {
        get_link(entry).then(entity => {
          if (entity) remove(entity)
        });
      },
      disabled: entry => {
        get_link(entry).then(entity => !entity)
      },
      className: "lingvo-button-redder"
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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
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
  const { 
    lexicalEntry, 
    column, 
    allLanguages, 
    allDictionaries, 
    allPerspectives, 
    publish, 
    published
  } = props;

  const getTranslation = useContext(TranslationContext);

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, column.field_id));

  const label = published
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
                checked={published}
                onChange={(e, { checked }) => publish(entity, checked)}
                className="lingvo-radio-toggle"
                style={{ marginTop: "10px", marginBottom: "10px" }}
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
  return <Tab panes={panes} className="lingvo-dictionaries-tabs" />;
};

PublishLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  publish: PropTypes.func.isRequired,
  published: PropTypes.bool.isRequired
};

const ContributionsLink = props => {
  const { lexicalEntry, column, allLanguages, allDictionaries, allPerspectives, accept } = props;

  const getTranslation = useContext(TranslationContext);

  const tree = buildTree(lexicalEntry, column, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.entities.find(e => isEqual(e.field_id, column.field_id));

  const panes = [
    {
      menuItem: getTranslation("Contributions"),
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

    const entity = props.lexicalEntry.entities.find(e => isEqual(e.field_id, props.fieldId));
    //const [getEntity, { loading: loadingEntity, data: dataEntity }] = useLazyQuery(entityQuery);
    //if (loadingEntity) return null;

    this.state = {
      entityPublish: entity && entity.published || false
    };

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
          query: queryLexicalEntries, 
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode
          }
        }
      ]
    }).then(() => {
      this.setState({
        entityPublish: published
      });
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
      update(cache) {
        cache.evict({ id: cache.identify(entity) });
        cache.gc();
      }
      /*
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
      */
    });
  }

  render() {
    const { data, lexicalEntry, fieldId, entitiesMode, mode } = this.props;

    const {
      loading,
      error,
      languages: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives,
      perspective
    } = data;

    if (error) {
      return (
        <Message negative compact>
          {this.context("Link data loading error, please contact administrators.")}
        </Message>
      );
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

    const column =
      perspective.columns.find(c => isEqual(c.field_id, fieldId) && !!c.link_id) ||
      perspective.columns.find(c => isEqual(c.field_id, fieldId));

    const Component = getComponent(mode);

    return (
      <ModalContentWrapper>
        <Component
          lexicalEntry={lexicalEntry}
          fieldId={fieldId}
          published={this.state.entityPublish}
          column={column}
          entitiesMode={entitiesMode}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          create={this.createEntity}
          remove={this.removeEntity}
          publish={this.changePublished}
          accept={this.changeAccepted}
          client={this.props.client}
        />
      </ModalContentWrapper>
    );
  }
}

LinkModalContent.contextType = TranslationContext;

LinkModalContent.propTypes = {
  data: PropTypes.shape({
    languages: PropTypes.array,
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
  graphql(removeMutation, { name: "remove" }),
  withApollo
)(LinkModalContent);

const LinkModal = props => {
  const getTranslation = useContext(TranslationContext);
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
