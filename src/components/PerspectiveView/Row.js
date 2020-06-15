import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table, Button, Checkbox } from 'semantic-ui-react';
import { sortBy, isEmpty, isEqual } from 'lodash';
import { compositeIdToString as id2str } from 'utils/compositeId';

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
  /* eslint-disable react/prop-types */
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  removeSelectionEntrySet,
  /* eslint-enable react/prop-types */
}) => {
  const entry_id_str = id2str(entry.id);

  const disabled_flag =

    disabledEntrySet &&
    disabledEntrySet.hasOwnProperty(entry_id_str);

  const remove_selection_flag =

    removeSelectionEntrySet &&
    removeSelectionEntrySet.hasOwnProperty(entry_id_str);

  return (
    <Table.Row
      style={disabled_flag ? { opacity: '0.5' } : {}}
    >

      {selectEntries && (
        <Table.Cell>
          {!remove_selection_flag && (
            <Checkbox
              disabled={selectDisabled || disabled_flag}
              indeterminate={selectDisabledIndeterminate}
              checked={!!selectedEntries.find(e => isEqual(e, entry.id))}
              onChange={(_e, { checked }) => onEntrySelect(entry.id, checked)}
            />
          )}
        </Table.Cell>
      )}

      {showEntryId && (
        <Table.Cell>
          {entry_id_str}
        </Table.Cell>
      )}

      {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
        <Cell
          key={id2str(column.column_id)}
          perspectiveId={perspectiveId}
          column={column}
          columns={columns}
          entry={entry}
          mode={mode}
          entitiesMode={entitiesMode}
          disabled={disabled_flag}
        />
      ))}

      {!isEmpty(actions) && (
        <Table.Cell>
          {actions.map(action => (
            <Button
              disabled={disabled_flag}
              key={action.title}
              basic
              content={action.title}
              onClick={() => action.action(entry)}
            />
          ))}
        </Table.Cell>
      )}

    </Table.Row>
  );
};

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
