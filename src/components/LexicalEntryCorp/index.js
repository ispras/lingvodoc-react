import React, {useCallback, useContext, useState} from "react";
import { useDrop } from "react-dnd";
import { Button, Confirm } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { useMutation } from "hooks";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { flow, isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";

import { queryCounter } from "backend";
import { queryLexicalEntries } from "components/CorporaView";
import { deleteMarkupGroupMutation, refetchLexicalEntries } from "components/JoinMarkupsModal";
import TranslationContext from "Layout/TranslationContext";
import { patienceDiff } from "utils/patienceDiff";
import { compositeIdToString, compositeIdToString as id2str } from "utils/compositeId";

import GroupingTag from "./GroupingTag";
import Image from "./Image";
import Link from "./Link";
import Markup from "./Markup";
import Sound from "./Sound";
import Text from "./Text";
import Ordering from "./Ordering";
import Unknown from "./Unknown";

const createEntityMutation = gql`
  mutation createEntity(
    $parent_id: LingvodocID!
    $field_id: LingvodocID!
    $self_id: LingvodocID
    $content: String
    $file_content: Upload
    $metadata: ObjectVal
  ) {
    create_entity(
      parent_id: $parent_id
      field_id: $field_id
      self_id: $self_id
      content: $content
      file_content: $file_content
      additional_metadata: $metadata
    ) {
      triumph
    }
  }
`;

const publishEntityMutation = gql`
  mutation publishEntity($id: LingvodocID!, $published: Boolean!) {
    update_entity(id: $id, published: $published) {
      triumph
    }
  }
`;

const acceptEntityMutation = gql`
  mutation acceptEntity($id: LingvodocID!, $accepted: Boolean!) {
    update_entity(id: $id, accepted: $accepted) {
      triumph
    }
  }
`;

const removeEntityMutation = gql`
  mutation removeEntity($id: LingvodocID!) {
    delete_entity(id: $id) {
      triumph
    }
  }
`;

const updateEntityMutation = gql`
  mutation updateEntity($id: LingvodocID!, $content: String!, $markups: [ObjectVal]) {
    update_entity_content(id: $id, content: $content, markups: $markups) {
      triumph
    }
  }
`;

export const lexicalEntryQuery = gql`
  query LexicalEntryQuery($id: LingvodocID!, $entitiesMode: String!) {
    lexicalentry(id: $id) {
      id
      parent_id
      created_at
      marked_for_deletion
      entities(mode: $entitiesMode) {
        id
        parent_id
        field_id
        link_id
        self_id
        created_at
        locale_id
        content
        published
        accepted
        additional_metadata {
          link_perspective_id,
          markups
        }
        is_subject_for_parsing
      }
    }
  }
`;

const getSelectionStart = (o) => {
  if (o.createTextRange) {
    const r = document.selection.createRange().duplicate();
    r.moveEnd('character', o.value.length);
    if (r.text === '') {
      return o.value.length;
    }
    return o.value.lastIndexOf(r.text);
  } else {
    return o.selectionStart;
  }
};

const getSelectionEnd = (o) => {
  if (o.createTextRange) {
    const r = document.selection.createRange().duplicate();
    r.moveStart('character', -o.value.length);
    return r.text.length;
  } else {
    return o.selectionEnd;
  }
};

const getComponent = dataType =>
  ({
    Text,
    Sound,
    Markup,
    Link,
    Image,
    Ordering,
    "Grouping Tag": GroupingTag,
    "Directed Link": Link
  }[dataType] || Unknown);

const Entities = ({
  perspectiveId,
  entry,
  allEntriesGenerator,
  column,
  columns,
  mode,
  entitiesMode,
  parentEntity,
  disabled,
  checkEntries,
  checkedRow,
  resetCheckedRow,
  checkedColumn,
  resetCheckedColumn,
  checkedAll,
  resetCheckedAll,
  publishEntity,
  createEntity,
  acceptEntity,
  removeEntity,
  updateEntity,
  client,
  number
  }) => {

  const filters = [
    ens => ens.filter(entity => isEqual(entity.field_id, column.id)),
    ens => (!parentEntity ? ens : ens.filter(e => isEqual(e.self_id, parentEntity.id)))
  ];
  
  const entities = flow(filters)(entry.entities);

  const [edit, setEdit] = useState(false);
  const [is_being_created, setIsBeingCreated] = useState(false);
  const [remove_set, setRemoveSet] = useState({});
  const [update_set, setUpdateSet] = useState({});
  const [confirmation, setConfirmation] = useState(null);

  const [deleteMarkupGroup] = useMutation(deleteMarkupGroupMutation, {
    onCompleted: data => {
      refetchLexicalEntries(data.delete_markup_group.entry_ids, client);
      window.logger.warn(getTranslation("Markup(s) with related groups were removed"));
    }
  });

  const getTranslation = useContext(TranslationContext);

  const [{ isOver }, dropRef] = useDrop({
      accept: 'entity',
      drop: (item) => {
        create(item.content, parentEntity == null ? null : parentEntity.id, item.metadata);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver()
      })
  });

  const update_check = useCallback(() => {
    /* Checking if we need to manually update perspective data. */

    const data_entities = client.readQuery({
      query: lexicalEntryQuery,
      variables: {
        id: entry.id,
        entitiesMode
      }
    });

    const data_perspective = client.readQuery({
      query: queryLexicalEntries,
      variables: {
        id: perspectiveId,
        entitiesMode
      }
    });

    const {
      perspective: { lexical_entries }
    } = data_perspective;

    const entry_id_str = id2str(entry.id);

    for (const lexical_entry of lexical_entries) {
      if (id2str(lexical_entry.id) == entry_id_str) {
        const before_id_set = new Set();
        const after_id_set = new Set();

        for (const entity of lexical_entry.entities) {
          before_id_set.add(id2str(entity.id));
        }

        for (const entity of data_entities.lexicalentry.entities) {
          after_id_set.add(id2str(entity.id));
        }

        let change_flag = before_id_set.size != after_id_set.size;

        if (!change_flag) {
          for (const id_str of after_id_set) {
            if (!before_id_set.has(id_str)) {
              change_flag = true;
              break;
            }
          }
        }

        /* If for some reason queryLexicalEntries failed to update (e.g. when there are several thousand
         * entries and Apollo GraphQL cache glitches), we update it manually. */

        if (change_flag) {
          lexical_entry.entities = data_entities.lexicalentry.entities;

          client.writeQuery({
            query: queryLexicalEntries,
            variables: {
              id: perspectiveId,
              entitiesMode
            },
            data: data_perspective
          });
        }

        break;
      }
    }

    setEdit(false);

  }, [edit]);

  const create = useCallback((content, self_id, metadata=null) => {

    setIsBeingCreated(true);

    const variables = { parent_id: entry.id, field_id: column.id, metadata };
    if (content instanceof File) {
      variables.content = null;
      variables.file_content = content;
    } else {
      variables.content = content;
      variables.file_content = null;
    }
    if (self_id) {
      variables.self_id = self_id;
    }

    createEntity({
      variables,
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "all"
          }
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "published"
          }
        }
      ],
      awaitRefetchQueries: true
    }).then(() => {
      update_check();
      setIsBeingCreated(false);
    });

  }, [is_being_created]);

  const publish = useCallback((entity, published) => {

    publishEntity({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "all"
          }
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "published"
          }
        },
        {
          query: queryCounter,
          variables: {
            id: perspectiveId,
            mode: "published"
          }
        }
      ],
      awaitRefetchQueries: true
    }).then(() => update_check());
  }, []);

  const accept = useCallback((entity, accepted) => {
    acceptEntity({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "all"
          }
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "published"
          }
        }
      ],
      awaitRefetchQueries: true
    }).then(() => update_check());
  }, []);

  const remove = useCallback((entity, entryId) => {
    
    const entity_id_str = id2str(entity.id);

    const remove_set2 = remove_set;
    remove_set2[entity_id_str] = null;
    setRemoveSet(remove_set2);

    const groupsToDelete = [];

    for (const markup of (entity.additional_metadata?.markups ?? [])) {
      if (!markup.length) {
        continue;
      }

      const [_, ...groupIds] = markup;

      if (groupIds.length > 0) {
        groupsToDelete.push(...groupIds);
      }
    }

    if (groupsToDelete.length > 0) {
      deleteMarkupGroup({ variables: { groupIds: groupsToDelete, perspectiveId }});
    }

    removeEntity({
      variables: { id: entity.id },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entryId || entry.id,
            entitiesMode: "all"
          }
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entryId || entry.id,
            entitiesMode: "published"
          }
        }
      ],
      awaitRefetchQueries: true
    }).then(() => {
      const remove_set2 = remove_set;

      delete remove_set2[entity_id_str];
      setRemoveSet(remove_set2);
      
      update_check();
    });
  }, [remove_set]);

  const update = useCallback((entity, content = entity.content, ready_markups = null) => {

    const entity_id_str = id2str(entity.id);

    const update_set2 = update_set;
    update_set2[entity_id_str] = null;
    setUpdateSet(update_set2);

    const markups = ready_markups || [[]];

    if (!ready_markups &&
        content !== entity.content &&
        entity.additional_metadata?.markups &&
        entity.additional_metadata.markups.length > 1) {

      const diff = patienceDiff(entity.content, content).lines;

      for (const markup of entity.additional_metadata.markups) {
        if (!markup.length || markup[0].length !== 2) {
          continue;
        }

        let [[startOffset, endOffset], ...groupIds] = markup;
        const startIndex = diff.map(ch => ch.aIndex).indexOf(startOffset);
        const endIndex = diff.map(ch => ch.aIndex).indexOf(endOffset);
        const markupDiff = diff.slice(0, endIndex);

        for (const [i, {aIndex, bIndex}] of markupDiff.entries()) {
          if (aIndex === -1) {
            if (i < startIndex) {
              startOffset++;
            }
            endOffset++;
          }
          if (bIndex === -1) {
            if (i < startIndex) {
              startOffset--;
            }
            endOffset--;
          }
        }

        // Markup must be not empty and have at least one letter char
        if (startOffset < endOffset &&
            /\w/.test(content.slice(startOffset, endOffset))) {
          markups.push([[startOffset, endOffset], ...groupIds]);
          window.logger.suc(getTranslation("Markup was moved"));

        } else if (groupIds.length > 0) {
          deleteMarkupGroup({ variables: { groupIds, perspectiveId } });

        } else {
          window.logger.warn(getTranslation("Markup was deleted"));
        }
      }
    }

    updateEntity({
      variables: { id: entity.id, content, markups },
      refetchQueries: [
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "all"
          }
        },
        {
          query: lexicalEntryQuery,
          variables: {
            id: entry.id,
            entitiesMode: "published"
          }
        }
      ],
      awaitRefetchQueries: true
    }).then(() => {
      const update_set2 = update_set;

      delete update_set2[entity_id_str];
      setUpdateSet(update_set2);

      update_check();
    });
  }, [update_set]);

  const splitEntity = ({
    entity,
    parentEntity,
    beforeCaret,
    afterCaret,
    metadata,
    firstMarkups,
    secondMarkups
  }) => {

    if (entity) {
      remove(entity);
    }

    create(
      beforeCaret,
      parentEntity === null ? null : parentEntity.id,
      metadata={...metadata, 'markups': firstMarkups}
    );

    create(
      afterCaret,
      parentEntity === null ? null : parentEntity.id,
      metadata={...metadata, 'markups': secondMarkups}
    );
  };

  /* Shortcut "ctrl+Enter" */
  const breakdown = useCallback((event, parentEntity, entity) => {

    if (event.ctrlKey && event.code === "Enter") {
      event.preventDefault();

      const eventTarget = event.target;
      const targetValue = eventTarget.value;

      const selectionStart = getSelectionStart(eventTarget);
      const selectionEnd = getSelectionEnd(eventTarget);

      if (selectionStart === 0 && selectionEnd === 0) {
        return;
      }

      if (selectionStart === targetValue.length && selectionEnd === targetValue.length) {
        return;
      }

      const beforeCaret = targetValue.substring(0, selectionStart).replace(/ /g, '\x20') || '\x20';
      const afterCaret = targetValue.substring(selectionStart).replace(/ /g, '\x20') || '\x20';
      const metadata = entity.additional_metadata || {};
      const markups = metadata.markups || [];
      const brokenGroups = [];
      let brokenMarkup = false;
      const firstMarkups = [[]];
      const secondMarkups = [[]];

      for (const markup of markups) {
        if (!markup.length || markup[0].length !== 2) {
          continue;
        }

        const [[startOffset, endOffset], ...groupIds] = markup;

        if (startOffset < selectionStart && endOffset <= selectionStart) {
          firstMarkups.push(markup);
        } else if (startOffset >= selectionStart && endOffset > selectionStart) {
          secondMarkups.push([[startOffset - selectionStart, endOffset - selectionStart], ...groupIds]);
        } else {
          brokenMarkup = true;
          brokenGroups.push(...groupIds);
        }
      }

      const variables = {
        entity,
        parentEntity,
        beforeCaret,
        afterCaret,
        metadata,
        firstMarkups,
        secondMarkups
      };

      if (brokenMarkup) {
        setConfirmation({
          content: getTranslation("You are going to delete a markup and related groups? Are you sure?"),
          func: () => {
            setConfirmation(null);
            splitEntity({...variables});
            if (brokenGroups.length > 0) {
              deleteMarkupGroup({ variables: { groupIds: brokenGroups, perspectiveId } });
            }
          }
        });
      } else {
        splitEntity({...variables});
      }
    }
  }, []);

  const props = {
    perspectiveId,
    entry,
    allEntriesGenerator,
    column,
    columns,
    mode,
    entitiesMode,
    parentEntity,
    disabled,
    checkEntries,
    checkedRow,
    resetCheckedRow,
    checkedColumn,
    resetCheckedColumn,
    checkedAll,
    resetCheckedAll,
    number
  };

  const Component = getComponent(column.data_type);

  if (column.data_type === "Link" || column.data_type === "Grouping Tag" || column.data_type === "Directed Link") {
    return <Component {...props} />;
  }

  const is_order_column = column.english_translation === "Order";

  return (
    <ul>
      {entities.map(entity => (
        <Component
          key={compositeIdToString(entity.id)}
          perspectiveId={perspectiveId}
          as="li"
          column={column}
          columns={columns}
          checkEntries={checkEntries}
          checkedRow={checkedRow}
          resetCheckedRow={resetCheckedRow}
          checkedColumn={checkedColumn}
          resetCheckedColumn={resetCheckedColumn}
          checkedAll={checkedAll}
          resetCheckedAll={resetCheckedAll}
          entry={entry}
          allEntriesGenerator={allEntriesGenerator}
          entity={entity}
          mode={mode}
          entitiesMode={entitiesMode}
          parentEntity={parentEntity}
          publish={publish}
          remove={remove}
          accept={accept}
          update={update}
          breakdown={breakdown}
          className={mode != "edit" && entities.indexOf(entity) == entities.length - 1 ? "last" : ""}
          disabled={disabled}
          is_being_removed={remove_set.hasOwnProperty(id2str(entity.id))}
          is_being_updated={update_set.hasOwnProperty(id2str(entity.id))}
          number={number} 
          id={entity.id}
        />
      ))}
      {mode === "edit" && !is_order_column && (
        <li className="last">
          {!edit && (
            <div ref={dropRef}>
              {isOver && <div className="lingvo-drop-here">{getTranslation("Drop Here!")}</div>}

              <Button.Group basic className="lingvo-buttons-group">
                <Button icon={<i className="lingvo-icon lingvo-icon_plus" />}
                  onClick={() => setEdit(true)} 
                />
              </Button.Group>
            </div>
          )}

          {edit && (
            <Component.Edit
              is_being_created={is_being_created}
              onSave={content => create(content, parentEntity == null ? null : parentEntity.id)}
              onCancel={() => setEdit(false)}
              parentEntity={parentEntity} 
              breakdown={breakdown} 
            />
          )}
        </li>
      )}
      <Confirm
        open={confirmation !== null}
        header={getTranslation("Confirmation")}
        content={confirmation ? confirmation.content : null}
        onConfirm={confirmation ? confirmation.func : null}
        onCancel={() => setConfirmation(null)}
        className="lingvo-confirm"
      />
    </ul>
  );
};

