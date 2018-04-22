import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing, pure, withReducer, withProps } from 'recompose';
import { gql, graphql, withApollo } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { isEqual, take, drop } from 'lodash';
import { Header, Dropdown, List, Input, Button, Checkbox, Container, Segment, Divider } from 'semantic-ui-react';
import styled from 'styled-components';

import { queryPerspective, LexicalEntryView } from 'components/PerspectiveView';
import Pagination from './Pagination';

const ROWS_PER_PAGE = 10;

const FieldBlock = styled(Segment)`
  .delete-button {
    box-shadow: none !important;
    position: absolute !important;
    padding: 10px !important;
    margin: 0;
    right: 0;
    top: 0;
  }
`;

const mergeSuggestionsQuery = gql`
  query mergeSuggestions(
    $id: LingvodocID!
    $algorithm: String!
    $field_selection_list: [ObjectVal]!
    $levenshtein: Int!
    $threshold: Float!
  ) {
    merge_suggestions(
      perspective_id: $id
      algorithm: $algorithm
      field_selection_list: $field_selection_list
      levenshtein: $levenshtein
      threshold: $threshold
    ) {
      match_result
    }
  }
`;

const mergeLexicalEntriesMutation = gql`
  mutation mergeEntries($groupList: [[LingvodocID]]!, $publish_any: Boolean!, $async: Boolean!) {
    merge_bulk(group_list: $groupList, publish_any: $publish_any, async: $async) {
      triumph
    }
  }
`;

class MergeSettings extends React.Component {
  constructor(props) {
    super(props);
    this.getSuggestions = this.getSuggestions.bind(this);
    this.getSelected = this.getSelected.bind(this);
    this.mergeGroup = this.mergeGroup.bind(this);
    this.mergeBatch = this.mergeBatch.bind(this);
    this.mergeSelected = this.mergeSelected.bind(this);
    this.mergeAll = this.mergeAll.bind(this);
    this.state = {
      groups: [],
    };
  }

  async getSuggestions() {
    const {
      id, settings, client, data: { perspective: { lexical_entries: entries } }, dispatch,
    } = this.props;

    const algorithm = settings.get('mode');
    const threshold = settings.get('threshold');
    const fields = settings.get('field_selection_list');

    const { data } = await client.query({
      query: mergeSuggestionsQuery,
      variables: {
        id,
        algorithm,
        field_selection_list: fields,
        threshold,
        levenshtein: 1,
      },
    });

    if (data) {
      const { merge_suggestions: { match_result } } = data;
      const groups = match_result.map(({ lexical_entries: ids, confidence }) => ({
        lexical_entries: ids.map(eid => entries.find(e => isEqual(e.id, eid))),
        confidence,
      }));
      this.setState(
        {
          groups,
        },
        () => {
          dispatch({ type: 'SET_PAGE', payload: 1 });
        }
      );
    }
  }

  getSelected(group) {
    const { settings } = this.props;
    const groupIds = settings.getIn(['selected', group]);
    return groupIds ? groupIds.toJS() : [];
  }

  mergeGroup(group) {
    const { settings, mergeLexicalEntries } = this.props;
    const groupIds = settings.getIn(['selected', group]);
    mergeLexicalEntries({
      variables: {
        async: false,
        publish_any: false,
        groupList: [groupIds],
      },
    }).then(() => {
      window.logger.suc('Merged successfully.');
    });
  }

  mergeBatch(groups) {
    const { settings, mergeLexicalEntries } = this.props;

    const publishedAny = settings.get('publishedAny');

    mergeLexicalEntries({
      variables: {
        async: true,
        publish_any: publishedAny,
        groupList: groups,
      },
    }).then(() => {
      window.logger.suc('Merge task created successfully.');
    });
  }

  mergeSelected() {
    const { settings } = this.props;
    const groupIds = settings
      .get('selected')
      .toIndexedSeq()
      .toArray();

    this.mergeBatch(groupIds.map(d => d.toJS()));
  }

  mergeAll() {
    const groupIds = this.state.groups.map(g => g.lexical_entries.map(e => e.id));
    this.mergeBatch(groupIds);
  }

