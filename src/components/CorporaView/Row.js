import React, { useRef, useState } from "react";
import { useDrag, useDrop } from "react-dnd";
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
  number,
  /* eslint-disable react/prop-types */
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  removeSelectionEntrySet,
  index, /* new!!!!! */
  id, /* new!!!!! */
  moveListItem, /* new!!!!! */
  dragAndDropEntries, /* new!!!!! */
  dnd_enabled, /* new!!!!!! */
  entries /* new!!!!! */
  /* eslint-enable react/prop-types */
}) => {

  /* new!!!!!! */

  const ref = useRef(null);

  // useDrag - the list item is draggable
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: 'entry',
    item: () => {
      return { id, index };
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
    end: (item, monitor) => {
      console.log('useDrag end: item=====');
      console.log(item);
      console.log('monitor.didDrop()===');
      console.log(monitor.didDrop());

      const prev = ref.current.parentElement.parentElement.previousElementSibling || null;
      const idPrev = prev && prev.id.split(',').map(entry => parseInt(entry)) || null;

      const next = ref.current.parentElement.parentElement.nextElementSibling || null;
      const idNext = next && next.id.split(',').map(entry => parseInt(entry)) || null;
      
      dragAndDropEntries(id, idPrev, idNext);

      if (monitor.didDrop()) {
        //setDropped(item);
        console.log('monitor.didDrop() === true !!!!!!!');
      }
    }

  });

  // useDrop - the list item is also a drop area
  const [{ handlerId }, dropRef] = useDrop({
    accept: 'entry',
    collect(monitor) {
      return {
        handlerId: monitor.getHandlerId(),
      };
    },
    hover: (item, monitor) => {
      if (!ref.current) {
        return;
      }

      const dragIndex = item.index;
      const hoverIndex = index;

      /*console.log('dragIndex=======');
      console.log(dragIndex);

      console.log('hoverIndex=======');
      console.log(hoverIndex);*/

      // Don't replace items with themselves
      if (dragIndex === hoverIndex) {
        return;
      }

      /*console.log('item=====');
      console.log(item);

      console.log('ref.current=====');
      console.log(ref.current);*/

      // Determine rectangle on screen
      const hoverBoundingRect = ref.current?.getBoundingClientRect();

      /*console.log('ref.current?.getBoundingClientRect()====');
      console.log(hoverBoundingRect);*/

      //const hoverBoundingRect2 = ref.current.parentElement.parentElement?.getBoundingClientRect(); // fix!!!!! 

      /*console.log('ref.current.parentElement.parentElement?.getBoundingClientRect()====');
      console.log(hoverBoundingRect2);*/

      // Get vertical middle
      //const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2;
      const hoverMiddleY = (hoverBoundingRect.height) / 2;

      /*console.log('hoverMiddleY=====');
      console.log(hoverMiddleY);*/

      //const hoverMiddleY2 = (hoverBoundingRect2.bottom - hoverBoundingRect2.top) / 2;
      //const hoverMiddleY2 = (hoverBoundingRect2.height) / 2;

      /*console.log('hoverMiddleY2=====');
      console.log(hoverMiddleY2);*/

      // Determine mouse position
      const clientOffset = monitor.getClientOffset();

      /*console.log('clientOffset=====');
      console.log(clientOffset);*/

      // Get pixels to the top
      const hoverClientY = clientOffset.y - hoverBoundingRect.top;

      /*console.log('hoverClientY=====');
      console.log(hoverClientY);*/

      //const hoverClientY2 = clientOffset.y - hoverBoundingRect2.top;

      /*console.log('hoverClientY2=====');
      console.log(hoverClientY2);*/
      
      // Only perform the move when the mouse has crossed half of the items height
      // When dragging downwards, only move when the cursor is below 50%
      // When dragging upwards, only move when the cursor is above 50%
      // Dragging downwards
      if (dragIndex < hoverIndex && hoverClientY < hoverMiddleY) {
      /*if (dragIndex < hoverIndex && hoverClientY2 < hoverMiddleY2) {*/
        return;
      }
      // Dragging upwards
      if (dragIndex > hoverIndex && hoverClientY > hoverMiddleY) {
      /*if (dragIndex > hoverIndex && hoverClientY2 > hoverMiddleY2) {*/
        return;
      }
      // Time to actually perform the action
      //moveListItem(dragIndex, hoverIndex);
      moveListItem(dragIndex, hoverIndex, entries); // !!!!!!!
      // Note: we're mutating the monitor item here!
      // Generally it's better to avoid mutations,
      // but it's good here for the sake of performance
      // to avoid expensive index searches.
      item.index = hoverIndex;

    }/*,
    drop: (item) => {
      console.log('useDrop drop!!!!!!: item====');
      console.log(item);
    },*/
  });

  const dragDropRef = dragRef(dropRef(ref));

  /* /new!!!!!! */

  const entry_id_str = id2str(entry.id);

  const [ disabled, setDisabled ] = useState(false);

  const disabled_flag = disabledEntrySet && disabledEntrySet.hasOwnProperty(entry_id_str) || disabled;

  const remove_selection_flag = removeSelectionEntrySet && removeSelectionEntrySet.hasOwnProperty(entry_id_str);

  return (
    <tr style={isDragging ? { opacity: "0" } : (disabled_flag ? { opacity: "0.5" } : {})} ref={preview} id={id} data-handler-id={handlerId}>
      {/* new!!!!! */}
      <Table.Cell className={(dnd_enabled && (mode === "edit")) ? "lingvo-dnd-column" : "lingvo-dnd-column lingvo-dnd-column_hidden"}>
        <div ref={dragDropRef}>
          <Button.Group basic className="lingvo-buttons-group">
            <Button icon={<i className="lingvo-icon lingvo-icon_dnd" />} />
          </Button.Group>
        </div>
      </Table.Cell>
      {/* /new!!!!! */}
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
          number={number}
          /*index={index}*/ /* new!!!!! */
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
    </tr>
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
  number: PropTypes.string,
  id: PropTypes.array, /*  ????? new!!!!! */
  index: PropTypes.number, /*  ????? new!!!!! */
  moveListItem: PropTypes.func, /* new!!!!! */
  dragAndDropEntries: PropTypes.func, /* new!!!!! */
  dnd_enabled: PropTypes.bool, /* new!!!!! */
  entries: PropTypes.array, /* new!!!!! */
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
  reRender: () => console.debug('Fake refetch')
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
  "number",
  "id", /*  ????? new!!!!! */
  "index", /*  ????? new!!!!! */
  "dnd_enabled", /* ???????? new!!!!! */
  /*"moveListItem",*/ /* new!!!!! */
  "entries" /* new!!!!! */
])(Row);
