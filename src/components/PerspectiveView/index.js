import React from 'react';
import { gql, graphql } from 'react-apollo';
import PropTypes from 'prop-types';
import {
  map,
  groupBy,
  isEqual,
  find,
  take,
  drop,
} from 'lodash';
import { Table, Dimmer, Header, Icon } from 'semantic-ui-react';
import { compositeIdToString } from 'utils/compositeId';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

const dimmerStyle = { minHeight: '600px' };

const ROWS_PER_PAGE = 50;

const query = gql`
  query q($id: LingvodocID!, $entitiesMode: String!) {
    perspective(id: $id) {
      id
      translation
      tree {
        id
        translation
      }
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

const PerspectiveView = ({ className, mode, page, data }) => {
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

  const { all_fields, perspective: { entities, columns } } = data;

  // group entities by entry id
  const entries = map(
    groupBy(entities, e => compositeIdToString(e.parent_id)),
    (contains, id) => ({ id, contains }),
  );

  // get requested page
  const pageEntries = take(
    drop(entries, ROWS_PER_PAGE * (page - 1)),
    ROWS_PER_PAGE,
  );

  const entriesTotal = entries.length;

  const fields = columns.map((column) => {
    const field = find(all_fields, f => isEqual(column.field_id, f.id));
    return { ...field, self_id: column.self_id, column_id: column.id, position: column.position };
  });

  return (
    <div>
      <Table celled padded className={className}>
        <TableHeader columns={fields} />
        <TableBody entries={pageEntries} columns={fields} mode={mode} />
      </Table>
      <Pagination
        current={page}
        total={Math.floor(entriesTotal / ROWS_PER_PAGE) + 1}
        to={mode}
      />
    </div>
  );
};

PerspectiveView.propTypes = {
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired, // eslint-disable-line
  data: PropTypes.object.isRequired,
};

export default graphql(query, {
  options: { notifyOnNetworkStatusChange: true },
})(PerspectiveView);
