import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table } from 'semantic-ui-react';

import Row from './Row';

const TableBody = ({ perspectiveId, entitiesMode, entries, columns, mode }) =>
  <Table.Body>
    {
      entries.map(entry =>
        <Row
          key={entry.id}
          perspectiveId={perspectiveId}
          entry={entry}
          columns={columns}
          mode={mode}
          entitiesMode={entitiesMode}
        />
      )
    }
  </Table.Body>;

TableBody.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
};

export default onlyUpdateForPropTypes(TableBody);
