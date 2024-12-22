import React, { useCallback, useState, useContext, useEffect } from "react";
import TranslationContext from "Layout/TranslationContext";
import { useDrag } from "react-dnd";
import { RangesMarker } from "react-mark.js";
import TextareaAutosize from "react-textarea-autosize";
import { Button, Checkbox, Confirm } from "semantic-ui-react";
import { find, isEqual } from "lodash";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";
import { deleteMarkupGroupMutation, refetchLexicalEntries } from "components/JoinMarkupsModal";
import { useMutation } from "hooks";
import { gql, useApolloClient } from "@apollo/client";

import Entities from "./index";

const TextEntityContent = ({
  entry,
  entity,
  mode,
  parentEntity,
  publish,
  column,
  accept,
  remove,
  breakdown,
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
  update,
  id
}) => {
  const is_order_column = number && column.english_translation === "Order";

  const [edit, setEdit] = useState(false);
  const [content, setContent] = useState(entity.content);
  const [read_only, setReadOnly] = useState(is_order_column);
  const [is_number, setIsNumber] = useState(is_order_column);

  const [dropped, setDropped] = useState(null);

  const [marking, setMarking] = useState({});
  const [browserSelection, setBrowserSelection] = useState(null);
  const [confirmation, setConfirmation] = useState(null);

  const client = useApolloClient();
  const [deleteMarkupGroup] = useMutation(deleteMarkupGroupMutation, {
    onCompleted: data => {
      refetchLexicalEntries(data.delete_markup_group.entry_ids, client);
      window.logger.suc(getTranslation("Markup(s) with related groups were removed"));
    }
  });

  const getTranslation = useContext(TranslationContext);

  const text = is_number ? number : entity.content;
  const markups = entity.additional_metadata?.markups || [];

  const getCurrentArea = useCallback(() => document.getElementById(id), [id]);

  // Pre-checking if current selection can be handled
  // as markup and choosing base text container
  const getCurrentSelection = (checkSelectedText = true) => {
    if (!document.getSelection().rangeCount) {
      return null;
    }

    const range = document.getSelection().getRangeAt(0);
    const selectedText = range.toString();

    if (checkSelectedText && !selectedText.length) {
      return null;
    }

    let startContainer = range.startContainer;

    // Going up to target element if we are inside e.g. <mark> tag
    while (startContainer.parentElement.tagName !== "DIV") {
      startContainer = startContainer.parentElement;
      if (!startContainer || !startContainer.parentElement) {
        return null;
      }
    }

    // if not "edit" mode. We can not simply check for mode value because of useEffect and EventListener specific
    if (startContainer.parentElement.parentElement.parentElement?.classList[0] !== "lingvo-input-buttons-group__name") {
      return null;
    }

    if (getCurrentArea().contains(startContainer)) {
      return {
        range,
        selectedText,
        startContainer
      };
    }
    return null;
  };

  // Calculating summary selection length
  const onBrowserSelection = () => {
    const currentSelection = getCurrentSelection();

    if (!currentSelection) {
      return;
    }

    const { range, selectedText, startContainer } = currentSelection;

    let startOffset = range.startOffset;
    let node = startContainer.previousSibling;

    // Calculate real start offset through the all previous siblings
    while (!!node) {
      startOffset += node.textContent.length;
      node = node.previousSibling;
    }

    const endOffset = startOffset + selectedText.length;

    console.log(id + " : " + startOffset + " : " + endOffset + " : " + selectedText);

    setBrowserSelection({
      startOffset,
      endOffset,
      selectedText
    });
  };

  // Reset browser selection on some events
  const resetMarkupAction = event => {
    if (!!getCurrentSelection(event.type !== "mousedown")) {
      setBrowserSelection(null);
      console.log("Reset markup action : " + id + " : " + Date.now());
    }
  };

  // Setting current markup action: create_markup/delete_markup/delete_with_group
  // according to browser selection
  useEffect(() => {
    if (!browserSelection) {
      setMarking({
        action: null,
        result: markups,
        groupsToDelete: null
      });
      return;
    }

    const startSelection = browserSelection.startOffset;
    const endSelection = browserSelection.endOffset;
    const selectedText = browserSelection.selectedText;

    var selected_action = null;
    const selected_markups = [[]];
    const selected_groups = [];

    // 'markups' variable has the following format:
    // [[[start_offset, end_offset], [group1_cid, group1_oid], ..., [groupN_cid, groupN_oid]]]
    for (const markup of markups) {
      const [indexes, ...groups] = markup;
      if (!indexes || indexes.length !== 2) {
        continue;
      }
      const [startMarkup, endMarkup] = indexes;

      if (
        (startMarkup <= startSelection && startSelection < endMarkup) ||
        (startMarkup < endSelection && endSelection <= endMarkup) ||
        (startSelection < startMarkup && endMarkup < endSelection)
      ) {
        selected_action = "delete_markup";

        if (groups.length > 0) {
          selected_groups.push(...groups);
        }
      } else {
        selected_markups.push(markup);
      }
    }

    if (selected_groups.length) {
      selected_action = "delete_with_group";
    }

    if (
      !selected_action &&
      selectedText === selectedText.trim() &&
      (startSelection === 0 || /\W/.test(text[startSelection - 1])) &&
      (endSelection === text.length || /\W/.test(text[endSelection]))
    ) {
      selected_action = "create_markup";
      selected_markups.push([[startSelection, endSelection]]);
    }

    console.log(selected_action + "; groups_to_delete: " + selected_groups);

    setMarking({
      action: selected_action,
      result: selected_markups,
      groupsToDelete: selected_groups
    });
  }, [browserSelection]);

  // Perform markup action
  const onMarkupAction = () => {
    const { result, action, groupsToDelete } = marking;

    if (action === "delete_with_group") {
      setConfirmation({
        content: getTranslation("Delete selected markups and related groups? Are you sure?"),
        func: () => {
          setConfirmation(null);
          deleteMarkupGroup({ variables: { groupIds: groupsToDelete, perspectiveId: entry.parent_id } });
          update(entity, undefined, result);
        }
      });
    } else {
      update(entity, undefined, result);

      if (action === "create_markup") {
        window.logger.suc(getTranslation("Markup was created"));
      } else if (action === "delete_markup") {
        window.logger.suc(getTranslation("Markup was deleted"));
      }
    }
    setBrowserSelection(null);
  };

  const onEdit = useCallback(() => {
    if (!edit) {
      setEdit(true);
    } else {
      update(entity, content);
      setEdit(false);
    }
  }, [edit, content]);

  const onKeyDown = useCallback(
    event => {
      breakdown(event, parentEntity, entity);

      if (event.code === "Enter" && !event.ctrlKey) {
        onEdit();
      }

      if (event.keyCode === 27) {
        setEdit(false);
      }
    },
    [edit, content]
  );

  // useDrag - the list item is draggable
  const [{ isDragging }, dragRef, preview] = useDrag({
    type: "entity",
    item: { id, content, metadata: entity.additional_metadata },
    collect: monitor => ({
      isDragging: monitor.isDragging()
    }),
    end: (item, monitor) => {
      if (monitor.didDrop()) {
        setDropped(item);
        remove(item, entry.id);
      }
    }
  });

  useEffect(() => {
    const element = getCurrentArea();
    element?.addEventListener("mouseenter", onBrowserSelection);
    element?.addEventListener("mouseleave", resetMarkupAction);
    element?.children[0]?.addEventListener("mouseup", onBrowserSelection);
    element?.children[0]?.addEventListener("mousedown", resetMarkupAction);
  }, [preview]);

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
  const snt = /\u2260/;
  const missed = /[/]missed text[/]/;
  const metatext = new RegExp([pg_ln, pg, ln, snt, missed].map(regex => regex.source).join("|"), "g");

  const highlights = [];
  const highlightsMarkup = [];

  for (const [indexes, ..._] of markups) {
    if (!indexes || indexes.length !== 2) {
      continue;
    }
    const [startMarkup, endMarkup] = indexes;

    highlightsMarkup.push({
      start: startMarkup,
      length: endMarkup - startMarkup
    });
  }

  let segment;

  while ((segment = metatext.exec(text)) !== null) {
    highlights.push({
      start: segment.index,
      length: segment[0].length
    });
  }

  switch (mode) {
    case "edit":
      return !dropped ? (
        <div
          className={
            (isDragging && "lingvo-input-buttons-group lingvo-input-buttons-group_drag") || "lingvo-input-buttons-group"
          }
          ref={preview}
          id={id}
        >
          {!(is_being_updated || edit) && (
            <span className="lingvo-input-buttons-group__name">
              <RangesMarker
                mark={highlights}
                options={{
                  className: "lingvo-marker"
                }}
              >
                <RangesMarker
                  mark={highlightsMarkup}
                  options={{
                    className: "lingvo-marker-markup"
                  }}
                >
                  {text}
                </RangesMarker>
              </RangesMarker>
            </span>
          )}
          {(is_being_updated || edit) && (
            <TextareaAutosize
              defaultValue={text}
              onChange={event => setContent(event.target.value)}
              onKeyDown={onKeyDown}
              className="lingvo-input-action lingvo-input-action_textarea"
            />
          )}
          {read_only || (
            <Button.Group basic icon className="lingvo-buttons-group">
              <div ref={dragRef} className="lingvo-buttons-group__drag">
                <Button icon={<i className="lingvo-icon lingvo-icon_dnd" />} />
              </div>
              {/* Markups */}
              {marking.action === "create_markup" && (
                <Button
                  className="lingvo-button-markup lingvo-button-markup_create"
                  content="+M"
                  title={getTranslation("Create markup")}
                  onClick={onMarkupAction}
                  disabled={is_being_updated}
                />
              )}
              {marking.action === "delete_markup" && (
                <Button
                  className="lingvo-button-markup lingvo-button-markup_delete"
                  content="-M"
                  title={getTranslation("Delete markup(s)")}
                  onClick={onMarkupAction}
                  disabled={is_being_updated}
                />
              )}
              {marking.action === "delete_with_group" && (
                <Button
                  className="lingvo-button-markup lingvo-button-markup_delete"
                  content="-G"
                  title={getTranslation("Delete markup(s) with related groups")}
                  onClick={onMarkupAction}
                  disabled={is_being_updated}
                />
              )}
              {/* /Markups */}
              <Button
                icon={
                  is_being_updated ? (
                    <i className="lingvo-icon lingvo-icon_spinner" />
                  ) : edit ? (
                    <i className="lingvo-icon lingvo-icon_save2" />
                  ) : (
                    <i className="lingvo-icon lingvo-icon_edit2" />
                  )
                }
                onClick={onEdit}
                disabled={is_being_updated || !text}
                className={is_being_updated ? "lingvo-button-spinner" : ""}
              />
              {is_being_removed ? (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_spinner" />}
                  disabled
                  className="lingvo-button-spinner"
                />
              ) : (
                <Button icon={<i className="lingvo-icon lingvo-icon_delete2" />} onClick={() => remove(entity)} />
              )}
            </Button.Group>
          )}
          <Confirm
            open={confirmation !== null}
            header={getTranslation("Confirmation")}
            content={confirmation ? confirmation.content : null}
            onConfirm={confirmation ? confirmation.func : null}
            onCancel={() => setConfirmation(null)}
            className="lingvo-confirm"
          />
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
            <span className="lingvo-entry-content">
              <RangesMarker
                mark={highlights}
                options={{
                  className: "lingvo-marker"
                }}
              >
                <RangesMarker
                  mark={highlightsMarkup}
                  options={{
                    className: "lingvo-marker-markup"
                  }}
                >
                  {text}
                </RangesMarker>
              </RangesMarker>
            </span>
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
        <span className="lingvo-entry-content">
          <RangesMarker
            mark={highlights}
            options={{
              className: "lingvo-marker"
            }}
          >
            <RangesMarker
              mark={highlightsMarkup}
              options={{
                className: "lingvo-marker-markup"
              }}
            >
              {text}
            </RangesMarker>
          </RangesMarker>
        </span>
      );
    case "contributions":
      return entity.accepted ? (
        <span className="lingvo-entry-content">
          <RangesMarker
            mark={highlights}
            options={{
              className: "lingvo-marker"
            }}
          >
            <RangesMarker
              mark={highlightsMarkup}
              options={{
                className: "lingvo-marker-markup"
              }}
            >
              {text}
            </RangesMarker>
          </RangesMarker>
        </span>
      ) : (
        <Button.Group basic icon className="lingvo-buttons-group">
          <Button content={text} className="lingvo-buttons-group__text" />
          <Button icon={<i className="lingvo-icon lingvo-icon_check2" />} onClick={() => accept(entity, true)} />
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
  "id"
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
    parentEntity,
    as: Component,
    className,
    publish,
    accept,
    remove,
    update,
    breakdown,
    is_being_removed,
    is_being_updated,
    number,
    id
  } = props;

  const subColumn = find(columns, c => isEqual(c.self_id, column.column_id));

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
        parentEntity={parentEntity}
        publish={publish}
        column={column}
        accept={accept}
        remove={remove}
        update={update}
        breakdown={breakdown}
        is_being_removed={is_being_removed}
        is_being_updated={is_being_updated}
        number={number}
        id={id}
      />
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
  parentEntity: PropTypes.object,
  entitiesMode: PropTypes.string.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  publish: PropTypes.func,
  accept: PropTypes.func,
  remove: PropTypes.func,
  update: PropTypes.func,
  breakdown: PropTypes.func,
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
  number: PropTypes.string,
  id: PropTypes.array.isRequired
};

Text.defaultProps = {
  as: "li",
  className: ""
};

const Edit = ({ onSave, onCancel, is_being_created, parentEntity, breakdown }) => {
  const [content, setContent] = useState("");

  const onChange = useCallback(
    event => {
      setContent(event.target.value);
    },
    [content]
  );

  const onKeyDown = useCallback(
    event => {
      breakdown(event, parentEntity);

      if (event.code === "Enter" && !event.ctrlKey) {
        if (content) {
          onSave(content);
        }
      }

      if (event.keyCode === 27) {
        onCancel();
      }
    },
    [content]
  );

  const onHandlerSave = useCallback(
    event => {
      if (content) {
        onSave(content);
      }
    },
    [content]
  );

  return (
    <div className="lingvo-input-buttons-group">
      <TextareaAutosize
        onChange={onChange}
        onKeyDown={onKeyDown}
        className="lingvo-input-action lingvo-input-action_textarea"
      />
      <Button.Group basic className="lingvo-buttons-group">
        <Button
          icon={
            is_being_created ? (
              <i className="lingvo-icon lingvo-icon_spinner" />
            ) : (
              <i className="lingvo-icon lingvo-icon_save2" />
            )
          }
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

export default Text;
