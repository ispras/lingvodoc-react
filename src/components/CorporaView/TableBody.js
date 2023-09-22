import React, { useCallback, useState } from "react";
import { Table } from "semantic-ui-react";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import Row from "./Row";

const TableBody = ({ entries, ...rest }) => {

  console.log('Render Entries!!!');

  const [pets, setPets] = useState(entries);

  const moveListItem = useCallback(
    (dragIndex, hoverIndex) => {
        const dragItem = pets[dragIndex];
        const hoverItem = pets[hoverIndex];
        // Swap places of dragItem and hoverItem in the pets array
        setPets(pets => {
            const updatedPets = [...pets];
            updatedPets[dragIndex] = hoverItem;
            updatedPets[hoverIndex] = dragItem;
            return updatedPets;
        });
    },
    [pets]
  );


  /* new!!!!!!!! */
  //entries = pets;

  console.log("CorporaView/TableBody.js: entries=======");
  console.log(entries);

  return (
    <Table.Body>
      {/*{pets.map((entry, index) => (*/}
      {entries.map((entry, index) => (
        <Row entries={pets} key={entry.id} index={index} id={entry.id} entry={entry} moveListItem={moveListItem} {...rest} />
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
  reRender: PropTypes.func
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
