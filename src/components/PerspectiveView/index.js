import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys, branch, renderNothing, renderComponent } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { isEqual, find, take, drop, flow, sortBy, reverse } from 'lodash';
import { Table, Dimmer, Header, Icon, Button } from 'semantic-ui-react';
import { setSortByField, addLexicalEntry, selectLexicalEntry, resetEntriesSelection } from 'ducks/perspective';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

import Placeholder from './LoadingPlaceholder';

const dimmerStyle = { minHeight: '600px' };

const ROWS_PER_PAGE = 20;

export const queryPerspective = gql`
  query queryPerspective1($id: LingvodocID!) {
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
      data_type_translation_gist_id
    }
  }
`;

const queryLexicalEntries = gql`
  query queryPerspective2($id: LingvodocID!, $entitiesMode: String!) {
    perspective(id: $id) {
      id
      translation
      lexical_entries(mode: $entitiesMode) {
        id
        parent_id
        created_at
        marked_for_deletion
        entities(mode: $entitiesMode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
          additional_metadata {
            link_perspective_id
          }
        }
      }
    }
  }
`;

const createLexicalEntryMutation = gql`
  mutation createLexicalEntry($id: LingvodocID!, $entitiesMode: String!) {
    create_lexicalentry(perspective_id: $id) {
      lexicalentry {
        id
        parent_id
        created_at
        entities(mode: $entitiesMode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
          additional_metadata {
            link_perspective_id
          }
        }
      }
    }
  }
`;

const mergeLexicalEntriesMutation = gql`
  mutation mergeEntries($groupList: [[LingvodocID]]!) {
    merge_bulk(group_list: $groupList, publish_any: false, async: false) {
      triumph
    }
  }
`;

const removeLexicalEntriesMutation = gql`
  mutation removeLexicalEntries($ids: [LingvodocID]!) {
    bulk_delete_lexicalentry(ids: $ids) {
      triumph
    }
  }
`;

const TableComponent = ({
  columns,
  perspectiveId,
  entitiesMode,
  entries,
  mode,
  selectEntries,
  selectedEntries,
  onEntrySelect,
  actions,
}) => (
  <div style={{ overflowY: 'auto' }}>
    <Table celled padded>
      <TableHeader columns={columns} selectEntries={selectEntries} actions={actions} />
      <TableBody
        perspectiveId={perspectiveId}
        entitiesMode={entitiesMode}
        entries={entries}
        columns={columns}
        mode={mode}
        actions={actions}
        selectEntries={selectEntries}
        selectedEntries={selectedEntries}
        onEntrySelect={onEntrySelect}
      />
    </Table>
  </div>
);

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  perspectiveId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
  actions: PropTypes.array,
};

TableComponent.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
};

