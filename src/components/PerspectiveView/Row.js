import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';
import { sortBy } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Cell from './Cell';

const Row = ({ entry, columns, mode }) => (
  <Table.Row>
    {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
      <Cell
        key={compositeIdToString(column.column_id)}
        column={column}
        columns={columns}
        entities={entry.contains}
        mode={mode}
      />
    ))}
  </Table.Row>
);

Row.propTypes = {
  entry: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

export default onlyUpdateForPropTypes(Row);
