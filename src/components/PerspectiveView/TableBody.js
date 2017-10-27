import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';

import Row from './Row';

const TableBody = ({ entries, columns, mode }) =>
  <Table.Body>
    {
      entries.map(entry =>
        <Row
          key={entry.id}
          entry={entry}
          columns={columns}
          mode={mode}
        />
      )
    }
  </Table.Body>;

TableBody.propTypes = {
  entries: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
};

export default onlyUpdateForPropTypes(TableBody);
