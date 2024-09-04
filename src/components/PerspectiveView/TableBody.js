import React from "react";
import { Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import Row from "./Row";

const TableBody = ({ entries, ...rest }) => (
  <Table.Body>
    {entries.map(entry => (
      <Row key={entry.id} entry={entry} {...rest} />
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
  reRender: PropTypes.func,
  queryArgs: PropTypes.object
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
  reRender: () => console.log('Fake refetch'),
  queryArgs: null
};

export default onlyUpdateForKeys([
  "perspectiveId",
  "entries",
  "mode",
  "selectedEntries",
  "selectedRows",
  "checkedRow",
  "checkedColumn",
  "checkedAll",
  "queryArgs"
])(TableBody);