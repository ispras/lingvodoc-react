import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys, pure } from 'recompose';
import { isEqual, findIndex } from 'lodash';
import { gql, graphql } from 'react-apollo';
import { Button, List, Dropdown, Grid, Checkbox } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';

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

  }

  onLinkChange(value) {

  }

  onNestedChange(nested) {

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
              onChange={(e, { checked }) => this.setState({ hasNestedField: checked })}
              label="has linked field"
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
};

const Column = compose(pure)(C);

class Columns extends React.Component {
  constructor(props) {
    super(props);
    this.onChangePos = this.onChangePos.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onRemove = this.onRemove.bind(this);
  }

  onChangePos(column, columns, direction) {}

  onCreate() {}

  onRemove(column) {}

  render() {
    const { columns } = this.props;
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
          content="Add new column"
          onClick={() => this.onCreate(allFields.find(f => f.data_type === 'Text'))}
        />
      </div>
    );
  }
}

Columns.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  perspectives: PropTypes.array.isRequired,
};

export default compose(pure)(Columns);