Entities.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entry: PropTypes.object.isRequired,
  column: PropTypes.object.isRequired,
  columns: PropTypes.array.isRequired,
  checkEntries: PropTypes.bool,
  checkedRow: PropTypes.object,
  checkedColumn: PropTypes.object,
  checkedAll: PropTypes.object,
  mode: PropTypes.string.isRequired,
  parentEntity: PropTypes.object,
  entitiesMode: PropTypes.string.isRequired,
  createEntity: PropTypes.func.isRequired,
  publishEntity: PropTypes.func.isRequired,
  acceptEntity: PropTypes.func.isRequired,
  removeEntity: PropTypes.func.isRequired,
  updateEntity: PropTypes.func.isRequired,
  resetCheckedRow: PropTypes.func,
  resetCheckedColumn: PropTypes.func,
  resetCheckedAll: PropTypes.func,
  reRender: PropTypes.func,
  number: PropTypes.string
};

Entities.defaultProps = {
  parentEntity: null
};

export default compose(
  graphql(publishEntityMutation, { name: "publishEntity" }),
  graphql(acceptEntityMutation, { name: "acceptEntity" }),
  graphql(createEntityMutation, { name: "createEntity" }),
  graphql(removeEntityMutation, { name: "removeEntity" }),
  graphql(updateEntityMutation, { name: "updateEntity" }),
  withApollo
)(Entities);
