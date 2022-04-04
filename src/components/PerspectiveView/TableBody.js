import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table } from 'semantic-ui-react';

import Row from './Row';

const TableBody = ({
  perspectiveId,
  entitiesMode,
  entries,
  columns,
  mode,
  actions,
  selectEntries,
  checkEntries,
  selectedEntries,
  selectedRows,
  checkedRow,
  checkedColumn,
  checkedAll,
  onEntrySelect,
  onCheckRow,
  resetCheckedRow,
  resetCheckedColumn,
  resetCheckedAll,
  /* eslint-disable react/prop-types */
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  removeSelectionEntrySet,
  /* eslint-enable react/prop-types */
}) => (
  <Table.Body>
    {entries.map(entry => (
      <Row
        key={entry.id}
        perspectiveId={perspectiveId}
        entry={entry}
        columns={columns}
        mode={mode}
        entitiesMode={entitiesMode}
        actions={actions}
        selectEntries={selectEntries}
        checkEntries={checkEntries}
        selectedEntries={selectedEntries}
        selectedRows={selectedRows}
        checkedRow={checkedRow}
        checkedColumn={checkedColumn}
        checkedAll={checkedAll}
        onEntrySelect={onEntrySelect}
        onCheckRow={onCheckRow}
        resetCheckedRow={resetCheckedRow}
        resetCheckedColumn={resetCheckedColumn}
        resetCheckedAll={resetCheckedAll}
        showEntryId={showEntryId}
        selectDisabled={selectDisabled}
        selectDisabledIndeterminate={selectDisabledIndeterminate}
        disabledEntrySet={disabledEntrySet}
        removeSelectionEntrySet={removeSelectionEntrySet}
      />
    ))}
  </Table.Body>
);

TableBody.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  actions: PropTypes.array,
  selectEntries: PropTypes.bool,
  checkEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  selectedRows: PropTypes.array,
  checkedRow: PropTypes.object,
  checkedColumn: PropTypes.object,
  checkedAll: PropTypes.object,
  onEntrySelect: PropTypes.func,
  onCheckRow: PropTypes.func,
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
};

TableBody.defaultProps = {
  actions: [],
  selectEntries: false,
  checkEntries: false,
  selectedEntries: [],
  selectedRows: [],
  checkedRow: null,
  checkedColumn: null,
  checkedAll: null,
  onEntrySelect: () => {},
  onCheckRow: () => {},
  resetCheckedRow: () => {},
  resetCheckedColumn: () => {},
  resetCheckedAll: () => {},
};

export default onlyUpdateForKeys(['perspectiveId', 'entries', 'mode', 'selectedEntries', 'selectedRows', 'checkedRow', 'checkedColumn', 'checkedAll'])(TableBody);
