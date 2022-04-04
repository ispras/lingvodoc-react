import React from 'react';
import PropTypes from 'prop-types';
import { onlyUpdateForKeys } from 'recompose';
import { Table, Checkbox } from 'semantic-ui-react';
import { sortBy, isEmpty, isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import { getTranslation } from 'api/i18n';
import Column from './Column';

const TableHeader = ({
  columns,
  actions,
  selectEntries,
  entries,
  checkEntries,
  /* eslint-disable react/prop-types */
  selectAllEntries,
  selectAllIndeterminate,
  selectAllChecked,
  onAllEntriesSelect,
  selectedRows,
  selectedColumns,
  onCheckColumn,
  onCheckAll,
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabled,
  sortByField,
  /* eslint-enable react/prop-types */
  onSortModeChange,
  onSortModeReset,
}) => (
  <Table.Header
    style={disabled ? { opacity: '0.5' } : {}}
  >

    <Table.Row>
      {selectEntries && (
        <Table.HeaderCell className="entityHeader">
          {selectAllEntries && (
            <Checkbox
              disabled={selectDisabled}
              indeterminate={selectDisabledIndeterminate || selectAllIndeterminate}
              checked={selectAllChecked}
              onChange={
                (_, { checked }) =>
                  onAllEntriesSelect(checked)}
            />
          )}
        </Table.HeaderCell>
      )}

      {checkEntries && (
        <Table.HeaderCell className="entityHeader lingvo-sticky-checkbox-column">
          <Checkbox
            className="lingvo-checkbox" 
            checked={entries.length === selectedRows.length}
            onChange={
              (e, { checked }) => {
                onCheckAll(checked);
              }
            }
          />
        </Table.HeaderCell>
      )}

      {showEntryId && (
        <Table.HeaderCell className="entityHeader">
          {getTranslation('id')}
        </Table.HeaderCell>
      )}
      {sortBy(columns.filter(column => column.self_id == null), column => column.position).map(column => (
        <Column
          key={compositeIdToString(column.column_id)}
          field={column}
          fields={columns}
          checkEntries={checkEntries}
          selectedColumns={selectedColumns}
          onCheckColumn={onCheckColumn}
          sortByField={sortByField}
          onSortModeChange={onSortModeChange}
          onSortModeReset={onSortModeReset}
        />
      ))}
      {!isEmpty(actions) && <Table.HeaderCell />}
    </Table.Row>

  </Table.Header>
);

TableHeader.propTypes = {
  columns: PropTypes.array.isRequired,
  actions: PropTypes.array,
  onSortModeChange: PropTypes.func,
  selectEntries: PropTypes.bool,
  entries: PropTypes.array,
  checkEntries: PropTypes.bool,
  selectedRows: PropTypes.array,
  selectedColumns: PropTypes.array,
  onCheckColumn: PropTypes.func,
  onCheckAll: PropTypes.func,
};

TableHeader.defaultProps = {
  actions: [],
  onSortModeChange: null,
  selectEntries: false,
  entries: [],
  checkEntries: false,
  selectedRows: [],
  selectedColumns: [],
  onCheckColumn: () => {},
  onCheckAll: () => {},
};

export default onlyUpdateForKeys(['columns', 'entries', 'selectedRows', 'selectedColumns'])(TableHeader);
