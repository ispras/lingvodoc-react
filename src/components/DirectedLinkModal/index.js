import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Checkbox, Button, Modal, Tab } from 'semantic-ui-react';
import { closeModal } from 'ducks/directedLink';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { queryPerspective, LexicalEntryViewByIds } from 'components/PerspectiveView';
import buildPartialLanguageTree from 'components/GroupingTagModal/partialTree';
import Tree from 'components/GroupingTagModal/Tree';
import SearchLexicalEntries from 'components/GroupingTagModal/search';
import { languageTreeSourceQuery, createMutation, publishMutation, acceptMutation, removeMutation } from './graphql';

const ModalContentWrapper = styled('div')`min-height: 60vh;`;

function buildTree(lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives) {
  const entities = lexicalEntry.contains.filter(e => isEqual(e.field_id, fieldId));
  const lexicalEntries = entities.map(e => ({ id: e.link_id, parent_id: e.additional_metadata.link_perspective_id }));

  return buildPartialLanguageTree({
    lexicalEntries,
    allLanguages,
    allDictionaries,
    allPerspectives,
  });
}

const ViewDirectedLink = (props) => {
  const {
    lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives,
  } = props;

  const tree = buildTree(lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives);

  const panes = [
    {
      menuItem: 'View',
      render: () => (
        <div>
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryViewByIds} />;
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

ViewDirectedLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
};

const EditDirectedLink = (props) => {
  const {
    lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, create, remove,
  } = props;

  const tree = buildTree(lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives);

  const actions = [{ title: 'Remove', action: entry => remove(entry) }];

  const panes = [
    {
      menuItem: 'View',
      render: () => (
        <div>
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryViewByIds} actions={actions} />;
          </Segment>
        </div>
      ),
    },
    {
      menuItem: 'Add link',
      render: () => (
        <SearchLexicalEntries
          lexicalEntry={lexicalEntry}
          fieldId={fieldId}
          allLanguages={allLanguages}
          allDictionaries={allDictionaries}
          allPerspectives={allPerspectives}
          joinGroup={create}
        />
      ),
    },
  ];
  return <Tab panes={panes} />;
};

EditDirectedLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  create: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

const PublishDirectedLink = (props) => {
  const {
    lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, publish,
  } = props;

  const tree = buildTree(lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.contains.find(e => isEqual(e.field_id, fieldId));
  const label = entity.published
    ? 'The entity is currently published. Click to unpublish.'
    : 'The entity is NOT currently published. Click to publish.';

  const panes = [
    {
      menuItem: 'Publish',
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Checkbox
                toggle
                label={label}
                defaultChecked={entity.published}
                onChange={(e, { checked }) => publish(entity, checked)}
              />
            </Segment>
          )}
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryViewByIds} />;
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

PublishDirectedLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  publish: PropTypes.func.isRequired,
};

const ContributionsDirectedLink = (props) => {
  const {
    lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives, accept,
  } = props;

  const tree = buildTree(lexicalEntry, fieldId, allLanguages, allDictionaries, allPerspectives);
  const entity = lexicalEntry.contains.find(e => isEqual(e.field_id, fieldId));

  const panes = [
    {
      menuItem: 'Contributions',
      render: () => (
        <div>
          {entity && (
            <Segment>
              <Button positive onClick={() => accept(entity, true)} content="Accept" />
            </Segment>
          )}
          <Segment padded="very" textAlign="center">
            <Tree resultsTree={tree} TableComponent={LexicalEntryViewByIds} />;
          </Segment>
        </div>
      ),
    },
  ];
  return <Tab panes={panes} />;
};

ContributionsDirectedLink.propTypes = {
  lexicalEntry: PropTypes.object.isRequired,
  fieldId: PropTypes.array.isRequired,
  allLanguages: PropTypes.array.isRequired,
  allDictionaries: PropTypes.array.isRequired,
  allPerspectives: PropTypes.array.isRequired,
  accept: PropTypes.func.isRequired,
};

const getComponent = (mode) => {
  switch (mode) {
    case 'edit':
      return EditDirectedLink;
    case 'view':
      return ViewDirectedLink;
    case 'publish':
      return PublishDirectedLink;
    case 'contributions':
      return ContributionsDirectedLink;
    default:
      return <Segment negative>Mode {mode} not supported</Segment>;
  }
};

class DirectedLinkModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.createEntity = this.createEntity.bind(this);
    this.changePublished = this.changePublished.bind(this);
    this.changeAccepted = this.changeAccepted.bind(this);
    this.removeEntity = this.removeEntity.bind(this);
  }

  createEntity(targetLexicalEntry) {
    const {
      create, lexicalEntry, entitiesMode, fieldId,
    } = this.props;

    create({
      variables: {
        parent_id: lexicalEntry.id,
        field_id: fieldId,
        linkId: targetLexicalEntry.id,
        linkPerspectiveId: targetLexicalEntry.parent_id,
      },
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
    const { accept, lexicalEntry, entitiesMode } = this.props;

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
      ],
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
            entitiesMode,
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
          <Modal.Header>Directed Link {lexicalEntry.id}</Modal.Header>
          <Modal.Content>
            <ModalContentWrapper>
              <Component
                lexicalEntry={lexicalEntry}
                fieldId={fieldId}
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
          </Modal.Content>
          <Modal.Actions>
            <Button icon="minus" content="Cancel" onClick={this.props.closeModal} />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

DirectedLinkModal.propTypes = {
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
  create: PropTypes.func.isRequired,
  publish: PropTypes.func.isRequired,
  accept: PropTypes.func.isRequired,
  remove: PropTypes.func.isRequired,
};

DirectedLinkModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

export default compose(
  connect(state => state.directedLink, dispatch => bindActionCreators({ closeModal }, dispatch)),
  graphql(languageTreeSourceQuery),
  graphql(createMutation, { name: 'create' }),
  graphql(publishMutation, { name: 'publish' }),
  graphql(acceptMutation, { name: 'accept' }),
  graphql(removeMutation, { name: 'remove' })
)(DirectedLinkModal);
