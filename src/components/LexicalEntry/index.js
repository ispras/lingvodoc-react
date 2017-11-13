import React from 'react';
import PropTypes from 'prop-types';
import { graphql, gql } from 'react-apollo';
import { isEqual } from 'lodash';
import { Button } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import { query as queryPerspective } from 'components/PerspectiveView';

import Text from './Text';
import Sound from './Sound';
import Markup from './Markup';
import Link from './Link';
import GroupingTag from './GroupingTag';
import Unknown from './Unknown';
import Empty from './Empty';

const createEntityMutation = gql`
  mutation createEntity($parent_id: LingvodocID!, $field_id: LingvodocID!, $content: String) {
    create_entity(parent_id: $parent_id, field_id: $field_id, content: $content) {
      triumph
    }
  }
`;

const publishEntityMutation = gql`
  mutation createEntity($parent_id: LingvodocID!, $field_id: LingvodocID!, $content: String) {
    create_entity(parent_id: $parent_id, field_id: $field_id, content: $content) {
      triumph
    }
  }
`;

const acceptEntityMutation = gql`
  mutation createEntity($parent_id: LingvodocID!, $field_id: LingvodocID!, $content: String) {
    create_entity(parent_id: $parent_id, field_id: $field_id, content: $content) {
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
  }[dataType] || Unknown);

class Entities extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
    };
    this.onCreateEntity = this.onCreateEntity.bind(this);
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

  render() {
    const {
      perspectiveId, entry, column, columns, mode, entitiesMode, parentEntity,
    } = this.props;
    const entities = entry.contains.filter(entity => isEqual(entity.field_id, column.id));

    if (column.data_type === 'Link' || column.data_type === 'Grouping Tag') {
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
          />
        ))}
        <li className="last">
          {!this.state.edit && (
            <Button.Group basic size="mini">
              <Button icon="plus" onClick={() => this.setState({ edit: true })} />
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
  createEntity: PropTypes.func,
  publishEntity: PropTypes.func,
  acceptEntity: PropTypes.func,
};

Entities.defaultProps = {
  parentEntity: null,
  createEntity: () => {},
  publishEntity: () => {},
  acceptEntity: () => {},
};

// split graphql wrappers into 3 parts because React Hot Loader doesn't work so well
// with nested calls like graphql(graphql(graphql(...)))
const e1 = graphql(publishEntityMutation, { name: 'publishEntity' })(Entities);
const e2 = graphql(acceptEntityMutation, { name: 'acceptEntity' })(e1);
const e3 = graphql(createEntityMutation, { name: 'createEntity' })(e2);

export default e3;
