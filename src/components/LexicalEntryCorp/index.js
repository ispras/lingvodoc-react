import React, {useCallback, useState} from "react";
import { useDrop } from "react-dnd";
import { Button } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { flow, isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";

import { queryCounter } from "backend";
/* new!!!!! */
/*import { queryLexicalEntries } from "components/PerspectiveView";*/
import { queryLexicalEntries } from "components/CorporaView";
/* /new!!!!! */
import { compositeIdToString, compositeIdToString as id2str } from "utils/compositeId";

import GroupingTag from "./GroupingTag";
import Image from "./Image";
import Link from "./Link";
import Markup from "./Markup";
import Sound from "./Sound";
import Text from "./Text";
import Unknown from "./Unknown";

const createEntityMutation = gql`
  mutation createEntity(
    $parent_id: LingvodocID!
    $field_id: LingvodocID!
    $self_id: LingvodocID
    $content: String
    $file_content: Upload
  ) {
    create_entity(
      parent_id: $parent_id
      field_id: $field_id
      self_id: $self_id
      content: $content
      file_content: $file_content
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
  mutation updateEntity($id: LingvodocID!, $content: String!) {
    update_entity_content(id: $id, content: $content) {
      triumph
    }
  }
`;

const lexicalEntryQuery = gql`
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
          link_perspective_id
        }
        is_subject_for_parsing
      }
    }
  }
`;

const getComponent = dataType =>
  ({
    Text,
    Sound,
    Markup,
    Link,
    Image,
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

  /* new!!!!! */
  /*const [basket, setBasket] = useState(null);*/

  const [{ isOver }, dropRef] = useDrop({
      accept: 'entity',
      drop: (item) => {
        /*console.log('useDrop: item====');
        console.log(item);*/
        /*remove(item, true);*/
        remove(item);
        /*create(item.content, parentEntity == null ? null : parentEntity.id, true);*/
        create(item.content, parentEntity == null ? null : parentEntity.id);
      },
      /*drop: (item) => setBasket((basket) => 
        !basket.includes(item) ? [...basket, item] : basket),*/
      collect: (monitor) => ({
          isOver: monitor.isOver()
      })
  });
  /* /new!!!!! */

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

  const create = useCallback((content, self_id) => {

    setIsBeingCreated(true);

    const variables = { parent_id: entry.id, field_id: column.id };
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

  const remove = useCallback((entity/*, isBasket*/) => {

    console.log('remove!!!!!!!!!!');

    //if (isBasket) {setBasket(entity);}

    console.log('entity===');
    console.log(entity);



    const entity_id_str = id2str(entity.id);

    const remove_set2 = remove_set;
    remove_set2[entity_id_str] = null;
    setRemoveSet(remove_set2);

    removeEntity({
      variables: { id: entity.id },
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
      const remove_set2 = remove_set;

      delete remove_set2[entity_id_str];
      setRemoveSet(remove_set2);
      console.log('after remove!!!!!');
      
      /*if (isBasket) {
        setBasket(entity);
      }*/

      update_check();
    });
  }, [remove_set/*, basket*/]);

  const update = useCallback((entity, content) => {

    const entity_id_str = id2str(entity.id);

    const update_set2 = update_set;
    update_set2[entity_id_str] = null;
    setUpdateSet(update_set2);

    updateEntity({
      variables: { id: entity.id, content },
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

  /*render() {
    const {
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
    } = this.props;*/

    /* ??????  */
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
    };

    const Component = getComponent(column.data_type);

    if (column.data_type === "Link" || column.data_type === "Grouping Tag" || column.data_type === "Directed Link") {
      /*return <Component {...this.props} />;*/
      return <Component {...props} />;
    }

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
            create={create} /* new!!!!!! */
            remove={remove}
            accept={accept}
            update={update}
            className={mode != "edit" && entities.indexOf(entity) == entities.length - 1 ? "last" : ""}
            disabled={disabled}
            is_being_removed={remove_set.hasOwnProperty(id2str(entity.id))}
            is_being_updated={update_set.hasOwnProperty(id2str(entity.id))}
            draggable={true} /* new!!!!! */
            id={entity.id} /* new!!!!! */
          />
        ))}
        {mode === "edit" && (
          <li className="last">
            {!edit && (
              <div ref={dropRef} /* new!!!! */>
                {/* new!!!!! */}
                {isOver && <div>Drop Here!</div>}
                {/* /new!!!!! */}

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
              />
            )}
          </li>
        )}
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
  withApollo,
  pure
)(Entities);
