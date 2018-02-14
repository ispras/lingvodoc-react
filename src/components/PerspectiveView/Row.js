import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table, Button, Checkbox } from 'semantic-ui-react';
import { sortBy, isEmpty, isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Cell from './Cell';

const Row = ({
  perspectiveId,
  entry,
  columns,
  mode,
  entitiesMode,
  actions,
  selectEntries,
  selectedEntries,
  onEntrySelect,
}) => (
  <Table.Row>
    {selectEntries && (
      <Table.Cell>
        <Checkbox
          checked={!!selectedEntries.find(e => isEqual(e, entry.id))}
          onChange={(_e, { checked }) => onEntrySelect(entry.id, checked)}
        />
      </Table.Cell>
    )}

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
        {actions.map(action => (
          <Button key={action.title} basic content={action.title} onClick={() => action.action(entry)} />
        ))}
      </Table.Cell>
    )}
  </Table.Row>
);

Row.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  actions: PropTypes.array,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
};

Row.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
};

export default onlyUpdateForKeys(['perspectiveId', 'entry', 'mode', 'selectedEntries'])(Row);
