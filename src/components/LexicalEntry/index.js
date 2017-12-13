import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { isEqual } from 'lodash';
import { Button } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import { queryPerspective } from 'components/PerspectiveView';

import Text from './Text';
import Sound from './Sound';
import Markup from './Markup';
import Link from './Link';
import GroupingTag from './GroupingTag';
import DirectedLink from './DirectedLink';
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
  mutation acceptEntity($id: LingvodocID!, $accepted: Boolean!) {
    update_entity(id: $id, accepted: $accepted) {
      triumph
    }
  }
`;

const getComponent = dataType =>
  ({
    Text,
    Sound,
    Markup,
    Link,
    'Grouping Tag': GroupingTag,
    'Directed Link': DirectedLink,
  }[dataType] || Unknown);

class Entities extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
    this.onCreateEntity = this.onCreateEntity.bind(this);
    this.onPublishEntity = this.onPublishEntity.bind(this);
    this.onAcceptEntity = this.onAcceptEntity.bind(this);
  }

  onCreateEntity(content) {
    const {
      perspectiveId, entry, column, entitiesMode, createEntity,
    } = this.props;

    createEntity({
      variables: { parent_id: entry.id, field_id: column.id, content },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id: perspectiveId,
            entitiesMode,
          },
        },
      ],
    }).then(() => {
      this.setState({ edit: false });
    });
  }

  onPublishEntity(entity, published) {
    const { perspectiveId, entitiesMode, publishEntity } = this.props;

    publishEntity({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id: perspectiveId,
            entitiesMode,
          },
        },
      ],
    });
  }

  onAcceptEntity(entity, accepted) {
    const { perspectiveId, entitiesMode, acceptEntity } = this.props;

    acceptEntity({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id: perspectiveId,
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
    const entities = entry.contains.filter(entity => isEqual(entity.field_id, column.id));

    if (column.data_type === 'Link' || column.data_type === 'Grouping Tag' || column.data_type === 'Directed Link') {
      const Component = getComponent(column.data_type);
      return <Component {...this.props} />;
    }

    const Component = getComponent(column.data_type);

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
            publish={this.onPublishEntity}
            remove={this.remove}
            accept={this.onAcceptEntity}
          />
        ))}
        <li className="last">
          {!this.state.edit && (
            <Button.Group basic size="mini">
              <Button icon="plus" onClick={() => this.setState({ edit: true })} disabled={mode !== 'edit'} />
            </Button.Group>
          )}

          {this.state.edit && (
            <Component.Edit onSave={this.onCreateEntity} onCancel={() => this.setState({ edit: false })} />
          )}
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
  pure,
)(Entities);

