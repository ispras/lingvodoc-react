import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { compose, withReducer } from 'recompose';
import Immutable, { fromJS } from 'immutable';
import { gql, graphql } from 'react-apollo';
import { Message, Button, Step, Header, Segment, List, Dropdown, Grid, Checkbox } from 'semantic-ui-react';
import Languages from 'components/Languages';
import Translations from 'components/Translation';
import { compositeIdToString } from 'utils/compositeId';

export const fieldsQuery = gql`
  query allFields {
    all_fields {
      id
      translation
      data_type
    }
  }
`;

class Field extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      field: null,
      link: null,
    };
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  onFieldChange(value) {
    const { data } = this.props;
    const { loading, error, all_fields: allFields } = data;

    if (!loading || !error) {
      const field = allFields.find(f => compositeIdToString(f.id) === value);

      if (field) {
        this.setState({ field });
      }
    }
  }

  onLinkChange(value) {
    this.setState({ link: value });
  }

  render() {
    const { data, perspective, perspectives } = this.props;
    const { loading, error, all_fields: allFields } = data;
    const { field } = this.state;

    if (loading || error) {
      return null;
    }

    const options = allFields.map(f => ({ text: f.translation, value: compositeIdToString(f.id) }));
    const availableOptions = perspectives
      .delete(perspectives.findIndex(p => p.equals(perspective)))
      .toJS()
      .map(p => ({ text: p.index + 1, value: p.index }));

    return (
      <span>
        <Dropdown selection options={options} onChange={(a, { value }) => this.onFieldChange(value)} />
        {field &&
          field.data_type === 'Link' && (
            <Dropdown selection options={availableOptions} onChange={(a, { value }) => this.onLinkChange(value)} />
          )}
        {field &&
          field.data_type !== 'Link' &&
          field.data_type !== 'Directed Link' &&
          field.data_type !== 'Grouping Tag' && <Checkbox label="has linked field" />}
      </span>
    );
  }
}

Field.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
};

const FieldWithData = compose(graphql(fieldsQuery))(Field);

class Fields extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      fields, perspective, perspectives, dispatch,
    } = this.props;
    return (
      <div>
        <List divided relaxed>
          {fields.map(field => (
            <List.Item>
              <Grid centered columns={2}>
                <Grid.Column>
                  <FieldWithData
                    key={field.get('pos')}
                    field={field}
                    perspective={perspective}
                    perspectives={perspectives}
                  />
                </Grid.Column>
                <Grid.Column width={1}>
                  <Button.Group icon>
                    <Button basic icon="caret up" onClick={() => dispatch({ type: 'MOVE_FIELD_UP', payload: field })} />
                    <Button
                      basic
                      icon="caret down"
                      onClick={() => dispatch({ type: 'MOVE_FIELD_DOWN', payload: field })}
                    />
                    <Button negative icon="cancel" onClick={() => dispatch({ type: 'REMOVE_FIELD', payload: field })} />
                  </Button.Group>
                </Grid.Column>
              </Grid>
            </List.Item>
          ))}
        </List>

        <Button basic onClick={() => dispatch({ type: 'CREATE_FIELD' })} />
      </div>
    );
  }
}

Fields.propTypes = {
  onChange: PropTypes.func.isRequired,
  dispatch: PropTypes.func.isRequired,
  fields: PropTypes.instanceOf(Immutable.List).isRequired,
  perspectives: PropTypes.instanceOf(Immutable.List).isRequired,
  perspective: PropTypes.instanceOf(Immutable.Map).isRequired,
};

function changePos(fields, field, direction) {
  const pos = fields.findIndex(f => f.get('id') === field.get('id'));
  if (direction === 'up' && pos === 0) {
    return fields;
  }
  if (direction === 'down' && pos === fields.size - 1) {
    return fields;
  }

  const newPos = direction === 'up' ? pos - 1 : pos + 1;

  return fields.withMutations((list) => {
    const temp = list.get(newPos);
    return list.set(newPos, list.get(pos)).set(pos, temp);
  });
}

function createField(fields) {
  const field = fromJS({
    id: fields.size + 1,
  });
  return fields.push(field);
}

function reducer(state, { type, payload }) {
  switch (type) {
    case 'SET_FIELDS':
      return payload;
    case 'CREATE_FIELD':
      return createField(state);
    case 'REMOVE_FIELD':
      return state.delete(state.findIndex(f => f.get('id') === payload.get('id')));
    case 'MOVE_FIELD_UP':
      return changePos(state, payload, 'up');
    case 'MOVE_FIELD_DOWN':
      return changePos(state, payload, 'down');
    default:
      return state;
  }
}

export default compose(withReducer('fields', 'dispatch', reducer, ({ perspective }) => {
  console.log(perspective);
  return perspective.get('fields');
}))(Fields);
