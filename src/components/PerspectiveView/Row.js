import React, { useState } from "react";
import { Button, Checkbox, Table } from "semantic-ui-react";
import { isEmpty, isEqual, sortBy } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import { compositeIdToString as id2str } from "utils/compositeId";

import Cell from "./Cell";

const Row = ({
  perspectiveId,
  entry,
  allEntriesGenerator,
  columns,
  mode,
  entitiesMode,
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
  reRender,
  queryArgs,
  /* eslint-disable react/prop-types */
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  removeSelectionEntrySet
  /* eslint-enable react/prop-types */
}) => {
  const entry_id_str = id2str(entry.id);

  const [ disabled, setDisabled ] = useState(false);

  const disabled_flag = disabledEntrySet && disabledEntrySet.hasOwnProperty(entry_id_str) || disabled;

  const remove_selection_flag = removeSelectionEntrySet && removeSelectionEntrySet.hasOwnProperty(entry_id_str);

  return (
    <Table.Row style={disabled_flag ? { opacity: "0.5" } : {}}>
      {selectEntries && (
        <Table.Cell>
          {!remove_selection_flag && (
            <Checkbox
              className="lingvo-checkbox" 
              disabled={selectDisabled || disabled_flag}
              indeterminate={selectDisabledIndeterminate}
              checked={!!selectedEntries.find(e => isEqual(e, entry.id))}
              onChange={(_e, { checked }) => onEntrySelect(entry.id, checked)}
            />
          )}
        </Table.Cell>
      )}

      {checkEntries && (
        <Table.Cell className="lingvo-sticky-checkbox-column">
          <Checkbox
            className="lingvo-checkbox"
            checked={!!selectedRows.find(e => isEqual(e, entry.id))}
            onChange={(_e, { checked }) => {
              onCheckRow(entry, checked);
            }}
          />
        </Table.Cell>
      )}

      {showEntryId && <Table.Cell>{entry_id_str}</Table.Cell>}

      {sortBy(
        columns.filter(column => column.self_id == null),
        column => column.position
      ).map(column => (
        <Cell
          key={id2str(column.column_id)}
          perspectiveId={perspectiveId}
          column={column}
          columns={columns}
          entry={entry}
          allEntriesGenerator={allEntriesGenerator}
          checkEntries={checkEntries}
          checkedRow={checkedRow}
          checkedColumn={checkedColumn}
          checkedAll={checkedAll}
          resetCheckedRow={resetCheckedRow}
          resetCheckedColumn={resetCheckedColumn}
          resetCheckedAll={resetCheckedAll}
          mode={mode}
          entitiesMode={entitiesMode}
          disabled={disabled_flag}
          reRender={reRender}
          queryArgs={queryArgs}
        />
      ))}

      {!isEmpty(actions) && (
        <Table.Cell>
          {actions.map(action => {
            let reRenderWrapper;
            if (action.enabled) {
              action.enabled(entry).then(value => setDisabled(!value));
              reRenderWrapper = reRender;
            } else {
              reRenderWrapper = () => setDisabled(true);
            }

            return(
              <Button
                disabled={disabled_flag}
                key={action.title}
                content={action.title}
                onClick={() => {
                  action.action(entry);
                  reRenderWrapper();
                }}
                className={action.className}
              />
            );
          })}
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
  reRender: PropTypes.func,
  queryArgs: PropTypes.object
};

Row.defaultProps = {
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
  reRender: () => console.debug('Fake refetch'),
  queryArgs: null
};

export default onlyUpdateForKeys([
  "perspectiveId",
  "entry",
  "mode",
  "selectedEntries",
  "selectedRows",
  "checkedRow",
  "checkedColumn",
  "checkedAll",
  "columns",
  "queryArgs"
])(Row);