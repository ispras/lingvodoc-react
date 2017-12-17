import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table } from 'semantic-ui-react';
import { sortBy, isEmpty } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Column from './Column';

const TableHeader = ({ columns, actions }) => (
  <Table.Header>
    <Table.Row>
      {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
        <Column key={compositeIdToString(column.column_id)} field={column} fields={columns} />
      ))}
      {!isEmpty(actions) && <Table.HeaderCell />}
    </Table.Row>
  </Table.Header>
);

TableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  actions: PropTypes.array,
};

TableHeader.defaultProps = {
  actions: [],
};

export default onlyUpdateForKeys(['columns'])(TableHeader);
