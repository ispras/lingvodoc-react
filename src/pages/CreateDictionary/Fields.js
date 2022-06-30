import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Dropdown, Grid, Icon, List } from "semantic-ui-react";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import { openCreateFieldModal } from "ducks/fields";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";
import { uuidv4 as uuid } from "utils/uuid";

import { allFieldsQuery, corpusTemplateFieldsQuery } from "./graphql";

const CheckboxWithMargins = styled(Checkbox)`
  margin-left: 0.5em;
  margin-right: 0.5em;
`;

const NestedColumn = ({ column, columns, fields, onChange }) => {
  const nested = columns.find(({ self_id: s }) => column.id === s);

  const options = columns
    .filter(c => !isEqual(c.id, column.id))
    .map(c => {
      const field = fields.find(f => isEqual(f.id, c.field_id));
      return { text: T(field.translations), value: c.id };
    });

  return (
    <Dropdown
      selection
      search
      options={options}
      value={nested ? nested.id : null}
      onChange={(a, { value }) => onChange(value, nested ? nested.id : null)}
    />
  );
};

NestedColumn.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired
};

class Column extends React.Component {
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
    const { actions, fields, onChange } = this.props;

    if (value === "new_field") {
      actions.openCreateFieldModal(field_id => {
        this.setState({ field_id }, () => onChange(this.state));
      });

      return;
    }

    const field = fields.find(f => id2str(f.id) === value);
    if (field) {
      this.setState(
        {
          field_id: field.id
        },
        () => onChange(this.state)
      );
    }
  }

  onLinkChange(value) {
    const { onChange } = this.props;
    this.setState(
      {
        link_id: value
      },
      () => onChange(this.state)
    );
  }

  onNestedCheckboxChange(checked) {
    this.setState({ hasNestedField: checked });

    // If we disable selected nested column, we unlink its self id.

    if (!checked) {
      const { onChange, column, columns } = this.props;
      const nestedColumn = columns.find(c => c.self_id === column.id);

      if (nestedColumn) {
        nestedColumn.self_id = null;
        onChange(nestedColumn);
      }
    }
  }

  onNestedChange(newNested, oldNested) {
    const { onChange, column, columns } = this.props;
    const nestedColumn = columns.find(c => c.id === newNested);
    if (nestedColumn) {
      nestedColumn.self_id = column.id;
      onChange(nestedColumn);

      // remove self_id from old column
      if (oldNested) {
        const oldColumn = columns.find(c => c.id === oldNested);
        oldColumn.self_id = null;
        onChange(oldColumn);
      }
    }
  }

  render() {
    const { column, columns, fields, perspectives } = this.props;

    const field = fields.find(f => isEqual(f.id, this.state.field_id));
    const options = fields.map(f => ({ text: T(f.translations), value: id2str(f.id) }));

    options.push({
      text: `${this.context("Add new field")}...`,
      value: "new_field"
    });

    const availablePerspectives = perspectives.map(p => ({
      text: Object.prototype.hasOwnProperty.call(p, "name")
        ? `${this.context("Perspective")} ${p.index + 1}: ${p.name}`
        : `${this.context("Perspective")} ${p.index + 1}`,

      value: p.index
    }));

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
          <NestedColumn column={column} columns={columns} fields={fields} onChange={this.onNestedChange} />
        )}
      </span>
    );
  }
}

Column.contextType = TranslationContext;

Column.propTypes = {
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
  fields: PropTypes.array.isRequired,
  onChange: PropTypes.func.isRequired,
  actions: PropTypes.object
};

const ColumnWithData = compose(
  connect(null, dispatch => ({
    actions: bindActionCreators({ openCreateFieldModal }, dispatch)
  }))
)(Column);

