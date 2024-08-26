import React from "react";
import { Button } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { flow, isEqual } from "lodash";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";

import { queryCounter } from "backend";
import { queryLexicalEntries } from "components/PerspectiveView";
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

class Entities extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      edit: false,
      is_being_created: false,
      remove_set: {},
      update_set: {}
    };
    this.create = this.create.bind(this);
    this.publish = this.publish.bind(this);
    this.accept = this.accept.bind(this);
    this.remove = this.remove.bind(this);
    this.update = this.update.bind(this);
    this.update_check = this.update_check.bind(this);
  }

  update_check() {
    /* Checking if we need to manually update perspective data. */

    const { entry, client, perspectiveId, entitiesMode, queryArgs } = this.props;

    const data_entities = client.readQuery({
      query: lexicalEntryQuery,
      variables: {
        id: entry.id,
        entitiesMode
      }
    });

    const data_perspective = queryArgs
    ? client.readQuery({
      query: queryLexicalEntries,
      variables: queryArgs
    })
    : { perspective: { perspective_page: { lexical_entries: [] }}};

    const {
      perspective: { perspective_page: { lexical_entries } }
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

        if (change_flag && queryArgs) {
          lexical_entry.entities = data_entities.lexicalentry.entities;

          client.writeQuery({
            query: queryLexicalEntries,
            variables: queryArgs,
            data: data_perspective
          });
        }

        break;
      }
    }

    this.setState({ edit: false });

  }

  create(content, self_id) {
    this.setState({ is_being_created: true });

    const { entry, column, createEntity } = this.props;

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
      this.update_check();
      this.setState({ is_being_created: false });
    });
  }

  publish(entity, published) {
    const { perspectiveId, entry, publishEntity } = this.props;

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
    }).then(() => this.update_check());
  }

  accept(entity, accepted) {
    const { entry, acceptEntity } = this.props;

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
    }).then(() => this.update_check());
  }

  remove(entity) {
    const entity_id_str = id2str(entity.id);

    const remove_set = this.state.remove_set;
    remove_set[entity_id_str] = null;
    this.setState({ remove_set });

    const { entry, removeEntity } = this.props;
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
      const remove_set = this.state.remove_set;

      delete remove_set[entity_id_str];
      this.setState({ remove_set });

      this.update_check();
    });
  }

  update(entity, content) {
    const entity_id_str = id2str(entity.id);

    const update_set = this.state.update_set;
    update_set[entity_id_str] = null;
    this.setState({ update_set });

    const { entry, updateEntity } = this.props;
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
      const update_set = this.state.update_set;

      delete update_set[entity_id_str];
      this.setState({ update_set });

      this.update_check();
    });
  }

  render() {
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
      resetCheckedAll
    } = this.props;

    const Component = getComponent(column.data_type);

    if (column.data_type === "Link" || column.data_type === "Grouping Tag" || column.data_type === "Directed Link") {
      return <Component {...this.props} />;
    }

    const filters = [
      ens => ens.filter(entity => isEqual(entity.field_id, column.id)),
      ens => (!parentEntity ? ens : ens.filter(e => isEqual(e.self_id, parentEntity.id)))
    ];
    const entities = flow(filters)(entry.entities);

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
            publish={this.publish}
            remove={this.remove}
            accept={this.accept}
            update={this.update}
            className={mode != "edit" && entities.indexOf(entity) == entities.length - 1 ? "last" : ""}
            disabled={disabled}
            is_being_removed={this.state.remove_set.hasOwnProperty(id2str(entity.id))}
            is_being_updated={this.state.update_set.hasOwnProperty(id2str(entity.id))}
          />
        ))}
        {mode === "edit" && (
          <li className="last">
            {!this.state.edit && (
              <Button.Group basic className="lingvo-buttons-group">
                <Button icon={<i className="lingvo-icon lingvo-icon_plus" />}
                  onClick={() => this.setState({ edit: true })} 
                />
              </Button.Group>
            )}

            {this.state.edit && (
              <Component.Edit
                is_being_created={this.state.is_being_created}
                onSave={content => this.create(content, parentEntity == null ? null : parentEntity.id)}
                onCancel={() => this.setState({ edit: false })}
              />
            )}
          </li>
        )}
      </ul>
    );
  }
}

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
  queryArgs: PropTypes.object
};

Entities.defaultProps = {
  parentEntity: null,
  queryArgs: null
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