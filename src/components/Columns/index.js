import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Dropdown, Grid, Icon, List } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { findIndex, isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import { queryPerspective } from "components/PerspectiveView";
import { openCreateFieldModal } from "ducks/fields";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

const columnsQuery = gql`
  query ColumnsQuery($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translations
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
      translations
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

const setNestedMutation = gql`
  mutation UpdateColumnMutation($id1: LingvodocID!, $perspectiveId: LingvodocID, $selfId1: LingvodocID!) {
    update_column(id: $id1, parent_id: $perspectiveId, self_id: $selfId1) {
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

const CheckboxWithMargins = styled(Checkbox)`
  margin-left: 0.5em;
  margin-right: 0.5em;
`;

const NestedColumn = ({ column, columns, fields, onChange }) => {
  const nested = columns.find(({ self_id: s }) => isEqual(column.id, s));
  const selectedValue = nested ? id2str(nested.id) : "";
  const options = columns
    .filter(c => !isEqual(c.id, column.id))
    .map(c => {
      const field = fields.find(f => isEqual(f.id, c.field_id));
      return { text: `${T(field.translations)} (${field.data_type})`, value: id2str(c.id) };
    });

  // XXX: Temporary workaround
  const getChangedField = value => {
    const newColumn = columns.find(c => isEqual(id2str(c.id), value));
    return [
      {
        ...newColumn,
        self_id: column.id
      },
      {
        ...nested,
        self_id: null
      }
    ];
  };

  return (
    <Dropdown
      selection
      search
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
  onChange: PropTypes.func.isRequired
};

class C extends React.Component {
  constructor(props) {
    super(props);
    const { column, columns } = props;
    this.state = {
      ...column,
      hasNestedField: !!columns.find(({ self_id: s }) => isEqual(column.id, s))
    };
    this.onFieldChange = this.onFieldChange.bind(this);
    this.onLinkChange = this.onLinkChange.bind(this);
    this.onNestedCheckboxChange = this.onNestedCheckboxChange.bind(this);
    this.onNestedChange = this.onNestedChange.bind(this);
  }

  onFieldChange(value) {
    const { actions, column, fields } = this.props;

    if (value === "new_field") {
      actions.openCreateFieldModal(field_id => {
        this.setState({ field_id }, () => {
          this.update(column, field_id, column.link_id);
        });
      });

      return;
    }

    const field = fields.find(f => id2str(f.id) === value);
    if (field) {
      this.setState({ field_id: field.id }, () => {
        this.update(column, field.id, column.link_id);
      });
    }
  }

  onLinkChange(value) {
    const { column, perspectives } = this.props;
    const perspective = perspectives.find(p => id2str(p.id) === value);
    this.setState({ link_id: perspective.id }, () => {
      this.update(column, column.field_id, perspective.id);
    });
  }

  onNestedCheckboxChange(checked) {
    this.setState({ hasNestedField: checked });

    // If we disable selected nested column, we should unlink it.

    if (!checked) {
      const { column, columns, setNested } = this.props;

      const nested = columns.find(({ self_id: s }) => isEqual(column.id, s));

      if (nested) {
        setNested({
          variables: {
            id1: nested.id,
            selfId1: [-1, -1],
            perspectiveId: column.parent_id
          },
          refetchQueries: [
            {
              query: columnsQuery,
              variables: {
                perspectiveId: column.parent_id
              }
            },
            {
              query: queryPerspective,
              variables: {
                id: column.parent_id
              }
            }
          ]
        });
      }
    }
  }

  onNestedChange(nested) {
    const { column, setNested, updateNested } = this.props;
    (nested[1].id ? updateNested : setNested)({
      variables: {
        id1: nested[0].id,
        id2: nested[1].id,
        selfId1: nested[0].self_id ? nested[0].self_id : [0, 0],
        selfId2: nested[1].self_id ? nested[1].self_id : [0, 0],
        parentId: column.parent_id
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: column.parent_id
          }
        },
        {
          query: queryPerspective,
          variables: {
            id: column.parent_id
          }
        }
      ]
    });
  }

  update = (column, fieldId, linkId) => {
    this.props.updateColumn({
      variables: {
        id: column.id,
        parentId: column.parent_id,
        fieldId,
        pos: column.position,
        linkId
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: column.parent_id
          }
        },
        {
          query: queryPerspective,
          variables: {
            id: column.parent_id
          }
        }
      ]
    });
  };

  render() {
    const { column, columns, fields, perspectives } = this.props;

    const field = fields.find(f => isEqual(f.id, this.state.field_id));
    const options = fields.map(f => ({ text: `${T(f.translations)} (${f.data_type})`, value: id2str(f.id) }));

    options.push({
      text: `${this.context("Add new field")}...`,
      value: "new_field"
    });

    const availablePerspectives = perspectives.map(p => ({ text: T(p.translations), value: id2str(p.id) }));
    const currentField = id2str(this.state.field_id);

    return (
      <span>
        <Dropdown
          selection
          search
          value={currentField}
          options={options}
          onChange={(a, { value }) => this.onFieldChange(value)}
          disabled={!field}
          loading={!field}
        />
        {field && field.data_type === "Link" && (
          <Dropdown
            selection
            search
            defaultValue={this.state.link_id ? id2str(this.state.link_id) : null}
            options={availablePerspectives}
            onChange={(a, { value }) => this.onLinkChange(value)}
          />
        )}
        {field &&
          field.data_type !== "Link" &&
          field.data_type !== "Directed Link" &&
          field.data_type !== "Grouping Tag" && (
            <CheckboxWithMargins
              defaultChecked={this.state.hasNestedField}
              onChange={(e, { checked }) => this.onNestedCheckboxChange(checked)}
              label={this.context("has linked field")}
            />
          )}
        {this.state.hasNestedField && (
          <NestedColumn column={column} columns={columns} fields={fields} onChange={d => this.onNestedChange(d)} />
        )}
      </span>
    );
  }
}

