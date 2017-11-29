import React from 'react';
import PropTypes from 'prop-types';
import { gql, graphql } from 'react-apollo';
import { isEqual, find, take, drop, groupBy } from 'lodash';
import { Table, Dimmer, Header, Icon } from 'semantic-ui-react';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';
import { compositeIdToString } from '../../utils/compositeId';

const dimmerStyle = { minHeight: '600px' };

const ROWS_PER_PAGE = 50;

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

const PerspectiveView = ({
  id, className, mode, entitiesMode, page, data,
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

  // get requested page
  const pageEntries = take(drop(entries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE);

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
    <div>
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
  perspectiveId, entries, className, mode, entitiesMode, data,
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
    <div>
      <Table celled padded className={className}>
        <TableHeader columns={fields} />
        <TableBody perspectiveId={perspectiveId} entitiesMode={entitiesMode} entries={pagedEntries} columns={fields} mode={mode} />
      </Table>
    </div>
  );
};

LexicalEntryViewBase.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_fields: PropTypes.array,
    perspective: PropTypes.object,
  }).isRequired,
};

export const LexicalEntryView = graphql(queryLexicalEntry, {
  options: { notifyOnNetworkStatusChange: true },
})(LexicalEntryViewBase);

export default graphql(queryPerspective, {
  options: { notifyOnNetworkStatusChange: true },
})(PerspectiveView);
