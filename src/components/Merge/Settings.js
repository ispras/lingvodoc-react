import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys, branch, renderNothing, pure, withReducer } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { isEqual, find, take, drop, flow, groupBy, sortBy, reverse } from 'lodash';
import {
  Table,
  Dimmer,
  Header,
  Icon,
  Dropdown,
  List,
  Input,
  Button,
  Checkbox,
  Container,
  Segment,
} from 'semantic-ui-react';
import { compositeIdToString } from '../../utils/compositeId';

const fieldsQuery = gql`
  query fieldsQuery($id: LingvodocID!) {
    perspective(id: $id) {
      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
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

class MergeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { settings, dispatch, data } = this.props;
    const mode = settings.get('mode');
    const threshold = settings.get('threshold');
    const fields = settings.get('field_selection_list');
    const { all_fields: allFields, perspective: { columns } } = data;

    const fieldOptions = columns.map((c) => {
      const field = allFields.find(f => isEqual(c.field_id, f.id));
      return {
        key: compositeIdToString(field.id),
        text: field.translation,
        value: field,
      };
    });

    console.log(fieldOptions);

    return (
      <Segment>
        <Header>Entity matching algorithm</Header>

        <List>
          <List.Item>
            <Checkbox
              radio
              name="mode"
              value="simple"
              label="Simple"
              checked={mode === 'simple'}
              onChange={(e, { value }) => dispatch({ type: 'SET_MODE', payload: value })}
            />
          </List.Item>
          <List.Item>
            <Checkbox
              radio
              name="mode"
              value="advanced"
              label="Advanced"
              checked={mode === 'advanced'}
              onChange={(e, { value }) => dispatch({ type: 'SET_MODE', payload: value })}
            />
          </List.Item>
        </List>

        {mode === 'advanced' && (
          <Container>
            <List>
              {fields.map(e => (
                <List.Item>
                  <List>
                    <List.Item>
                      <Dropdown selection options={fieldOptions} onChange={(e, { value }) => console.log(value)} />
                    </List.Item>
                    <List.Item>
                      <Input
                        label="Levenshtein distance limit for entity content matching"
                        value={threshold}
                        onChange={(ev, { value }) => dispatch({ type: 'SET_THRESHOLD', payload: value })}
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox label="Split contents of the field on whitespace before matching." />
                    </List.Item>
                    <List.Item>
                      <Checkbox label="Split contents of the field on punctuation before matching" />
                    </List.Item>
                  </List>
                </List.Item>
              ))}
            </List>

            <Button basic content="Add field" onClick={() => dispatch({ type: 'ADD_FIELD' })} />
          </Container>
        )}

        <Input
          label="Entity matching threshold"
          value={threshold}
          onChange={(e, { value }) => dispatch({ type: 'SET_THRESHOLD', payload: value })}
        />

        <Container textAlign="center">
          <Button positive content="View suggestions" />
        </Container>
      </Segment>
    );
  }
}

MergeSettings.propTypes = {
  id: PropTypes.array.isRequired,
  settings: PropTypes.instanceOf(Immutable.Map).isRequired,
  dispatch: PropTypes.func.isRequired,
};

const fieldListEntry = {
  field_id: null,
  split_punctuation: true,
  split_space: true,
  levenshtein: 0,
  type: 'text',
};

function reducer(state, { type, payload }) {
  switch (type) {
    case 'SET_MODE':
      return state.set('mode', payload);
    case 'SET_THRESHOLD':
      return state.set('threshold', parseFloat(payload) || 0.1);
    case 'ADD_FIELD':
      return state.update('field_selection_list', list => list.push(fieldListEntry));
    case 'REMOVE_FIELD':
      return state.update('field_selection_list', list => list.delete(payload));

    default:
      return state;
  }
}

const initialState = {
  mode: 'simple',
  threshold: 0.1,
  field_selection_list: [],
};

export default compose(
  withReducer('settings', 'dispatch', reducer, fromJS(initialState)),
  graphql(fieldsQuery),
  branch(({ data }) => data.loading, renderNothing),
  pure
)(MergeSettings);
