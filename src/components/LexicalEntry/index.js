import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { isEqual } from 'lodash';
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
  mutation createEntity($parent_id: LingvodocID!, $field_id: LingvodocID!, $content: String) {
    create_entity(parent_id: $parent_id, field_id: $field_id, content: $content) {
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
  }

  create(content) {
    const {
      entry, column, entitiesMode, createEntity,
    } = this.props;

    createEntity({
      variables: { parent_id: entry.id, field_id: column.id, content },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode,
          },
        },
      ],
    }).then(() => {
      this.setState({ edit: false });
    });
  }

  publish(entity, published) {
    const { entry, entitiesMode, publishEntity } = this.props;

    publishEntity({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode,
          },
        },
      ],
    });
  }

  accept(entity, accepted) {
    const { entry, entitiesMode, acceptEntity } = this.props;

    acceptEntity({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode,
          },
        },
      ],
    });
  }

  remove(entity) {
    const { entry, entitiesMode, removeEntity } = this.props;
    removeEntity({
      variables: { id: entity.id },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode,
          },
        },
      ],
    });
  }

  render() {
    const {
      perspectiveId, entry, column, columns, mode, entitiesMode, parentEntity,
    } = this.props;
    const entities = entry.entities.filter(entity => isEqual(entity.field_id, column.id));

    const Component = getComponent(column.data_type);
    if (column.data_type === 'Link' || column.data_type === 'Grouping Tag' || column.data_type === 'Directed Link') {
      return <Component {...this.props} />;
    }

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
          />
        ))}
        <li className="last">
          {!this.state.edit && (
            <Button.Group basic size="mini">
              <Button icon="plus" onClick={() => this.setState({ edit: true })} disabled={mode !== 'edit'} />
            </Button.Group>
          )}

          {this.state.edit && <Component.Edit onSave={this.create} onCancel={() => this.setState({ edit: false })} />}
        </li>
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
};

Entities.defaultProps = {
  parentEntity: null,
};

export default compose(
  graphql(publishEntityMutation, { name: 'publishEntity' }),
  graphql(acceptEntityMutation, { name: 'acceptEntity' }),
  graphql(createEntityMutation, { name: 'createEntity' }),
  graphql(removeEntityMutation, { name: 'removeEntity' }),
  pure
)(Entities);
