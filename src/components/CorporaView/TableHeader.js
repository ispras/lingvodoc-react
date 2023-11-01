import React, { useContext } from "react";
import { Checkbox, Table } from "semantic-ui-react";
import { isEmpty, sortBy } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString } from "utils/compositeId";

import Column from "./Column";

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
  dnd_enabled, /* new!!!!!! */
  mode /* new!!!!!!! */
}) => {
  const getTranslation = useContext(TranslationContext);

  return (
    <Table.Header style={disabled ? { opacity: "0.5" } : {}}>
      <Table.Row>
        {/* new!!!!! */}
        <Table.HeaderCell className="entityHeader" style={(dnd_enabled && mode === "edit") ? {} : { display: "none" }}>
          &nbsp;
        </Table.HeaderCell>
        {/* /new!!!!! */}
        {selectEntries && (
          <Table.HeaderCell className="entityHeader">
            {selectAllEntries && (
              <Checkbox
                className="lingvo-checkbox" 
                disabled={selectDisabled}
                indeterminate={selectDisabledIndeterminate || selectAllIndeterminate}
                checked={selectAllChecked}
                onChange={(_, { checked }) => onAllEntriesSelect(checked)}
              />
            )}
          </Table.HeaderCell>
        )}

        {checkEntries && (
          <Table.HeaderCell className="entityHeader lingvo-sticky-checkbox-column">
            <Checkbox
              className="lingvo-checkbox"
              checked={entries.length === selectedRows.length}
              onChange={(e, { checked }) => {
                onCheckAll(checked);
              }}
            />
          </Table.HeaderCell>
        )}

        {showEntryId && <Table.HeaderCell className="entityHeader">{getTranslation("id")}</Table.HeaderCell>}
        {sortBy(
          columns.filter(column => column.self_id == null),
          column => column.position
        ).map(column => (
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
};

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
  dnd_enabled: PropTypes.bool,
  mode: PropTypes.string.isRequired /* new!!!!!! */
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
  onCheckAll: () => {}
};

export default onlyUpdateForKeys(["columns", "entries", "selectedRows", "selectedColumns", "dnd_enabled", /* ???????? new!!!!! */ "mode" /* new!!!!! */])(TableHeader);
