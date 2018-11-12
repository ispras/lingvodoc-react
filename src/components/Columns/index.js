import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys } from 'recompose';
import { isEqual, findIndex } from 'lodash';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, List, Dropdown, Grid, Checkbox } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';
import { getTranslation } from 'api/i18n';

const columnsQuery = gql`
  query ColumnsQuery($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translation
      columns {
        id
        parent_id
        field_id
        self_id
        link_id
        marked_for_deletion
        position
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
    $parentId: LingvodocID!
    $fieldId: LingvodocID!
    $pos: Int!
    $linkId: LingvodocID
    $selfId: LingvodocID
  ) {
    create_column(parent_id: $parentId, field_id: $fieldId, position: $pos, link_id: $linkId, self_id: $selfId) {
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

const updateColumnMutation = gql`
  mutation UpdateColumnMutation(
    $id: LingvodocID!
    $parentId: LingvodocID!
    $fieldId: LingvodocID!
    $pos: Int!
    $linkId: LingvodocID
  ) {
    update_column(id: $id, parent_id: $parentId, field_id: $fieldId, position: $pos, link_id: $linkId) {
      triumph
    }
  }
`;

const updatePositionMutation = gql`
  mutation UpdateColumnMutation(
    $id1: LingvodocID!
    $id2: LingvodocID!
    $perspectiveId: LingvodocID
    $pos1: Int!
    $pos2: Int!
  ) {
    updatePos1: update_column(id: $id1, parent_id: $perspectiveId, position: $pos1) {
      triumph
    }
    updatePos2: update_column(id: $id2, parent_id: $perspectiveId, position: $pos2) {
      triumph
    }
  }
`;

const updateNestedMutation = gql`
  mutation UpdateColumnMutation(
    $id1: LingvodocID!
    $id2: LingvodocID!
    $perspectiveId: LingvodocID
    $selfId1: LingvodocID!
    $selfId2: LingvodocID!
  ) {
    updatePos1: update_column(id: $id1, parent_id: $perspectiveId, self_id: $selfId1) {
      triumph
    }
    updatePos2: update_column(id: $id2, parent_id: $perspectiveId, self_id: $selfId2) {
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

NestedColumn.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
};

class C extends React.Component {
  constructor(props) {
    super(props);
    const { column, columns } = props;
    this.state = {
      ...column,
      hasNestedField: !!columns.find(({ self_id: s }) => isEqual(column.id, s)),
    };
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onLinkChange = this.onLinkChange.bind(this);
    this.onNestedChange = this.onNestedChange.bind(this);
  }

  onFieldChange(value) {
    const { column, fields } = this.props;
    const field = fields.find(f => compositeIdToString(f.id) === value);
    if (field) {
      this.setState({ field_id: field.id }, () => {
        this.update(column, field.id, column.link_id);
      });
    }
  }

  onLinkChange(value) {
    const { column, perspectives } = this.props;
    const perspective = perspectives.find(p => compositeIdToString(p.id) === value);
    this.setState({ link_id: perspective.id }, () => {
      this.update(column, column.field_id, perspective.id);
    });
  }

  onNestedChange(nested) {
    const { column, updateNested } = this.props;
    updateNested({
      variables: {
        id1: nested[0].id,
        id2: nested[1].id,
        selfId1: nested[0].self_id,
        selfId2: nested[1].self_id,
        parentId: column.parent_id,
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: column.parent_id,
          },
        },
      ],
    });
  }

  update = (column, fieldId, linkId) => {
    this.props.updateColumn({
      variables: {
        id: column.id,
        parentId: column.parent_id,
        fieldId,
        pos: column.position,
        linkId,
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: column.parent_id,
          },
        },
      ],
    });
  };

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
              defaultValue={this.state.link_id ? compositeIdToString(this.state.link_id) : null}
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
              onChange={(e, { checked }) => this.setState({ hasNestedField: checked })}
              label={getTranslation("has linked field")}
            />
          )}
        {this.state.hasNestedField && (
          <NestedColumn column={column} columns={columns} fields={fields} onChange={d => this.onNestedChange(d)} />
        )}
      </span>
    );
  }
}

C.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  updateColumn: PropTypes.func.isRequired,
  updateNested: PropTypes.func.isRequired,
};

const Column = compose(
  graphql(updateColumnMutation, { name: 'updateColumn' }),
  graphql(updateNestedMutation, { name: 'updateNested' })
)(C);

class Columns extends React.Component {
  constructor(props) {
    super(props);
    this.onChangePos = this.onChangePos.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onChangePos(column, columns, direction) {
    const { perspectiveId, updatePosition } = this.props;

    const columnIndex = findIndex(columns, c => isEqual(c.id, column.id));
    const swapColumnIndex = direction === 'up' ? columnIndex - 1 : columnIndex + 1;

    if (swapColumnIndex >= 0 && swapColumnIndex < columns.length) {
      const swapColumn = columns[swapColumnIndex];
      updatePosition({
        variables: {
          id1: column.id,
          id2: swapColumn.id,
          pos1: swapColumn.position,
          pos2: column.position,
          perspectiveId,
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
  }

  onCreate(field) {
    const { createColumn, data } = this.props;
    const { perspective } = data;
    const { columns } = perspective;

    // calculate next position
    const pos =
      columns
        .filter(c => !c.self_id)
        .map(c => c.position)
        .reduce((x, y) => (x > y ? x : y), 1) + 1;

    createColumn({
      variables: {
        // id: perspective.id,
        // parentId: perspective.parentId,
        parentId: perspective.id,
        fieldId: field.id,
        pos,
        linkId: null,
        selfId: null,
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
          {columns.filter(column => !column.self_id).map(column => (
            <List.Item key={column.id}>
              <Grid centered columns={2}>
                <Grid.Column width={11}>
                  <Column column={column} columns={columns} fields={allFields} perspectives={perspectives} />
                </Grid.Column>
                <Grid.Column width={1}>
                  <Button.Group icon>
                    <Button basic icon="caret up" onClick={() => this.onChangePos(column, columns, 'up')} />
                    <Button basic icon="caret down" onClick={() => this.onChangePos(column, columns, 'down')} />
                    <Button negative icon="cancel" onClick={() => this.onRemove(column)} />
                  </Button.Group>
                </Grid.Column>
              </Grid>
            </List.Item>
          ))}
        </List>

        <Button
          basic
          content={getTranslation("Add new column")}
          onClick={() => this.onCreate(allFields.find(f => f.data_type === 'Text'))}
        />
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
  updatePosition: PropTypes.func.isRequired,
};

export default compose(
  onlyUpdateForKeys(['data']),
  graphql(columnsQuery),
  graphql(createColumnMutation, { name: 'createColumn' }),
  graphql(removeColumnMutation, { name: 'removeColumn' }),
  graphql(updatePositionMutation, { name: 'updatePosition' })
)(Columns);
