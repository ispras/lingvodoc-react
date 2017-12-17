import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForPropTypes } from 'recompose';
import { Table, Button } from 'semantic-ui-react';
import { sortBy, isEmpty } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Cell from './Cell';

const Row = ({
  perspectiveId, entry, columns, mode, entitiesMode, actions,
}) => (
  <Table.Row>
    {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
      <Cell
        key={compositeIdToString(column.column_id)}
        perspectiveId={perspectiveId}
        column={column}
        columns={columns}
        entry={entry}
        mode={mode}
        entitiesMode={entitiesMode}
      />
    ))}
    {!isEmpty(actions) && (
      <Table.Cell>
        {actions.map(action => <Button key={action.title} basic content={action.title} onClick={() => action.action(entry)} />)}
      </Table.Cell>
    )}
  </Table.Row>
);

Row['propTypes'] = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  actions: PropTypes.array,
};

Row.defaultProps = {
  actions: [],
};

export default onlyUpdateForPropTypes(Row);