class Columns extends React.Component {
  constructor(props) {
    super(props);

    this.onChangePos = this.onChangePos.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onRemove = this.onRemove.bind(this);
    this.onChangeColumn = this.onChangeColumn.bind(this);

    const { perspective, mode } = props;

    this.state = {
      columns: perspective ? perspective.get("fields").toJS() || [] : []
    };

    this.fetching = false;

    if (mode === "corpus" && (!this.state.columns || this.state.columns.length <= 0)) {
      this.fetching = true;
      props.client.query({ query: corpusTemplateFieldsQuery }).then(result => {
        const { template_fields } = result.data;
        const columns = [];

        /* NOTE:
         *
         * There is intentional discrepancy between what we receive from the backend (3 fields, Sound ->
         * Markup, Comment) and what we set up here (4 columns, Sound -> Markup, Markup, Comment). */

        for (let i = 0; i < template_fields.length; i++) {
          const templateField = template_fields[i];
          if (templateField.self_fake_id) {
            columns.push({
              id: uuid(),
              self_id: templateField.self_fake_id,
              link_id: null,
              field_id: templateField.id
            });
          }
          columns.push({
            id: templateField.fake_id || uuid(),
            self_id: null,
            link_id: null,
            field_id: templateField.id
          });
        }

        this.fetching = false;

        this.setState(
          {
            columns: columns
          },
          () => {
            this.fetching = false;
            props.onChange(this.state.columns);
          }
        );
      });
    }
  }

  onChangePos(column, direction) {
    const { columns } = this.state;
    const { onChange } = this.props;
    const index = columns.findIndex(c => c.id === column.id);
    const swap = (i1, i2) => {
      const c = columns.slice(0);
      const v = c[i2];
      c[i2] = c[i1];
      c[i1] = v;
      return c;
    };

    if (direction === "up" && index > 0) {
      const newIndex = index - 1;
      this.setState(
        {
          columns: swap(index, newIndex)
        },
        onChange(this.state.columns)
      );
    }

    if (direction === "down" && index < columns.length - 1) {
      const newIndex = index + 1;
      this.setState(
        {
          columns: swap(index, newIndex)
        },
        onChange(this.state.columns)
      );
    }
  }

  onCreate(field) {
    const { onChange } = this.props;
    this.setState(
      {
        columns: [
          ...this.state.columns,
          {
            id: uuid(),
            self_id: null,
            link_id: null,
            field_id: field.id
          }
        ]
      },
      () => onChange(this.state.columns)
    );
  }

  onRemove(column) {
    const { onChange } = this.props;
    this.setState(
      {
        columns: this.state.columns.filter(c => c.id !== column.id)
      },
      () => onChange(this.state.columns)
    );
  }

  onChangeColumn(column) {
    const { onChange } = this.props;
    const { columns } = this.state;
    const index = columns.findIndex(c => c.id === column.id);
    columns[index] = column;
    this.setState(
      {
        columns
      },
      () => onChange(this.state.columns)
    );
  }

  render() {
    if (this.fetching) {
      return (
        <div>
          {this.context("Loading field template")}... <Icon loading name="spinner" />
        </div>
      );
    }

    const {
      perspectives,
      data: { all_fields: allFields }
    } = this.props;
    const { columns } = this.state;

    return (
      <div>
        <List divided relaxed>
          {columns
            .filter(column => !column.self_id)
            .map(column => (
              <List.Item key={column.id}>
                <Grid centered columns={2}>
                  <Grid.Column width={11}>
                    <ColumnWithData
                      column={column}
                      columns={columns}
                      fields={allFields}
                      perspectives={perspectives}
                      onChange={this.onChangeColumn}
                    />
                  </Grid.Column>
                  <Grid.Column width={1}>
                    <Button.Group icon>
                      <Button basic icon="caret up" onClick={() => this.onChangePos(column, "up")} />
                      <Button basic icon="caret down" onClick={() => this.onChangePos(column, "down")} />
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
  client: PropTypes.object,
  mode: PropTypes.string,
  perspective: PropTypes.object,
  perspectives: PropTypes.array.isRequired,
  data: PropTypes.object,
  onChange: PropTypes.func.isRequired
};

export default compose(
  withApollo,
  graphql(allFieldsQuery),
  branch(({ data }) => data.loading, renderNothing)
)(Columns);
