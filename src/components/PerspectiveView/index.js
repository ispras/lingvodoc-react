import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys } from 'recompose';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { gql, graphql } from 'react-apollo';
import { isEqual, find, take, drop, flow, groupBy, sortBy, reverse } from 'lodash';
import { Table, Dimmer, Header, Icon, Button } from 'semantic-ui-react';
import { setSortByField, addLexicalEntry } from 'ducks/perspective';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

const dimmerStyle = { minHeight: '600px' };

const ROWS_PER_PAGE = 20;

export const queryPerspective = gql`
  query queryPerspective($id: LingvodocID!, $entitiesMode: String!) {
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
      lexical_entries(mode: $entitiesMode) {
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

const TableComponent = ({
  columns, perspectiveId, entitiesMode, entries, mode, actions,
}) => (
  <div style={{ overflowY: 'auto' }}>
    <Table celled padded>
      <TableHeader columns={columns} actions={actions} />
      <TableBody
        perspectiveId={perspectiveId}
        entitiesMode={entitiesMode}
        entries={entries}
        columns={columns}
        mode={mode}
        actions={actions}
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
  actions: PropTypes.array,
};

TableComponent.defaultProps = {
  actions: [],
};

const PerspectiveView = ({
  id,
  className,
  mode,
  entitiesMode,
  page,
  data,
  filter,
  sortByField,
  setSortByField: setSort,
  createLexicalEntry,
  addLexicalEntry: addCreatedEntry,
  createdEntries,
}) => {
  const { loading } = data;

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

  const { all_fields, perspective: { lexical_entries, columns } } = data;

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
    })
      .then(({ data: d }) => {
        if (!d.loading || !d.error) {
          const { create_lexicalentry: { lexicalentry } } = d;
          addCreatedEntry(lexicalentry);
        }
      })
      .then();
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
      const { fieldId, order } = sortByField;
      // XXX: sort by first entity
      const sortedEntries = sortBy(es, (e) => {
        const entities = e.entities.filter(entity => isEqual(entity.field_id, fieldId));
        if (entities.length > 0) {
          return entities[0].content;
        }
        return '';
      });
      return order === 'a' ? sortedEntries : reverse(sortedEntries);
    },
  ]);

  const newEntries = processEntries(lexical_entries.filter(e => !!createdEntries.find(c => isEqual(e.id, c.id))));
  const entries = processEntries(lexical_entries);

  const pageEntries =
    entries.length > ROWS_PER_PAGE ? take(drop(entries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE) : entries;

  const e = [...newEntries, ...pageEntries];

  // join fields and columns
  // {
  //   column_id = column.id
  //   position = column.position
  //   self_id = column.self_id
  //   ...field
  // }
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
    <div style={{ overflowY: 'auto' }}>
      <Button positive fluid icon="plus" content="Add lexical entry" onClick={addEntry} />
      <Table celled padded className={className}>
        <TableHeader columns={fields} onSortModeChange={(fieldId, order) => setSort(fieldId, order)} />
        <TableBody perspectiveId={id} entitiesMode={entitiesMode} entries={e} columns={fields} mode={mode} />
      </Table>
      <Pagination current={page} total={Math.floor(entries.length / ROWS_PER_PAGE) + 1} to={mode} />
    </div>
  );
};

PerspectiveView.propTypes = {
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
  createdEntries: PropTypes.array.isRequired,
};

PerspectiveView.defaultProps = {
  filter: '',
  sortByField: null,
};

export default compose(
  connect(
    ({ data: { perspective: { sortByField, createdEntries } } }) => ({ sortByField, createdEntries }),
    dispatch => bindActionCreators({ addLexicalEntry, setSortByField }, dispatch)
  ),
  graphql(createLexicalEntryMutation, { name: 'createLexicalEntry' }),
  graphql(queryPerspective, {
    options: { notifyOnNetworkStatusChange: true },
  })
)(PerspectiveView);

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
  perspectiveId, entries, mode, entitiesMode, data, actions,
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
  actions: PropTypes.array,
};

LexicalEntryViewBase.defaultProps = {
  actions: [],
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
