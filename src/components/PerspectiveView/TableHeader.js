import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';
import { sortBy } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Column from './Column';

const TableHeader = ({ columns, entryAction }) => (
  <Table.Header>
    <Table.Row>
      {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
        <Column key={compositeIdToString(column.column_id)} field={column} fields={columns} />
      ))}
      {entryAction && <Table.HeaderCell />}
    </Table.Row>
  </Table.Header>
);

TableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  entryAction: PropTypes.object,
};

TableHeader.defaultTypes = {
  entryAction: null,
};

export default onlyUpdateForPropTypes(TableHeader);
