import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table } from 'semantic-ui-react';
import { sortBy, isEmpty } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Column from './Column';

const TableHeader = ({
  columns, actions, selectEntries, onSortModeChange,
}) => (
  <Table.Header>
    <Table.Row>
      {selectEntries && <Table.HeaderCell className="entityHeader" />}
      {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
        <Column
          key={compositeIdToString(column.column_id)}
          field={column}
          fields={columns}
          onSortModeChange={onSortModeChange}
        />
      ))}
      {!isEmpty(actions) && <Table.HeaderCell />}
    </Table.Row>
  </Table.Header>
);

TableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  actions: PropTypes.array,
  onSortModeChange: PropTypes.func,
  selectEntries: PropTypes.bool,
};

TableHeader.defaultProps = {
  actions: [],
  onSortModeChange: null,
  selectEntries: false,
};

export default onlyUpdateForKeys(['columns'])(TableHeader);
