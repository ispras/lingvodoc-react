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
  /* eslint-disable react/prop-types */
  selectAllEntries,
  selectAllIndeterminate,
  selectAllChecked,
  onAllEntriesSelect,
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
};

TableHeader.defaultProps = {
  actions: [],
  onSortModeChange: null,
  selectEntries: false,
};

export default onlyUpdateForKeys(['columns'])(TableHeader);
