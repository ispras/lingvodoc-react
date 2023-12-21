import React, { useCallback, useState } from "react";
import { useDrag } from "react-dnd";
import { RegExpMarker } from "react-mark.js";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Checkbox } from "semantic-ui-react";
import { find, isEqual } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import Entities from "./index";

const TextEntityContent = ({
  entry,
  entity,
  mode,
  //parentEntity,
  publish,
  //column,
  accept,
  //remove,
  //breakdown,
  //is_being_removed,
  //is_being_updated,
  checkEntries,
  checkedRow,
  resetCheckedRow,
  checkedColumn,
  resetCheckedColumn,
  checkedAll,
  resetCheckedAll,
  number,
  //update,
  id
}) => {

  //const is_order_column = (number && column.english_translation === "Order");
  //const [read_only, setReadOnly] = useState(is_order_column);
  //const [is_number, setIsNumber] = useState(is_order_column);
  //const [edit, setEdit] = useState(false);

  const [content, setContent] = useState(entity.content);
  const [dropped, setDropped] = useState(null);

  /*
  const onEdit = useCallback(() => {
    if (!edit) {
      setEdit(true);
    } else {
      update(entity, content);
      setEdit(false);
    }
  }, [edit, content]);

  const onKeyDown = useCallback((event) => {

    breakdown(event, parentEntity, entity);

    if (event.code === "Enter" && !event.ctrlKey) {
      onEdit();
    }

  }, [edit, content]);
  */

  // useDrag - the list item is draggable
  const [{ isDragging}, dragRef, preview] = useDrag({
    type: 'entity',
    item: { id, content },
    collect: (monitor) => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        setDropped(item);
        remove(item, entry.id);
      }
    }
  });

  const text = number;

  if (checkEntries) {
    if (checkedAll) {
      if (checkedAll.checkedAll) {
        if (!entity.published) {
          publish(entity, true);
        }
      } else {
        if (entity.published) {
          publish(entity, false);
        }
      }
    }

    if (checkedRow) {
      if (JSON.stringify(checkedRow.id) === JSON.stringify(entity.parent_id)) {
        if (checkedRow.checkedRow) {
          if (!entity.published) {
            publish(entity, true);
          }
        } else {
          if (entity.published) {
            publish(entity, false);
          }
        }
      }
    }

    if (checkedColumn) {
      if (JSON.stringify(checkedColumn.id) === JSON.stringify(entity.field_id)) {
        if (checkedColumn.checkedColumn) {
          if (!entity.published) {
            publish(entity, true);
          }
        } else {
          if (entity.published) {
            publish(entity, false);
          }
        }
      }
    }
  }

  /*
  const pg_ln = /\[\d+[ab]?:\d+\]/;
  const pg = /\[\d+[ab]?\]/;
  const ln = /\(\d+\)/;
  const snt = /\u2260/;
  const missed = /[/]missed text[/]/;
  const metatext = new RegExp(
    `${pg_ln.source }|${ 
    pg.source }|${ 
    ln.source }|${ 
    snt.source }|${ 
    missed.source}`
  );
  */

  switch (mode) {
    case "edit":
      return !dropped ? (
        <div className={isDragging && "lingvo-input-buttons-group lingvo-input-buttons-group_drag" || "lingvo-input-buttons-group"} ref={preview} id={id}>
          <span className="lingvo-input-buttons-group__name">{text}</span>
          {/*!(is_being_updated || edit) && (
            <span className="lingvo-input-buttons-group__name"><RegExpMarker mark={metatext}>{text}</RegExpMarker></span>
          )}
          {(is_being_updated || edit) && (
            <TextareaAutosize
              defaultValue={text}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={onKeyDown}
              className="lingvo-input-action lingvo-input-action_textarea"
            />
          )}
          { read_only || (
            <Button.Group basic icon className="lingvo-buttons-group">
              <div ref={dragRef} className="lingvo-buttons-group__drag">
                <Button icon={<i className="lingvo-icon lingvo-icon_dnd" />} />
              </div>
              <Button icon={is_being_updated ? <i className="lingvo-icon lingvo-icon_spinner" /> : edit ? <i className="lingvo-icon lingvo-icon_save2" /> : <i className="lingvo-icon lingvo-icon_edit2" />}
                onClick={onEdit}
                disabled={is_being_updated || !text}
                className={is_being_updated ? "lingvo-button-spinner" : ""}
              />
              {is_being_removed ? (
                <Button icon={<i className="lingvo-icon lingvo-icon_spinner" />} disabled className="lingvo-button-spinner" />
              ) : (
                <Button icon={<i className="lingvo-icon lingvo-icon_delete2" />} onClick={() => remove(entity)} />
              )}
            </Button.Group>
          )*/}
        </div>
      ) : null;
    case "publish":
      return (
        <div className="lingvo-entry-text">
          {/*column.english_translation &&
          column.english_translation === "Number of the languages" && 
          entity.id &&
          entity.parent_id ? (
            <span className="lingvo-entry-content">
              <a
                href={`/dictionary/${entity.parent_id[0]}/${entity.parent_id[1]}/perspective/${entity.id[0]}/${entity.id[1]}/edit`}
                className="lingvo-languages-link"
              >
                {text}
              </a>
            </span>
          ) : (
            <span className="lingvo-entry-content"><RegExpMarker mark={metatext}>{text}</RegExpMarker></span>
          )*/}
          <span className="lingvo-entry-content">{text}</span>
          <Checkbox
            className="lingvo-checkbox lingvo-entry-text__checkbox" 
            checked={entity.published}
            onChange={(e, { checked }) => {
              publish(entity, checked);

              if (checkEntries) {
                if (checkedRow) {
                  resetCheckedRow();
                }
                if (checkedColumn) {
                  resetCheckedColumn();
                }
                if (checkedAll) {
                  resetCheckedAll();
                }
              }
            }}
          />
        </div>
      );

    case "view":
      return (
        <span className="lingvo-entry-content">{text}</span>
      );
    case "contributions":
      return entity.accepted ? (
        <span className="lingvo-entry-content">{text}</span>
      ) : (
        <Button.Group basic icon className="lingvo-buttons-group">
          <Button content={text} className="lingvo-buttons-group__text" />
          <Button 
            icon={<i className="lingvo-icon lingvo-icon_check2" />} 
            onClick={() => accept(entity, true)} 
          />
        </Button.Group>
      );
    default:
      return null;
  }
  
};

