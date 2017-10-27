import React from 'react';
import { gql, graphql } from 'react-apollo';
import PropTypes from 'prop-types';
import { mapValues, groupBy, isEqual, find, take, drop, toPairs } from 'lodash';
import { Table, Dimmer, Header, Icon } from 'semantic-ui-react';

import TableHeader from './TableHeader';
import TableBody from './TableBody';
import Pagination from './Pagination';

const dimmerStyle = { minHeight: '600px' };

const ROWS_PER_PAGE = 20;

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

  // group entities by entry id, then group entities by field
  const entries = toPairs(
    mapValues(groupBy(entities, e => `${e.parent_id[0]}/${e.parent_id[1]}`), v =>
      groupBy(v, e => `${e.field_id[0]}/${e.field_id[1]}`)
    )
  ).map(e => ({
    id: e[0],
    contains: e[1],
  }));

  const entriesTotal = entries.length;
  //
  const pageEntries = take(drop(entries, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE);

  const fields = columns.map(column => find(all_fields, f => isEqual(column.field_id, f.id)));

  const fcolumns = fields.map(v => ({
    key: `${v.id[0]}/${v.id[1]}`,
    dataType: v.data_type,
  }));

  return (
    <div>
      <Table celled padded className={className}>
        <TableHeader fields={fields} />
        <TableBody entries={pageEntries} columns={fcolumns} mode={mode} />
      </Table>
      <Pagination current={page} total={Math.floor(entriesTotal / ROWS_PER_PAGE) + 1} to={mode} />
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

export default graphql(query)(PerspectiveView);