const P = ({
  id,
  className,
  mode,
  entitiesMode,
  page,
  data,
  filter,
  sortByField,
  allFields,
  columns,
  setSortByField: setSort,
  createLexicalEntry,
  mergeLexicalEntries,
  removeLexicalEntries,
  addLexicalEntry: addCreatedEntry,
  selectLexicalEntry: onEntrySelect,
  resetEntriesSelection: resetSelection,
  createdEntries,
  selectedEntries,
}) => {
  const { loading, error } = data;

  if (loading) {
    return (
      <Dimmer.Dimmable dimmed={loading} style={dimmerStyle}>
        <Dimmer active={loading} inverted>
          <Header as="h2" icon>
            <Icon name="spinner" loading />
          </Header>
        </Dimmer>
      </Dimmer.Dimmable>
    );
  }

  const lexicalEntries = !error ? data.perspective.lexical_entries : []; 

  const addEntry = () => {
    createLexicalEntry({
      variables: {
        id,
        entitiesMode,
      },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id,
            entitiesMode,
          },
        },
      ],
    }).then(({ data: d }) => {
      if (!d.loading || !d.error) {
        const { create_lexicalentry: { lexicalentry } } = d;
        addCreatedEntry(lexicalentry);
      }
    });
  };

  const mergeEntries = () => {
    const groupList = [selectedEntries];
    mergeLexicalEntries({
      variables: {
        groupList,
      },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id,
            entitiesMode,
          },
        },
      ],
    }).then(() => {
      resetSelection();
    });
  };

  const removeEntries = () => {
    removeLexicalEntries({
      variables: {
        ids: selectedEntries,
      },
      refetchQueries: [
        {
          query: queryPerspective,
          variables: {
            id,
            entitiesMode,
          },
        },
      ],
    }).then(() => {
      resetSelection();
    });
  };

  const processEntries = flow([
    // remove empty lexical entries, if not in edit mode
    es => (mode !== 'edit' ? es.filter(e => e.entities.length > 0) : es),
    // apply filtering
    es =>
      (!!filter && filter.length > 0
        ? es.filter(entry =>
          !!entry.entities.find(entity => typeof entity.content === 'string' && entity.content.indexOf(filter) >= 0))
        : es),
    // apply sorting
    (es) => {
      // no sorting required
      if (!sortByField) {
        return es;
      }
      const { field, order } = sortByField;
      // XXX: sorts by first entity only
      const sortedEntries = sortBy(es, (e) => {
        const entities = e.entities.filter(entity => isEqual(entity.field_id, field));
        if (entities.length > 0) {
          return entities[0].content;
        }
        return '';
      });
      return order === 'a' ? sortedEntries : reverse(sortedEntries);
    },
  ]);

  const newEntries = processEntries(lexicalEntries.filter(e => !!createdEntries.find(c => isEqual(e.id, c.id))));
  const entries = processEntries(lexicalEntries);

  const pageEntries =
    entries.length > ROWS_PER_PAGE ? take(drop(entries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE) : entries;

  // Put newly created entries at the top of page.
  const e = [...newEntries, ...pageEntries.filter(pageEntry => !createdEntries.find(c => isEqual(c.id, pageEntry.id)))];

  // join fields and columns
  // {
  //   column_id = column.id
  //   position = column.position
  //   self_id = column.self_id
  //   ...field
  // }
  const fields = columns.map((column) => {
    const field = find(allFields, f => isEqual(column.field_id, f.id));
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position,
    };
  });

  return (
    <div style={{ overflowY: 'auto' }}>
      {mode === 'edit' && <Button positive icon="plus" content="Add lexical entry" onClick={addEntry} />}
      {mode === 'edit' && (
        <Button
          negative
          icon="minus"
          content="Remove lexical entries"
          onClick={removeEntries}
          disabled={selectedEntries.length < 1}
        />
      )}
      {mode === 'edit' && (
        <Button
          positive
          icon="plus"
          content="Merge lexical entries"
          onClick={mergeEntries}
          disabled={selectedEntries.length < 2}
        />
      )}
      <Table celled padded className={className}>
        <TableHeader
          columns={fields}
          onSortModeChange={(fieldId, order) => setSort(fieldId, order)}
          selectEntries={mode === 'edit'}
        />
        <TableBody
          perspectiveId={id}
          entitiesMode={entitiesMode}
          entries={e}
          columns={fields}
          mode={mode}
          selectEntries={mode === 'edit'}
          selectedEntries={selectedEntries}
          onEntrySelect={onEntrySelect}
        />
      </Table>
      <Pagination current={page} total={Math.floor(entries.length / ROWS_PER_PAGE) + 1} to={mode} />
    </div>
  );
};

P.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
  setSortByField: PropTypes.func.isRequired,
  addLexicalEntry: PropTypes.func.isRequired,
  createLexicalEntry: PropTypes.func.isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  removeLexicalEntries: PropTypes.func.isRequired,
  selectLexicalEntry: PropTypes.func.isRequired,
  resetEntriesSelection: PropTypes.func.isRequired,
  createdEntries: PropTypes.array.isRequired,
  selectedEntries: PropTypes.array.isRequired,
};

P.defaultProps = {
  filter: '',
  sortByField: null,
};

const PerspectiveView = compose(
  connect(
    ({ data: { perspective: { sortByField, createdEntries, selectedEntries } } }) => ({
      sortByField,
      createdEntries,
      selectedEntries,
    }),
    dispatch =>
      bindActionCreators(
        {
          addLexicalEntry,
          setSortByField,
          selectLexicalEntry,
          resetEntriesSelection,
        },
        dispatch
      )
  ),
  graphql(createLexicalEntryMutation, { name: 'createLexicalEntry' }),
  graphql(mergeLexicalEntriesMutation, { name: 'mergeLexicalEntries' }),
  graphql(removeLexicalEntriesMutation, { name: 'removeLexicalEntries' }),
  graphql(queryLexicalEntries, {
    options: { notifyOnNetworkStatusChange: true },
  }),
)(P);

