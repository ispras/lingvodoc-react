/* eslint-disable padded-blocks */
import React from "react";
import { Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { onlyUpdateForKeys, pure } from "recompose";

import Entities from "components/LexicalEntry";

import "styles/main.scss";

const Cell = ({
  perspectiveId,
  entry,
  column,
  columns,
  checkEntries,
  checkedRow,
  checkedColumn,
  checkedAll,
  resetCheckedRow,
  resetCheckedColumn,
  resetCheckedAll,
  mode,
  entitiesMode,
  disabled
  // eslint-disable-next-line arrow-body-style
}) => {
  return (
    <Table.Cell className="entity gentium">
      <Entities
        perspectiveId={perspectiveId}
        column={column}
        columns={columns}
        checkEntries={checkEntries}
        checkedRow={checkedRow}
        checkedColumn={checkedColumn}
        checkedAll={checkedAll}
        resetCheckedRow={resetCheckedRow}
        resetCheckedColumn={resetCheckedColumn}
        resetCheckedAll={resetCheckedAll}
        entry={entry}
        mode={mode}
        entitiesMode={entitiesMode}
        disabled={disabled}
      />
    </Table.Cell>
  );
};

Cell.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  checkEntries: PropTypes.bool,
  checkedRow: PropTypes.object,
  checkedColumn: PropTypes.object,
  checkedAll: PropTypes.object,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  disabled: PropTypes.bool,
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func
};

Cell.defaultProps = {
  disabled: undefined
};

export default onlyUpdateForKeys([
  "perspectiveId",
  "entry",
  "mode",
  "disabled",
  "column",
  "checkedRow",
  "checkedColumn",
  "checkedAll"
])(Cell);