  render() {
    const {
      id, entitiesMode, settings, dispatch, data,
    } = this.props;
    const mode = settings.get('mode');
    const threshold = settings.get('threshold');
    const fields = settings.get('field_selection_list');
    const publishedAny = settings.get('publishedAny');
    const page = settings.get('page');

    const { all_fields: allFields, perspective: { columns } } = data;

    const fieldOptions = columns.map((c) => {
      const field = allFields.find(f => isEqual(c.field_id, f.id));
      return {
        text: field.translation,
        value: JSON.stringify(field.id),
      };
    });

    const groups =
      this.state.groups.length > ROWS_PER_PAGE
        ? take(drop(this.state.groups, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE)
        : this.state.groups;

    return (
      <div>
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
                value="fields"
                label="With field selection"
                checked={mode === 'fields'}
                onChange={(e, { value }) => dispatch({ type: 'SET_MODE', payload: value })}
              />
            </List.Item>
          </List>

          {mode === 'fields' && (
            <Container>
              {fields.size === 0 && (
                <Segment textAlign="center">No fields, click button below to add a new one.</Segment>
              )}
              {fields.map((e, i) => (
                <FieldBlock key={i}>
                  <Button
                    className="delete-button"
                    compact
                    basic
                    icon="delete"
                    onClick={() => dispatch({ type: 'REMOVE_FIELD', payload: i })}
                  />
                  <List>
                    <List.Item>
                      <Dropdown
                        selection
                        options={fieldOptions}
                        defaultValue={JSON.stringify(e.field_id)}
                        onChange={(_e, { value }) =>
                          dispatch({ type: 'CHANGE_FIELD_ID', payload: { id: JSON.parse(value), index: i } })
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <Input
                        label="Levenshtein distance limit for entity content matching"
                        value={e.levenshtein}
                        onChange={(ev, { value }) =>
                          dispatch({ type: 'SET_LEVENSHTEIN', payload: { index: i, levenshtein: value } })
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        label="Split contents of the field on whitespace before matching."
                        checked={e.split_space}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: 'SET_WHITESPACE_FLAG', payload: { index: i, checked } })
                        }
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        label="Split contents of the field on punctuation before matching"
                        checked={e.split_punctuation}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: 'SET_PUNCTUATION_FLAG', payload: { index: i, checked } })
                        }
                      />
                    </List.Item>
                  </List>
                </FieldBlock>
              ))}
              <Container textAlign="center">
                <Button basic content="Add field" onClick={() => dispatch({ type: 'ADD_FIELD' })} />
              </Container>
            </Container>
          )}

          {mode === 'simple' && (
            <Input
              label="Entity matching threshold"
              value={threshold}
              onChange={(e, { value }) => dispatch({ type: 'SET_THRESHOLD', payload: value })}
            />
          )}

          <Container textAlign="center">
            <Button positive content="View suggestions" onClick={this.getSuggestions} />
          </Container>
        </Segment>

        {this.state.groups.length > 0 && (
          <Segment>
            <List>
              <List.Item>
                <Checkbox
                  label="Publish result of entity merge if any merged entity is published"
                  checked={publishedAny}
                  onChange={(e, { checked }) => dispatch({ type: 'SET_MERGE_PUBLISHED_MODE', payload: checked })}
                />
              </List.Item>

              <List.Item>
                <Button
                  basic
                  size="small"
                  content="Select all on current page"
                  onClick={() =>
                    dispatch({
                      type: 'SELECT_ALL_PAGE',
                      payload: groups.map(g => g.lexical_entries.map(d => d.id)),
                    })
                  }
                />
                <Button basic size="small" content="Merge selected" onClick={this.mergeSelected} />
              </List.Item>

              <List.Item>
                <Button positive size="small" content="Merge all" onClick={this.mergeAll} />
              </List.Item>
            </List>
          </Segment>
        )}

        <Segment>
          {groups.length === 0 && <Container textAlign="center">No suggestions</Container>}

          {groups.map((group, i) => (
            <div key={i}>
              <Header>
                Group #{i}, confidence: {group.confidence}
              </Header>
              <LexicalEntryView
                perspectiveId={id}
                entries={group.lexical_entries}
                mode="view"
                entitiesMode={entitiesMode}
                selectEntries
                selectedEntries={this.getSelected(i)}
                onEntrySelect={(eid, checked) =>
                  dispatch({ type: 'SET_ENTRY_SELECTION', payload: { group: i, id: eid, checked } })
                }
              />
              <Container textAlign="center">
                <Button
                  positive
                  content="Merge group"
                  onClick={() => this.mergeGroup(i)}
                  disabled={this.getSelected(i).length < 2}
                />
              </Container>
              <Divider />
            </div>
          ))}
        </Segment>

        <Pagination
          current={page}
          total={Math.floor(this.state.groups.length / ROWS_PER_PAGE) + 1}
          changePage={p => dispatch({ type: 'SET_PAGE', payload: p })}
        />
      </div>
    );
  }
}

MergeSettings.propTypes = {
  id: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  settings: PropTypes.instanceOf(Immutable.Map).isRequired,
  dispatch: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired,
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
    case 'CHANGE_FIELD_ID':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, field_id: payload.id })));
    case 'SET_WHITESPACE_FLAG':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, split_space: payload.checked })));
    case 'SET_PUNCTUATION_FLAG':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, split_punctuation: payload.checked })));
    case 'SET_LEVENSHTEIN':
      return state.update('field_selection_list', list =>
        list.update(payload.index, old => ({ ...old, levenshtein: parseFloat(payload.levenshtein) || 0.1 })));
    case 'SET_ENTRY_SELECTION': {
      const { group, id, checked } = payload;
      const currentlySelected = state.getIn(['selected', group]) || new Immutable.List();
      if (!checked) {
        return state.setIn(['selected', group], currentlySelected.filter(eid => !isEqual(eid, id)));
      }
      return state.setIn(['selected', group], currentlySelected.push(id));
    }
    case 'SET_MERGE_PUBLISHED_MODE':
      return state.set('publishedAny', payload);
    case 'SET_PAGE':
      return state.set('page', payload);
    case 'SELECT_ALL_PAGE': {
      const allIds = payload.reduce((result, g, i) => result.set(i, new Immutable.List(g)), Immutable.Map());
      return state.set('selected', allIds);
    }
    default:
      return state;
  }
}

const initialState = {
  mode: 'simple',
  threshold: 0.1,
  field_selection_list: new Immutable.List(),
  selected: new Immutable.Map(),
  page: 1,
  publishedAny: false,
};

export default compose(
  withProps(p => ({ ...p, entitiesMode: 'all' })),
  withReducer('settings', 'dispatch', reducer, fromJS(initialState)),
  graphql(queryPerspective),
  graphql(mergeLexicalEntriesMutation, { name: 'mergeLexicalEntries' }),
  branch(({ data }) => data.loading || !!data.error, renderNothing),
  withApollo,
  pure
)(MergeSettings);
