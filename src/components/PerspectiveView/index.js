import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys } from 'recompose';
import { gql, graphql } from 'react-apollo';
import { isEqual, find, take, drop, groupBy } from 'lodash';
import { Table, Dimmer, Header, Icon } from 'semantic-ui-react';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';
import { compositeIdToString } from '../../utils/compositeId';

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
      lexical_entries {
        id
        parent_id
        created_at
      }
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
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
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
  id, className, mode, entitiesMode, page, data, filter,
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

  const { all_fields, perspective: { lexical_entries, entities, columns } } = data;

  const groupedEntities = groupBy(entities, e => compositeIdToString(e.parent_id));
  const entries = lexical_entries
    .map(e => ({
      ...e,
      contains: groupedEntities[compositeIdToString(e.id)] || [],
    }))
    .filter(e => e.contains.length > 0);

  const filteredEntries = !filter
    ? entries
    : entries.filter(entry =>
      !!entry.contains.find(entity => typeof entity.content === 'string' && entity.content.indexOf(filter) >= 0));

  // get requested page
  const pageEntries = take(drop(filteredEntries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE);

  const entriesTotal = entries.length;

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
      <Table celled padded className={className}>
        <TableHeader columns={fields} />
        <TableBody perspectiveId={id} entitiesMode={entitiesMode} entries={pageEntries} columns={fields} mode={mode} />
      </Table>
      <Pagination current={page} total={Math.floor(entriesTotal / ROWS_PER_PAGE) + 1} to={mode} />
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
};

export const queryLexicalEntry = gql`
  query queryLexacalEntry($perspectiveId: LingvodocID!) {
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

  const pagedEntries = entries.map(e => ({
    ...e,
    contains: e.entities,
  }));

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
      entries={pagedEntries}
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
  query queryLexacalEntry($perspectiveId: LingvodocID!, $entitiesMode: String!) {
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
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
  }
`;

const LexicalEntryViewBaseByIds = ({
  perspectiveId, entries, mode, entitiesMode, data, actions,
}) => {
  const { loading } = data;

  if (loading) {
    return (
      <Header as="h2" icon>
        <Icon name="spinner" loading />
      </Header>
    );
  }

  const { all_fields, perspective: { columns, entities } } = data;

  const groupedEntities = groupBy(entities, e => compositeIdToString(e.parent_id));
  const tableEntries = entries
    .map(e => ({
      ...e,
      contains: groupedEntities[compositeIdToString(e.id)] || [],
    }))
    .filter(e => e.contains.length > 0);

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
      entries={tableEntries}
      columns={fields}
      mode={mode}
      actions={actions}
    />
  );
};

LexicalEntryViewBaseByIds.propTypes = {
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

export default graphql(queryPerspective, {
  options: { notifyOnNetworkStatusChange: true },
})(PerspectiveView);
