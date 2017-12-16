import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';
import { sortBy } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';


import Column from './Column';

const TableHeader = ({ columns }) =>
  <Table.Header>
    <Table.Row>
      {
        sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column =>
          <Column
            key={compositeIdToString(column.column_id)}
            field={column}
            fields={columns}
          />
        )
      }
    </Table.Row>
  </Table.Header>;

TableHeader['propTypes'] = {
  columns: PropTypes.array.isRequired,
};

export default onlyUpdateForPropTypes(TableHeader);
