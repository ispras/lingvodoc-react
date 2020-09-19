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
  selectedEntries,
  onEntrySelect,
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
        selectedEntries={selectedEntries}
        onEntrySelect={onEntrySelect}
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
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
};

TableBody.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
};

export default onlyUpdateForKeys(['perspectiveId', 'entries', 'mode', 'selectedEntries'])(TableBody);
