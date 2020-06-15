import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isEqual, filter, flow } from 'lodash';
import { Button } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';

import Text from './Text';
import Sound from './Sound';
import Markup from './Markup';
import Link from './Link';
import Image from './Image';
import GroupingTag from './GroupingTag';
import Unknown from './Unknown';

const createEntityMutation = gql`
  mutation createEntity($parent_id: LingvodocID!, $field_id: LingvodocID!, $self_id : LingvodocID, $content: String, $file_content: Upload) {
    create_entity(parent_id: $parent_id, field_id: $field_id, self_id: $self_id, content: $content, file_content: $file_content) {
      triumph
    }
  }
`;

const publishEntityMutation = gql`
  mutation publishEntity($id: LingvodocID!, $published: Boolean!) {
    update_entity(id: $id, published: $published) {
      triumph
    }
  }
`;

const acceptEntityMutation = gql`
  mutation acceptEntity($id: LingvodocID!, $accepted: Boolean!) {
    update_entity(id: $id, accepted: $accepted) {
      triumph
    }
  }
`;

const removeEntityMutation = gql`
  mutation removeEntity($id: LingvodocID!) {
    delete_entity(id: $id) {
      triumph
    }
  }
`;

const updateEntityMutation = gql`
  mutation updateEntity($id: LingvodocID!, $content: String!) {
    update_entity_content(id: $id, content: $content) {
      triumph
    }
  }
`;


const lexicalEntryQuery = gql`
  query LexicalEntryQuery($id: LingvodocID!, $entitiesMode: String!) {
    lexicalentry(id: $id) {
      id
      parent_id
      created_at
      entities(mode: $entitiesMode) {
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

const getComponent = dataType =>
  ({
    Text,
    Sound,
    Markup,
    Link,
    Image,
    'Grouping Tag': GroupingTag,
    'Directed Link': Link,
  }[dataType] || Unknown);

class Entities extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
    this.create = this.create.bind(this);
    this.publish = this.publish.bind(this);
    this.accept = this.accept.bind(this);
    this.remove = this.remove.bind(this);
    this.update = this.update.bind(this);
  }

  create(content, self_id) {
    const {
      entry, column, createEntity,
    } = this.props;

    const variables = { parent_id: entry.id, field_id: column.id }
    if (content instanceof File) {
      variables.content = null;
      variables.file_content = content;
    } else {
      variables.content = content;
      variables.file_content = null;
    }
    if (self_id) {
      variables.self_id = self_id;
    }

    createEntity({
      variables,
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'all',
          },
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'published',
          },
        },
      ],
    }).then(() => {
      this.setState({ edit: false });
    });
  }

  publish(entity, published) {
    const { entry, publishEntity } = this.props;

    publishEntity({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'all',
          },
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'published',
          },
        },
      ],
    });
  }

  accept(entity, accepted) {
    const { entry, acceptEntity } = this.props;

    acceptEntity({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'all',
          },
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'published',
          },
        },
      ],
    });
  }

  remove(entity) {
    const { entry, removeEntity } = this.props;
    removeEntity({
      variables: { id: entity.id },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'all',
          },
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'published',
          },
        },
      ],
    });
  }

  update(entity, content) {
    const { entry, updateEntity } = this.props;
    updateEntity({
      variables: { id: entity.id, content },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'all',
          },
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: 'published',
          },
        },
      ],
    });
  }


  render() {
    const {
      perspectiveId, entry, column, columns, mode, entitiesMode, parentEntity, disabled,
    } = this.props;

    const Component = getComponent(column.data_type);
    if (column.data_type === 'Link' || column.data_type === 'Grouping Tag' || column.data_type === 'Directed Link') {
      return <Component {...this.props} />;
    }

    const filters = [
      ens => ens.filter(entity => isEqual(entity.field_id, column.id)),
      ens => (!parentEntity ? ens : ens.filter(e => isEqual(e.self_id, parentEntity.id))),
    ];
    const entities = flow(filters)(entry.entities);

    return (
      <ul>
        {entities.map(entity => (
          <Component
            key={compositeIdToString(entity.id)}
            perspectiveId={perspectiveId}
            as="li"
            column={column}
            columns={columns}
            entry={entry}
            entity={entity}
            mode={mode}
            entitiesMode={entitiesMode}
            parentEntity={parentEntity}
            publish={this.publish}
            remove={this.remove}
            accept={this.accept}
            update={this.update}
            className={(mode != 'edit' && entities.indexOf(entity) == entities.length - 1) ? 'last' : ''}
            disabled={disabled}
          />
        ))}
        {mode == 'edit' && (
          <li className="last">
            {!this.state.edit && (
              <Button.Group basic size="mini">
                <Button icon="plus" onClick={() => this.setState({ edit: true })} />
              </Button.Group>
            )}

            {this.state.edit && <Component.Edit onSave={content => this.create(content, parentEntity == null ? null : parentEntity.id)} onCancel={() => this.setState({ edit: false })} />}
          </li>
        )}
      </ul>
    );
  }
}

Entities.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  parentEntity: PropTypes.object,
  entitiesMode: PropTypes.string.isRequired,
  createEntity: PropTypes.func.isRequired,
  publishEntity: PropTypes.func.isRequired,
  acceptEntity: PropTypes.func.isRequired,
  removeEntity: PropTypes.func.isRequired,
  updateEntity: PropTypes.func.isRequired,
};

Entities.defaultProps = {
  parentEntity: null,
};

export default compose(
  graphql(publishEntityMutation, { name: 'publishEntity' }),
  graphql(acceptEntityMutation, { name: 'acceptEntity' }),
  graphql(createEntityMutation, { name: 'createEntity' }),
  graphql(removeEntityMutation, { name: 'removeEntity' }),
  graphql(updateEntityMutation, { name: 'updateEntity' }),
  pure
)(Entities);
