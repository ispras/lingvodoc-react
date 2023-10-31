import React, { useCallback, useState } from "react";
import { useDrag } from "react-dnd";
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Checkbox } from "semantic-ui-react";
import { find, isEqual } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";
import { RegExpMarker } from "react-mark.js";

import Entities from "./index";

const TextEntityContent = ({
  entity,
  mode,
  parentEntity, /* new!!!!!! */
  publish,
  column,
  accept,
  remove,
  breakdown, /* new!!!!!!! */
  is_being_removed,
  is_being_updated,
  checkEntries,
  checkedRow,
  resetCheckedRow,
  checkedColumn,
  resetCheckedColumn,
  checkedAll,
  resetCheckedAll,
  number,
  update, /* new!!!!!! */
  /*draggable*/ /* new!!!!!! */
  id /* new!!!!!! */
}) => {

  const is_order_column = (number && column.english_translation === "Order");

  const [edit, setEdit] = useState(false);
  const [content, setContent] = useState(entity.content);
  const [read_only, setReadOnly] = useState(is_order_column);
  const [is_number, setIsNumber] = useState(is_order_column);

  /* new!!!!!! */
  const [dropped, setDropped] = useState(null);
  /* /new!!!!!! */

  const onEdit = useCallback(() => {
    if (!edit) {
      setEdit(true);
    } else {
      update(entity, content);
      setEdit(false);
    }
  }, [edit, content]);

  /* new!!!!! */

  const onKeyDown = useCallback((event) => {

    breakdown(event, parentEntity, entity);

    if (event.code === "Enter" && !event.ctrlKey) {
      onEdit();
    }

  }, [edit, content]);

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
      }
    }
  });

  /* /new!!!!! */
  const text = is_number ? number : entity.content;

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

  const pg_ln = /\[\d+[ab]?:\d+\]/;
  const pg = /\[\d+[ab]?\]/;
  const ln = /\(\d+\)/;
  const snt = /\/{2}/;
  const missed = /[/]missed text[/]/;
  const metatext = new RegExp(
    pg_ln.source + "|" +
    pg.source + "|" +
    ln.source + "|" +
    snt.source + "|" +
    missed.source
  );

  switch (mode) {
    case "edit":
      return !dropped ? (
        <div /* new!!!! */ className={isDragging && "lingvo-input-buttons-group lingvo-input-buttons-group_drag" || "lingvo-input-buttons-group"} ref={preview} id={id}>
          {!(is_being_updated || edit) && (
            <span className="lingvo-input-buttons-group__name"><RegExpMarker mark={metatext}>{text}</RegExpMarker></span>
          )}
          {(is_being_updated || edit) && (
            /* new!!!!!! */
            <TextareaAutosize 
              defaultValue={text}
              onChange={(event) => setContent(event.target.value)}
              onKeyDown={onKeyDown}
              className="lingvo-input-action lingvo-input-action_textarea" 
            />
            /* /new!!!!!! */
          )}
          { read_only || (
            <Button.Group basic icon className="lingvo-buttons-group">
              {/* new!!!!! */}
              <div ref={dragRef} className="lingvo-buttons-group__drag">
                <Button icon={<i className="lingvo-icon lingvo-icon_dnd" />} />
              </div>
              {/* new!!!!! */}
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
          )}
        </div>
      ) : null;
    case "publish":
      return (
        <div className="lingvo-entry-text">
          {column.english_translation &&
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
          )}
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
        <span className="lingvo-entry-content"><RegExpMarker mark={metatext}>{text}</RegExpMarker></span>
      );
    case "contributions":
      return entity.accepted ? (
        <span className="lingvo-entry-content"><RegExpMarker mark={metatext}>{text}</RegExpMarker></span>
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

const Text = onlyUpdateForKeys([
  "entry",
  "entity",
  "mode",
  "is_being_removed",
  "is_being_updated",
  "checkedRow",
  "checkedColumn",
  "checkedAll",
  "number",
  "draggable", // new!!!!!! 
  "id", // new!!!!!!
])(props => {
  const {
    perspectiveId,
    column,
    columns,
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
    entitiesMode,
    parentEntity, /* new!!!! */
    as: Component,
    className,
    publish,
    accept,
    remove,
    update,
    breakdown, /* new!!!!!!! */
    is_being_removed,
    is_being_updated,
    number,
    draggable, /* new!!!!!! */
    id, /* new!!!!!! */
  } = props;

  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

  return (
    <Component className={className}>
      {draggable && (
      <TextEntityContent
        entity={entity}
        checkEntries={checkEntries}
        checkedRow={checkedRow}
        resetCheckedRow={resetCheckedRow}
        checkedColumn={checkedColumn}
        resetCheckedColumn={resetCheckedColumn}
        checkedAll={checkedAll}
        resetCheckedAll={resetCheckedAll}
        mode={mode}
        parentEntity={parentEntity} /* new!!!!! */
        publish={publish}
        column={column}
        accept={accept}
        remove={remove}
        update={update}
        breakdown={breakdown} /* new!!!!!!! */
        is_being_removed={is_being_removed}
        is_being_updated={is_being_updated}
        number={number}
        id={id} /* new!!!!!! */
        draggable /* new!!!!!! */
      />
      ) || (
        <TextEntityContent
          entity={entity}
          checkEntries={checkEntries}
          checkedRow={checkedRow}
          resetCheckedRow={resetCheckedRow}
          checkedColumn={checkedColumn}
          resetCheckedColumn={resetCheckedColumn}
          checkedAll={checkedAll}
          resetCheckedAll={resetCheckedAll}
          mode={mode}
          parentEntity={parentEntity} /* new!!!!! */
          publish={publish}
          column={column}
          accept={accept}
          remove={remove}
          update={update}
          breakdown={breakdown} /* new!!!!!!! */
          is_being_removed={is_being_removed}
          is_being_updated={is_being_updated}
          number={number}
          id={id} /* new!!!!!! */
        />
      )}
      {subColumn && (
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
      )}
    </Component>
  );
});

Text.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  checkEntries: PropTypes.bool,
  checkedRow: PropTypes.object,
  checkedColumn: PropTypes.object,
  checkedAll: PropTypes.object,
  entry: PropTypes.object.isRequired,
  entity: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  parentEntity: PropTypes.object, /* new!!!!!! */
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  publish: PropTypes.func,
  accept: PropTypes.func,
  remove: PropTypes.func,
  update: PropTypes.func,
  breakdown: PropTypes.func, /* new!!!!! */
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
  number: PropTypes.string,
  draggable: PropTypes.bool, /* new!!!!! */
  id: PropTypes.array.isRequired, /* new!!!!! */
};

Text.defaultProps = {
  as: "li",
  className: ""
};

const Edit = ({
  onSave, 
  onCancel, 
  is_being_created,
  parentEntity, /* new!!!!!! */
  breakdown /* new!!!!! */
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
        /*onBlur={onBlur}*/
        className="lingvo-input-action lingvo-input-action_textarea" 
      />
      <Button.Group basic className="lingvo-buttons-group">
        <Button 
          icon={is_being_created ? <i className="lingvo-icon lingvo-icon_spinner" /> : <i className="lingvo-icon lingvo-icon_save2" />} 
          onClick={onHandlerSave} /* new!!!!! */
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
  parentEntity: PropTypes.object, /* new!!!!!! */
  breakdown: PropTypes.func /* new!!!!! */
};

Edit.defaultProps = {
  onSave: () => {},
  onCancel: () => {}
};

Text.Edit = Edit;

export default Text;