C.contextType = TranslationContext;

C.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  updateColumn: PropTypes.func.isRequired,
  setNested: PropTypes.func.isRequired,
  updateNested: PropTypes.func.isRequired
};

const Column = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ openCreateFieldModal }, dispatch)
  })),
  graphql(updateColumnMutation, { name: "updateColumn" }),
  graphql(setNestedMutation, { name: "setNested" }),
  graphql(updateNestedMutation, { name: "updateNested" })
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
    const swapColumnIndex = direction === "up" ? columnIndex - 1 : columnIndex + 1;

    if (swapColumnIndex >= 0 && swapColumnIndex < columns.length) {
      const swapColumn = columns[swapColumnIndex];
      updatePosition({
        variables: {
          id1: column.id,
          id2: swapColumn.id,
          pos1: swapColumn.position,
          pos2: column.position,
          perspectiveId
        },
        refetchQueries: [
          {
            query: columnsQuery,
            variables: {
              perspectiveId
            }
          }
        ]
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
        //.filter(c => !c.self_id)
        .map(c => c.position)
        .reduce((x, y) => (x > y ? x : y), 1) + 1;

    createColumn({
      variables: {
        parentId: perspective.id,
        fieldId: field.id,
        pos,
        linkId: null,
        selfId: null
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId: perspective.id
          }
        },
        {
          query: queryPerspective,
          variables: {
            id: perspective.id
          }
        }
      ]
    });
  }

  onRemove(column) {
    const { perspectiveId, removeColumn } = this.props;
    removeColumn({
      variables: {
        id: column.id
      },
      refetchQueries: [
        {
          query: columnsQuery,
          variables: {
            perspectiveId
          }
        },
        {
          query: queryPerspective,
          variables: {
            id: perspectiveId
          }
        }
      ]
    });
  }

  render() {
    const { data, perspectives } = this.props;
    const { loading, error } = data;

    if (error) {
      return null;
    } else if (loading) {
      return (
        <div style={{ textAlign: "center" }}>
          <div>
            <Icon name="spinner" size="big" loading />
          </div>
          <div style={{ marginTop: "0.5em" }}>{`${this.context("Loading")}...`}</div>
        </div>
      );
    }

    const {
      perspective: { columns },
      all_fields: allFields
    } = data;

    return (
      <div>
        <List divided relaxed>
          {columns
            .filter(column => !column.self_id)
            .map(column => (
              <List.Item key={column.id}>
                <Grid centered columns={2}>
                  <Grid.Column width={11}>
                    <Column column={column} columns={columns} fields={allFields} perspectives={perspectives} />
                  </Grid.Column>
                  <Grid.Column width={1}>
                    <Button.Group icon>
                      <Button basic icon="caret up" onClick={() => this.onChangePos(column, columns, "up")} />
                      <Button basic icon="caret down" onClick={() => this.onChangePos(column, columns, "down")} />
                      <Button negative icon="cancel" onClick={() => this.onRemove(column)} />
                    </Button.Group>
                  </Grid.Column>
                </Grid>
              </List.Item>
            ))}
        </List>

        <Button
          basic
          content={this.context("Add new column")}
          onClick={() => this.onCreate(allFields.find(f => f.data_type === "Text"))}
        />
      </div>
    );
  }
}

Columns.contextType = TranslationContext;

Columns.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  createColumn: PropTypes.func.isRequired,
  removeColumn: PropTypes.func.isRequired,
  updatePosition: PropTypes.func.isRequired
};

export default compose(
  onlyUpdateForKeys(["data"]),
  graphql(columnsQuery),
  graphql(createColumnMutation, { name: "createColumn" }),
  graphql(removeColumnMutation, { name: "removeColumn" }),
  graphql(updatePositionMutation, { name: "updatePosition" })
)(Columns);
