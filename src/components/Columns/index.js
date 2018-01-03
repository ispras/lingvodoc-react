import React from 'react';
import PropTypes from 'prop-types';
import { compose, withReducer, onlyUpdateForKeys } from 'recompose';
import Immutable, { fromJS } from 'immutable';
import { isEqual } from 'lodash';
import { gql, graphql } from 'react-apollo';
import { Message, Button, Step, Header, Segment, List, Dropdown, Grid, Checkbox } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import uuid from 'utils/uuid';

const columnsQuery = gql`
  query ColumnsQuery($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translation
      columns {
        id
        field_id
        self_id
        link_id
        marked_for_deletion
      }
    }
    all_fields {
      id
      translation
      data_type
    }
  }
`;

const createColumnMutation = gql`
  mutation CreateColumnMutation(
    $id: LingvodocID!
    $parentId: LingvodocID!
    $fieldId: LingvodocID!
    $pos: Int!
    $linkId: LingvodocID
    $selfId: LingvodocID
  ) {
    create_column(
      id: $id
      parent_id: $parentId
      field_id: $fieldId
      position: $pos
      link_id: $linkId
      self_id: $selfId
    ) {
      triumph
    }
  }
`;

const removeColumnMutation = gql`
  mutation RemoveColumnMutation($id: LingvodocID!) {
    delete_column(id: $id) {
      triumph
    }
  }
`;

const NestedColumn = ({
  column, columns, fields, onChange,
}) => {
  const nested = columns.find(({ self_id: s }) => isEqual(column.id, s));
  const selectedValue = nested ? compositeIdToString(nested.id) : '';
  const options = columns.filter(c => !isEqual(c.id, column.id)).map((c) => {
    const field = fields.find(f => isEqual(f.id, c.field_id));
    return { text: field.translation, value: compositeIdToString(c.id) };
  });

  // XXX: Temporary workaround
  const getChangedField = (value) => {
    const newColumn = columns.find(c => isEqual(compositeIdToString(c.id), value));
    return [
      {
        ...newColumn,
        self_id: column.id,
      },
      {
        ...nested,
        self_id: null,
      },
    ];
  };

  return (
    <Dropdown
      selection
      defaultValue={selectedValue}
      options={options}
      onChange={(a, { value }) => onChange(getChangedField(value))}
    />
  );
};

class Column extends React.Component {
  constructor(props) {
    super(props);
    const { column, columns } = props;
    this.state = {
      ...column,
      hasNestedField: !!columns.find(({ self_id: s }) => isEqual(column.id, s)),
    };
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onLinkChange = this.onLinkChange.bind(this);
    this.onHasNestedFieldChange = this.onHasNestedFieldChange.bind(this);
  }

  onFieldChange(value) {
    const { fields } = this.props;
    const field = fields.find(f => compositeIdToString(f.id) === value);
    if (field) {
      this.setState({ field_id: field.id });
    }
  }

  onLinkChange(value) {
    const { perspectives } = this.props;
    const perspective = perspectives.find(p => compositeIdToString(p.id) === value);
    this.setState({ link_id: perspective.id });
  }

  onHasNestedFieldChange(hasNestedField) {
    this.setState({ hasNestedField });
  }

  onChange(column) {
    this.props.onChange(column);
  }

  render() {
    const {
      column, columns, fields, perspectives,
    } = this.props;

    const field = fields.find(f => isEqual(f.id, column.field_id));
    const options = fields.map(f => ({ text: f.translation, value: compositeIdToString(f.id) }));
    const availablePerspectives = perspectives.map(p => ({ text: p.translation, value: compositeIdToString(p.id) }));
    const currentField = compositeIdToString(field.id);

    return (
      <span>
        <Dropdown
          selection
          defaultValue={currentField}
          options={options}
          onChange={(a, { value }) => this.onFieldChange(value)}
        />
        {field &&
          field.data_type === 'Link' && (
            <Dropdown
              selection
              defaultValue={compositeIdToString(this.state.link_id)}
              options={availablePerspectives}
              onChange={(a, { value }) => this.onLinkChange(value)}
            />
          )}
        {field &&
          field.data_type !== 'Link' &&
          field.data_type !== 'Directed Link' &&
          field.data_type !== 'Grouping Tag' && (
            <Checkbox
              defaultChecked={this.state.hasNestedField}
              onChange={(e, { checked }) => this.onHasNestedFieldChange(checked)}
              label="has linked field"
            />
          )}
        {this.state.hasNestedField && (
          <NestedColumn column={column} columns={columns} fields={fields} onChange={d => console.log(d)} />
        )}
      </span>
    );
  }
}

Column.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
};

class Columns extends React.Component {
  constructor(props) {
    super(props);
    this.onChangePos = this.onChangePos.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onChangePos(column, direction) {
    // to
  }

  onCreate(column) {
    const { createColumn, data } = this.props;
    const { perspective } = data;
    const { columns } = perspective;

    const pos = columns.map(c => c.pos).reduce((x, y) => (x > y ? x : y)) + 1;

    createColumn({
      variables: {
        id: perspective.id,
        parentId: perspective.parent_id,
        fieldId: column.field_id,
        pos,
        linkId: 1,
        selfId: 1,
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: perspective.id,
          },
        },
      ],
    });
  }

  onRemove(column) {
    const { perspectiveId, removeColumn } = this.props;
    removeColumn({
      variables: {
        id: column.id,
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId,
          },
        },
      ],
    });
  }

  render() {
    const { data, perspectives } = this.props;
    const { loading, error } = data;

    if (loading || error) {
      return null;
    }

    const { perspective: { columns }, all_fields: allFields } = data;

    return (
      <div>
        <List divided relaxed>
          {columns.map(column => (
            <List.Item key={column.id}>
              <Grid centered columns={2}>
                <Grid.Column width={11}>
                  <Column column={column} columns={columns} fields={allFields} perspectives={perspectives} />
                </Grid.Column>
                <Grid.Column width={1}>
                  <Button.Group icon>
                    <Button basic icon="caret up" onClick={() => this.changePos(column, 'up')} />
                    <Button basic icon="caret down" onClick={() => this.changePos(column, 'down')} />
                    <Button negative icon="cancel" />
                  </Button.Group>
                </Grid.Column>
              </Grid>
            </List.Item>
          ))}
        </List>

        <Button basic />
      </div>
    );
  }
}

Columns.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  createColumn: PropTypes.func.isRequired,
  removeColumn: PropTypes.func.isRequired,
};

export default compose(
  onlyUpdateForKeys(['data']),
  graphql(columnsQuery),
  graphql(createColumnMutation, { name: 'createColumn' }),
  graphql(removeColumnMutation, { name: 'removeColumn' })
)(Columns);