export const queryLexicalEntry = gql`
  query queryLexicalEntry($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
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
      data_type_translation_gist_id
    }
  }
`;

const LexicalEntryViewBase = ({
  perspectiveId,
  entries,
  mode,
  entitiesMode,
  data,
  selectEntries,
  selectedEntries,
  onEntrySelect,
  actions,
}) => {
  const { loading } = data;

  if (loading) {
    return null;
  }

  const { all_fields, perspective: { columns } } = data;

  const fields = columns.map((column) => {
    const field = find(all_fields, f => isEqual(column.field_id, f.id));
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position,
    };
  });

  return (
    <TableComponent
      perspectiveId={perspectiveId}
      entitiesMode={entitiesMode}
      entries={entries}
      columns={fields}
      mode={mode}
      actions={actions}
      selectEntries={selectEntries}
      selectedEntries={selectedEntries}
      onEntrySelect={onEntrySelect}
    />
  );
};

LexicalEntryViewBase.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_fields: PropTypes.array,
    perspective: PropTypes.object,
  }).isRequired,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
  actions: PropTypes.array,
};

LexicalEntryViewBase.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
};

export const queryLexicalEntriesByIds = gql`
  query queryLexicalEntry($perspectiveId: LingvodocID!, $entriesIds: [LingvodocID]!, $entitiesMode: String!) {
    perspective(id: $perspectiveId) {
      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
      lexical_entries(mode: $entitiesMode, ids: $entriesIds) {
        id
        parent_id
        created_at
        entities(mode: $entitiesMode) {
          id
          parent_id
          field_id
          link_id
          self_id
          created_at
          locale_id
          content
          published
          accepted
          additional_metadata {
            link_perspective_id
          }
        }
      }
    }
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
  }
`;

const LexicalEntryViewBaseByIds = ({
  perspectiveId, mode, entitiesMode, data, actions,
}) => {
  const { loading } = data;

  if (loading) {
    return (
      <Header as="h2" icon>
        <Icon name="spinner" loading />
      </Header>
    );
  }

  const { all_fields, perspective: { columns, lexical_entries: entries } } = data;

  const fields = columns.map((column) => {
    const field = find(all_fields, f => isEqual(column.field_id, f.id));
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position,
    };
  });

  return (
    <TableComponent
      perspectiveId={perspectiveId}
      entitiesMode={entitiesMode}
      entries={entries}
      columns={fields}
      mode={mode}
      actions={actions}
    />
  );
};

LexicalEntryViewBaseByIds.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entriesIds: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_fields: PropTypes.array,
    perspective: PropTypes.object,
  }).isRequired,
  actions: PropTypes.array,
};

LexicalEntryViewBaseByIds.defaultProps = {
  actions: [],
};

export const LexicalEntryView = graphql(queryLexicalEntry, {
  options: { notifyOnNetworkStatusChange: true },
})(LexicalEntryViewBase);

export const LexicalEntryViewByIds = compose(
  onlyUpdateForKeys(['data']),
  graphql(queryLexicalEntriesByIds, {
    options: { notifyOnNetworkStatusChange: true },
  })
)(LexicalEntryViewBaseByIds);

const PerspectiveViewWrapper = ({
  id, className, mode, entitiesMode, page, data, filter, sortByField,
}) => {

  const { all_fields: allFields, perspective: { columns } } = data;

  return (
    <PerspectiveView
      id={id}
      className={className}
      mode={mode}
      entitiesMode={entitiesMode}
      page={page}
      filter={filter}
      sortByField={sortByField}
      allFields={allFields}
      columns={columns}
    />
  );
};

PerspectiveViewWrapper.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
};

PerspectiveViewWrapper.defaultProps = {
  filter: '',
  sortByField: null,
};

export default compose(
  graphql(queryPerspective, {
    options: { notifyOnNetworkStatusChange: true },
  }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder))
)(PerspectiveViewWrapper);
