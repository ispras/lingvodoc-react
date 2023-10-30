import React, { useCallback, useState } from "react";
import { Table } from "semantic-ui-react";
/*import update from 'immutability-helper';*/
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import Row from "./Row";

const TableBody = ({ entries, ...rest }) => {

  console.log('Render Entries!!!');

  /*
  const [cards, setCards] = useState(entries);

  const moveListItem = useCallback((dragIndex, hoverIndex) => {
    console.log('!!!!!!!!!!!!moveListItem!!!!!!!!!!!!!!');
    setCards((prevCards) =>
      update(prevCards, {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, prevCards[dragIndex]],
        ],
      }),
    );
  }, []);
  */
 
  return (
    <Table.Body>
      {entries.map((entry, index) => (
      /*{cards.map((entry, index) => (*/
        <Row
          entries={entries}
          /*entries={cards}*/
          key={entry.id}
          index={index}
          id={entry.id}
          entry={entry}
          number={(index + 1).toString()}
          /*moveListItem={moveListItem}*/
          {...rest}
        />
      ))}
    </Table.Body>
  );
};

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
  /*dragAndDropEntries: PropTypes.func*/ /* new!!!!! */
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
  reRender: () => console.log('Fake refetch')
};

export default onlyUpdateForKeys([
  "perspectiveId",
  "entries",
  "mode",
  "selectedEntries",
  "selectedRows",
  "checkedRow",
  "checkedColumn",
  "checkedAll"
])(TableBody);