const Ordering = onlyUpdateForKeys([
  "entry",
  "entity",
  "mode",
  //"is_being_removed",
  //"is_being_updated",
  "checkedRow",
  "checkedColumn",
  "checkedAll",
  "number",
  "id",
])(props => {
  const {
    //perspectiveId,
    //column,
    //columns,
    checkEntries,
    checkedRow,
    resetCheckedRow,
    checkedColumn,
    resetCheckedColumn,
    checkedAll,
    resetCheckedAll,
    entry,
    allEntriesGenerator,
    entity,
    mode,
    //entitiesMode,
    //parentEntity,
    as: Component,
    className,
    publish,
    accept,
    //remove,
    //update,
    //breakdown,
    //is_being_removed,
    //is_being_updated,
    number,
    id,
  } = props;

  //const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      <TextEntityContent
        entry={entry} 
        entity={entity}
        checkEntries={checkEntries}
        checkedRow={checkedRow}
        resetCheckedRow={resetCheckedRow}
        checkedColumn={checkedColumn}
        resetCheckedColumn={resetCheckedColumn}
        checkedAll={checkedAll}
        resetCheckedAll={resetCheckedAll}
        mode={mode}
        //parentEntity={parentEntity}
        publish={publish}
        //column={column}
        accept={accept}
        //remove={remove}
        //update={update}
        //breakdown={breakdown}
        //is_being_removed={is_being_removed}
        //is_being_updated={is_being_updated}
        number={number}
        id={id} 
      />
      {/*subColumn && (
        <Entities
          perspectiveId={perspectiveId}
          column={subColumn}
          columns={columns}
          entry={entry}
          allEntriesGenerator={allEntriesGenerator}
          mode={mode}
          entitiesMode={entitiesMode}
          publish={publish}
          remove={remove}
          accept={accept}
          update={update}
        />
      )*/}
    </Component>
  );
});

Ordering.propTypes = {
  //perspectiveId: PropTypes.array.isRequired,
  //column: PropTypes.object.isRequired,
  //columns: PropTypes.array.isRequired,
  checkEntries: PropTypes.bool,
  checkedRow: PropTypes.object,
  checkedColumn: PropTypes.object,
  checkedAll: PropTypes.object,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  //parentEntity: PropTypes.object,
  //entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  publish: PropTypes.func,
  accept: PropTypes.func,
  //remove: PropTypes.func,
  //update: PropTypes.func,
  //breakdown: PropTypes.func,
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
  number: PropTypes.string,
  id: PropTypes.array.isRequired,
};

Ordering.defaultProps = {
  as: "li",
  className: ""
};

/*
const Edit = ({
  onSave,
  onCancel,
  is_being_created,
  parentEntity,
  breakdown
  }) => {

  const [content, setContent] = useState("");

  const onChange = useCallback((event) => {

    setContent(event.target.value);

  }, [content]);

  const onKeyDown = useCallback((event) => {

    breakdown(event, parentEntity);

    if (event.code === "Enter" && !event.ctrlKey) {

      if (content) {
        onSave(content);
      }
    }

    if (event.keyCode === 27) {
      onCancel();
    }
  }, [content]);

  const onHandlerSave = useCallback((event) => {

    if (content) {
      onSave(content);
    }

  }, [content]);

  return (
    <div className="lingvo-input-buttons-group">
      <TextareaAutosize
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="lingvo-input-action lingvo-input-action_textarea"
      />
      <Button.Group basic className="lingvo-buttons-group">
        <Button
          icon={is_being_created ? <i className="lingvo-icon lingvo-icon_spinner" /> : <i className="lingvo-icon lingvo-icon_save2" />}
          onClick={onHandlerSave}
          disabled={is_being_created || !content}
          className={is_being_created ? "lingvo-button-spinner" : ""}
        />
        <Button icon={<i className="lingvo-icon lingvo-icon_delete2" />} onClick={onCancel} />
      </Button.Group>
    </div>
  );

};

Edit.propTypes = {
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  parentEntity: PropTypes.object,
  breakdown: PropTypes.func
};

Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {}
};

Text.Edit = Edit;
*/

export default Ordering;
