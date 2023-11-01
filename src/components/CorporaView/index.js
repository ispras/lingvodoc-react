import React, { useState } from "react";
/* new!!!!! */
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
/* /new!!!!! */
import { connect } from "react-redux";
import { Button, Dimmer, Header, Icon, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import update from 'immutability-helper';
import { drop, flow, isEqual, reverse, sortBy, take } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderComponent } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import ApproveModal from "components/ApproveModal";
import Pagination from "components/Pagination";
import Placeholder from "components/Placeholder";
import { openModal } from "ducks/modals";
import {
  addLexicalEntry,
  resetEntriesSelection,
  resetSortByField,
  selectLexicalEntry,
  setSortByField
} from "ducks/perspective";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";
import smoothScroll from "utils/smoothscroll";

import TableBody from "./TableBody";
import TableHeader from "./TableHeader";

import "./styles.scss";

const ROWS_PER_PAGE = 20;

const ModalContentWrapper = styled("div")`
  min-height: 15vh;
`;

export const queryPerspective = gql`
  query queryPerspective1($id: LingvodocID!) {
    perspective(id: $id) {
      id
      translations
      columns {
        id
        field_id
        parent_id
        self_id
        position
        field {
          id
          translations
          # NOTE: this field of this query is not used, but it needs to stay here because otherwise on showing
          # of CognateAnalysisModal the query's data gets invalidated and we have to refetch it, see
          # corresponding comments in PerspectiveViewWrapper and languageQuery of CognateAnalysisModal, and
          # fetching another translation for fields doesn't slow down everything noticeably.
          english_translation: translation(locale_id: 2)
          data_type
          data_type_translation_gist_id
        }
      }
    }
  }
`;

/*
 * If you modify this query by adding field to 'entities', please modify query 'connectedQuery' in
 * src/components/GroupingTagModal/graphql.js accordingly, see comment there.
 */
export const queryLexicalEntries = gql`
  query queryPerspective2($id: LingvodocID!, $entitiesMode: String!) {
    perspective(id: $id) {
      id
      translations
      lexical_entries(mode: $entitiesMode) {
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
  }
`;

/* new2!!!!!! */
const updateLexgraphMutation = gql`
  mutation updateLexgraph($id: LingvodocID!,
                          $lexgraph_before: String!,
                          $lexgraph_after: String!) {
    update_entity_content(id: $id,
                          lexgraph_before: $lexgraph_before,
                          lexgraph_after: $lexgraph_after) {
      triumph
    }
  }
`;

const updateEntityParentMutation = gql`
  mutation updateEntityParent($id: LingvodocID!,
                              $new_parent_id: LingvodocID!) {
    update_entity(id: $id,
                  new_parent_id: $new_parent_id) {
      entity
      triumph
    }
  }
`;
/* /new2!!!!!! */

const createLexicalEntryMutation = gql`
  mutation createLexicalEntry($id: LingvodocID!, $entitiesMode: String!) {
    create_lexicalentry(perspective_id: $id) {
      lexicalentry {
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
  }
`;

/* new2!!!!!!! */
const createEntityMutation = gql`
  mutation createEntity(
    $parent_id: LingvodocID!
    $field_id: LingvodocID!
    $lexgraph_after: String
  ) {
    create_entity(
      parent_id: $parent_id
      field_id: $field_id
      lexgraph_after: $lexgraph_after
    ) {
      entity {
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
/* /new2!!!!!!! */

const mergeLexicalEntriesMutation = gql`
  mutation mergeEntries($groupList: [[LingvodocID]]!) {
    merge_bulk(group_list: $groupList, publish_any: false, async_execution: false) {
      triumph
    }
  }
`;

const removeLexicalEntriesMutation = gql`
  mutation removeLexicalEntries($ids: [LingvodocID]!) {
    bulk_delete_lexicalentry(ids: $ids) {
      deleted_entries {
        id
      }
      triumph
    }
  }
`;

const TableComponent = ({
  columns,
  perspectiveId,
  entitiesMode,
  entries,
  mode,
  selectEntries,
  selectedEntries,
  onEntrySelect,
  reRender,
  /* eslint-disable react/prop-types */
  selectAllEntries,
  selectAllIndeterminate,
  selectAllChecked,
  onAllEntriesSelect,
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  disabledHeader,
  removeSelectionEntrySet,
  /*  eslint-enable react/prop-types */
  actions
}) => {

  return (
    <div style={{ overflowY: "auto" }}>
      <Table celled padded className="lingvo-perspective-table">
        <TableHeader
          columns={columns}
          entries={entries}
          selectEntries={selectEntries}
          selectedEntries={selectedEntries}
          onEntrySelect={onEntrySelect}
          selectAllEntries={selectAllEntries}
          selectAllIndeterminate={selectAllIndeterminate}
          selectAllChecked={selectAllChecked}
          onAllEntriesSelect={onAllEntriesSelect}
          showEntryId={showEntryId}
          selectDisabled={selectDisabled}
          selectDisabledIndeterminate={selectDisabledIndeterminate}
          disabled={disabledHeader}
          actions={actions}
          mode={mode} /* new!!!!! */
        />
        <TableBody
          perspectiveId={perspectiveId}
          entitiesMode={entitiesMode}
          entries={entries}
          columns={columns}
          mode={mode}
          actions={actions}
          selectEntries={selectEntries}
          selectedEntries={selectedEntries}
          onEntrySelect={onEntrySelect}
          showEntryId={showEntryId}
          selectDisabled={selectDisabled}
          selectDisabledIndeterminate={selectDisabledIndeterminate}
          disabledEntrySet={disabledEntrySet}
          removeSelectionEntrySet={removeSelectionEntrySet}
          reRender={reRender}
        />
      </Table>
    </div>
  );
};

TableComponent.propTypes = {
  columns: PropTypes.array.isRequired,
  perspectiveId: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  entries: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
  actions: PropTypes.array,
  reRender: PropTypes.func
};

TableComponent.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {},
  reRender: () => console.log("Fake refetch")
};

class P extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedRow: null,
      checkedColumn: null,
      checkedAll: null,
      cards: [], /* new!!!!!! */
      mutation: { loading: false }, /* new2!!!!!! */
      dnd_enabled: true
    };

    this.onCheckRow = this.onCheckRow.bind(this);
    this.resetCheckedRow = this.resetCheckedRow.bind(this);
    this.onCheckColumn = this.onCheckColumn.bind(this);
    this.resetCheckedColumn = this.resetCheckedColumn.bind(this);
    this.onCheckAll = this.onCheckAll.bind(this);
    this.resetCheckedAll = this.resetCheckedAll.bind(this);
  }

  resetCheckedRow() {
    this.setState({
      checkedRow: null
    });
  }

  resetCheckedColumn() {
    this.setState({
      checkedColumn: null
    });
  }

  resetCheckedAll() {
    this.setState({
      checkedAll: null
    });
  }

  onCheckRow(entry, checked) {
    if (entry) {
      entry.checkedRow = checked;
    }

    this.setState({
      checkedRow: entry,
      checkedColumn: null,
      checkedAll: null
    });
  }

  onCheckColumn(column, checked) {
    if (column) {
      column.checkedColumn = checked;
    }

    this.setState({
      checkedColumn: column,
      checkedRow: null,
      checkedAll: null
    });
  }

  onCheckAll(checked) {
    this.setState({
      checkedAll: { checkedAll: checked },
      checkedRow: null,
      checkedColumn: null
    });
  }

  render() {
    const {
      id,
      className,
      mode,
      entitiesMode,
      page,
      data,
      filter,
      sortByField,
      columns,
      setSortByField,
      resetSortByField,
      createEntity, /* new2!!!!!! */
      createLexicalEntry,
      mergeLexicalEntries,
      removeLexicalEntries,
      updateLexgraph, /* new!!!!! */
      addLexicalEntry: addCreatedEntry,
      selectLexicalEntry: onEntrySelect,
      resetEntriesSelection: resetSelection,
      openModal: openNewModal,
      createdEntries,
      selectedEntries,
      user,
      reRender,
      //for moving lexentries
      /*lexentry_id_source,*/ /* new2!!!!! */
      /*lexentry_id_before,*/ /* new2!!!!! */
      /*lexentry_id_after,*/ /* new2!!!!! */
      //for moving entities
      /*entity_id_dragged,*/ /* new2!!!!! */
      /*lexentry_id_target*/ /* new2!!!!! */
    } = this.props;

    console.log('REnder index!!!!!!!!!!!!');

    const { loading, error } = data;
    const { loading: changing } = this.state.mutation; /* new2!!!!!! */

    /*if (loading || (!loading && !error && !data.perspective)) {*/
    if (loading || changing || (!loading && !error && !data.perspective)) { /* new2!!!!! */
      return (
        <Dimmer active style={{ minHeight: "600px", background: "none" }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
          </Header>
        </Dimmer>
      );
    }

    const lexicalEntries = !error ? data.perspective.lexical_entries : [];
    /* new2!!!!!! */
    const lexgraph_column = !error ? columns.find(col => col.field.english_translation === "Order") : null;
    const lexgraph_field_id = lexgraph_column ? lexgraph_column.field_id : null;

    const get_lexgraph_entity = lexentry_id_source => {
      const lexentry = lexentry_id_source ? lexicalEntries.find(le => isEqual(le.id, lexentry_id_source)) : null;
      return lexentry ? lexentry.entities.find(e => isEqual(e.field_id, lexgraph_field_id)) : null;
    };

    const get_lexgraph_marker = lexentry_id_source => {
      const lexgraph_entity = get_lexgraph_entity(lexentry_id_source);
      return lexgraph_entity ? lexgraph_entity.content : '';
    };

    const setSort = (field, order) => {
      setSortByField(field, order);
      this.setState(
        {dnd_enabled: false},
        () => console.log("dnd_enabled: ", this.state.dnd_enabled));
    };

    const resetSort = () => {
      resetSortByField();
      this.setState(
        {dnd_enabled: true},
        () => console.log("dnd_enabled: ", this.state.dnd_enabled));
    };

    /*
    const dragAndDrop = () => {
      // Moving entity to another lexentry
      if (entity_id_dragged && lexentry_id_target) {
        updateEntityParentMutation({
          variables: {
            id: entity_id_dragged,
            new_parent_id: lexentry_id_target
          },
          refetchQueries: [
            {
              query: queryLexicalEntries,
              variables: {
                id,
                entitiesMode
              }
            }
          ]
        }).then(({data: mutation}) => this.setState({mutation}));
      }

      // Moving lexentry between certain ones
      if (lexgraph_field_id &&
          lexentry_id_source &&
          (lexentry_id_before || lexentry_id_after)) {
        entity_id_change = get_lexgraph_entity(lexentry_id_source).id;
        lexgraph_before = get_lexgraph_marker(lexentry_id_before);
        lexgraph_after = get_lexgraph_marker(lexentry_id_after);

        updateLexgraphMutation({
          variables: {
            id: entity_id_change,
            lexgraph_before,
            lexgraph_after
          },
          refetchQueries: [
            {
              query: queryLexicalEntries,
              variables: {
                id,
                entitiesMode
              }
            }
          ]
        }).then(({data: mutation}) => this.setState({mutation}));
      }
    };
    */
    /* /new2!!!!!! */

    /* new!!!!!! */
    const dragAndDropEntries = (lexentry_id_source, lexentry_id_before, lexentry_id_after) => {
      
      /*if (lexgraph_field_id &&
          lexentry_id_source &&
          (lexentry_id_before || lexentry_id_after)) {*/
        const entity_id_change = get_lexgraph_entity(lexentry_id_source).id;

        console.log('dragAndDropEntries!!!!!: entity_id_change======');
        console.log(entity_id_change);
        const lexgraph_before = get_lexgraph_marker(lexentry_id_before);
        const lexgraph_after = get_lexgraph_marker(lexentry_id_after);

        updateLexgraph({
          variables: {
            id: entity_id_change,
            lexgraph_before,
            lexgraph_after
          },
          refetchQueries: [
            {
              query: queryLexicalEntries,
              variables: {
                id,
                entitiesMode
              }
            }
          ]
        }).then(({data: mutation}) => {
          //this.setState({mutation});
          console.log('!!!!! dragAndDropEntries success!!!!!');
          this.setState({
            cards: []
          });
        },
        (error) => {
          //window.logger.err(`GraphQL error: ${this.context(error.message)}`);
        });
      /*}*/
    };
    /* /new!!!!!! */

    /*const addEntry = () => {*/
    const addEntry = (lexgraph_min) => { /* new2!!!! */
      createLexicalEntry({
        variables: {
          id,
          entitiesMode
        },
        /* new2!!!!! */
        /*refetchQueries: [
          {
            query: queryLexicalEntries,
            variables: {
              id,
              entitiesMode
            }
          }
        ]*/
        update: (cache, { data: { create_lexicalentry: { lexicalentry }}}) => {
          cache.updateQuery({
              query: queryLexicalEntries,
              variables: {id, entitiesMode}
            },
            (data) => ({
              perspective: {
                ...data.perspective,
                lexical_entries: [lexicalentry, ...data.perspective.lexical_entries]
              }
            })
          );
        },
        /* /new2!!!!! */
      }).then(({ data: d }) => {
        if (!d.loading && !d.error) { /* new2!!!!! */
        /*if (!d.loading || !d.error) {*/
          const {
            create_lexicalentry: { lexicalentry }
          } = d;
          addCreatedEntry(lexicalentry);

          /* new2!!!!! */
          if (lexgraph_field_id && lexgraph_min) {
            createEntity({
              variables: {
                parent_id: lexicalentry.id,
                field_id: lexgraph_field_id,
                lexgraph_after: lexgraph_min
              },
              update: (cache, { data: { create_entity: { entity }}}) => {
                cache.updateQuery({
                    query: queryLexicalEntries,
                    variables: {id, entitiesMode}
                  },
                  (data) => {
                    const lexical_entries = data.perspective.lexical_entries.filter(le => !isEqual(le.id, lexicalentry.id));
                    const lexicalentry_updated = {...lexicalentry, entities: [...lexicalentry.entities, entity]};
                    return {
                      perspective: {
                        ...data.perspective,
                        lexical_entries: [...lexical_entries, lexicalentry_updated]
                      }
                    };
                  }
                );
              },
            });
          }
          /* /new2!!!!! */
        }
      });
    };

    const mergeEntries = () => {
      const groupList = [selectedEntries];
      mergeLexicalEntries({
        variables: {
          groupList
        },
        refetchQueries: [
          {
            query: queryLexicalEntries,
            variables: {
              id,
              entitiesMode
            }
          }
        ]
      }).then(() => {
        resetSelection();
      });
    };

    const removeEntries = () => {
      removeLexicalEntries({
        variables: {
          ids: selectedEntries
        },
        /* new2!!!!! */
        /*
        refetchQueries: [
          {
            query: queryLexicalEntries,
            variables: {
              id,
              entitiesMode
            }
          }
        ]*/
        update: (cache, { data }) => {
          if (data.loading || data.error) {return;}
          const { bulk_delete_lexicalentry: { deleted_entries }} = data;
          cache.updateQuery({
              query: queryLexicalEntries,
              variables: {id, entitiesMode}
            },
            (data) => ({
              perspective:
                { ...data.perspective,
                  lexical_entries: data.perspective.lexical_entries.filter(
                    le => !deleted_entries.some(de => isEqual(le.id, de.id)))
                }
            })
          );
        },
        /* /new2!!!!! */
      }).then(() => {
        resetSelection();
      });
    };

    const onApprove = () => {
      openNewModal(ApproveModal, { perspectiveId: id, mode });
    };

    /* Basic case-insensitive, case-sensitive compare. */
    const ci_cs_compare = (str_a, str_b) => {
      const result = str_a.toLowerCase().localeCompare(str_b.toLowerCase(), undefined, { numeric: true });
      return result ? result : str_a.localeCompare(str_b, undefined, { numeric: true });
    };

    /* new2!!!!!! */
    /*const entitySortKeys = new Map();*/
    const orderEntries = es => {
      if (!lexgraph_field_id)
        {return es;}

      const sortedEntries = sortBy(es, e => {
        const entities = e.entities.filter(entity => isEqual(entity.field_id, lexgraph_field_id));
        if (entities.length > 0) {
          return entities[0].content;
        }
        return "";
      });

      return sortedEntries;
    };
    /* /new2!!!!!! */

    const processEntries = flow([
      // remove empty lexical entries, if not in edit mode
      es => (mode !== "edit" ? es.filter(e => e.entities.length > 0) : es),
      // apply filtering
      es =>
        !!filter && filter.length > 0
          ? es.filter(
              entry =>
                !!entry.entities.find(
                  entity => typeof entity.content === "string" && entity.content.indexOf(filter) >= 0
                )
            )
          : es,
      // apply sorting
      es => {
        // init
        let [ field, order ] = [null, "a"];

        // sort by 'Order' column or no sorting required
        if (!sortByField) {
          if (lexgraph_field_id)
            {[ field, order ] = [ lexgraph_field_id, "a" ];}
          else
            {return es;}
        }
        else {({ field, order } = sortByField);}

        if (!field) {
          field = lexgraph_field_id ? lexgraph_field_id : [66, 10];
        }

        /* new2!!!!!! */
        if (isEqual(lexgraph_field_id, field)) {
          return orderEntries(es);
        }

        const entitySortKeys = new Map();
        /* /new2!!!!!! */

        /* Getting a sort key for each entry. */

        for (const entry of es) {
          const entities = entry.entities.filter(entity => isEqual(entity.field_id, field));

          entities.sort(
            (ea, eb) => ci_cs_compare(ea.content || "", eb.content || "") || ea.id[0] - eb.id[0] || ea.id[1] - eb.id[1]
          );

          entitySortKeys.set(
            entry,
            entities.length > 0 && entities[0].content ? entities[0].content : `${entities.length}`
          );
        }

        es.sort(
          (ea, eb) =>
            ci_cs_compare(entitySortKeys.get(ea), entitySortKeys.get(eb)) || ea.id[0] - eb.id[0] || ea.id[1] - eb.id[1]
        );

        return order === "a" ? es : reverse(es);
      }
    ]);

    const created_id_str_set = {};

    for (const entry of createdEntries) {
      created_id_str_set[id2str(entry.id)] = null;
    }

    const newEntries = processEntries(
      lexicalEntries.filter(e => Object.prototype.hasOwnProperty.call(created_id_str_set, id2str(e.id)))
    );

    const entries = processEntries(lexicalEntries.slice());

    /* new2!!!!!! */
    const lexgraph_min = () => {
      if (!lexgraph_field_id)
        {return null;}

      let min_res = '1';
      for (let i=0; i<entries.length; i++) {
        const result = get_lexgraph_marker(entries[i].id);
        if (result && result < min_res)
          {min_res = result;}
      }

      return min_res;
    };
    /* /new2!!!!!! */

    /* new2!!!!!! */
    const _ROWS_PER_PAGE = lexgraph_field_id ? entries.length : ROWS_PER_PAGE;

    const pageEntries =
      entries.length > _ROWS_PER_PAGE ? take(drop(entries, _ROWS_PER_PAGE * (page - 1)), _ROWS_PER_PAGE) : entries;

    /* /new2!!!!!! */
      
    // Put newly created entries at the top of page.
    const e = [
      ...newEntries,
      ...pageEntries.filter(
        pageEntry => !Object.prototype.hasOwnProperty.call(created_id_str_set, id2str(pageEntry.id))
      )
    ];

    // join fields and columns
    // {
    //   column_id = column.id
    //   position = column.position
    //   self_id = column.self_id
    //   ...field
    // }
    const fields = columns.map(column => {
      const field = column.field;
      return {
        ...field,
        self_id: column.self_id,
        column_id: column.id,
        position: column.position
      };
    });
    /* eslint-disable no-shadow */
    function approveDisableCondition(entries) {
      return (
        entries.length === 0 ||
        entries.every(entry =>
          entry.entities.every(entity => (mode === "publish" ? entity.published === true : entity.accepted === true))
        )
      );
    }
    /* eslint-enable no-shadow */
    const isAuthenticated = user && user.user.id;

    const isTableLanguages = JSON.stringify(id) === JSON.stringify([4839, 2]);

    const isTableLanguagesPublish = mode === "publish" && isTableLanguages;

    const selectedRows = [];
    const selectedColumns = [];

    const items = e;

    const checkedRow = this.state.checkedRow;
    const checkedColumn = this.state.checkedColumn;
    const checkedAll = this.state.checkedAll;

    /* isTableLanguagesPublish */
    if (isTableLanguagesPublish) {
      const selectedRowsSet = new Set();
      const selectedColumnsSet = new Set();

      if (checkedAll) {
        if (checkedAll.checkedAll) {
          items.forEach(item => {
            selectedRowsSet.add(item.id);
          });
        } else {
          items.forEach(item => {
            selectedRowsSet.delete(item.id);
          });
        }
      } else {
        items.forEach(item => {
          const allRowsSelected = item.entities.every(i => {
            return i.published;
          });

          if (allRowsSelected) {
            selectedRowsSet.add(item.id);
          } else {
            selectedRowsSet.delete(item.id);
          }
        });

        if (checkedRow) {
          if (checkedRow.checkedRow) {
            selectedRowsSet.add(checkedRow.id);
          } else {
            selectedRowsSet.delete(checkedRow.id);
          }
        }
      }

      selectedRowsSet.forEach(value => {
        selectedRows.push(value);
      });

      fields.forEach(column => {
        const elems = [];

        items.forEach(item => {
          const columnEntities = item.entities.filter(i => {
            return JSON.stringify(i.field_id) === JSON.stringify(column.id);
          });

          if (columnEntities.length) {
            elems.push(columnEntities);
          }
        });

        const allColumnsSelected =
          (elems.length &&
            elems.every(elem => {
              return elem.length && elem[0].published;
            })) ||
          false;

        if (allColumnsSelected) {
          selectedColumnsSet.add(column.id);
        } else {
          selectedColumnsSet.delete(column.id);
        }
      });

      if (checkedColumn) {
        if (checkedColumn.checkedColumn) {
          selectedColumnsSet.add(checkedColumn.id);
        } else {
          selectedColumnsSet.delete(checkedColumn.id);
        }
      }

      selectedColumnsSet.forEach(value => {
        selectedColumns.push(value);
      });
    }
    /* /isTableLanguagesPublish */


    /* new!!!!!!! */
    const moveListItem = (dragIndex, hoverIndex, prevCards) => {
      console.log('!!!!!!!!!!!!moveListItem!!!!!!!!!!!!!!');

      this.setState({
        cards: update(prevCards, {
          $splice: [
            [dragIndex, 1],
            [hoverIndex, 0, prevCards[dragIndex]],
          ],
        })
      });
      
      /*console.log('this.state.cards======');
      console.log(this.state.cards);*/
    };
    /* /new!!!!!! */


    function* allEntriesGenerator() {
      yield* newEntries;
      yield* entries;
    }

    return (
      <div
        style={{ overflowY: "auto" }}
        className={(mode === "edit" && "lingvo-scrolling-tab lingvo-scrolling-tab_edit") || "lingvo-scrolling-tab"}
      >
        
        {((mode === "edit") || (mode === "publish" && isAuthenticated) || (mode === "contributions" && isAuthenticated)) && (
          <div className="lingvo-perspective-buttons">
            {mode === "edit" && (
              <Button 
                icon={<i className="lingvo-icon lingvo-icon_add" />}
                content={this.context("Add lexical entry")}
                /*onClick={addEntry}*/
                onClick={() => addEntry(lexgraph_min())} /* new2!!!!! */
                className="lingvo-button-green lingvo-perspective-button"
              />
            )}
            {mode === "edit" && (
              <Button
                icon={<i className="lingvo-icon lingvo-icon_delete" />}
                content={this.context("Remove lexical entries")}
                onClick={removeEntries}
                disabled={selectedEntries.length < 1}
                className="lingvo-button-red lingvo-perspective-button"
              />
            )}
            {mode === "edit" && (
              <Button
                icon={<i className="lingvo-icon lingvo-icon_add" />}
                content={this.context("Merge lexical entries")}
                onClick={mergeEntries}
                disabled={selectedEntries.length < 2}
                className="lingvo-button-green lingvo-perspective-button"
              />
            )}
            {mode === "publish" && isAuthenticated && (
              <Button
                icon={<i className="lingvo-icon lingvo-icon_check" />}
                content={this.context("Publish Entities")}
                disabled={approveDisableCondition(entries)}
                onClick={onApprove}
                className="lingvo-button-green lingvo-perspective-button"
              />
            )}
            {mode === "contributions" && isAuthenticated && (
              <Button
                icon={<i className="lingvo-icon lingvo-icon_check" />}
                content={this.context("Accept Contributions")}
                disabled={approveDisableCondition(entries)}
                onClick={onApprove}
                className="lingvo-button-green lingvo-perspective-button"
              />
            )}
          </div>
        )}

        <div className="lingvo-scrolling-tab__table">
          {/* new!!!!! */}
          <DndProvider backend={HTML5Backend}>
          {/* /new!!!!! */}
            <Table celled padded className={`${className} lingvo-perspective-table`}>
              <TableHeader
                columns={fields}
                sortByField={sortByField}
                onSortModeChange={(fieldId, order) => setSort(fieldId, order)}
                onSortModeReset={() => resetSort()}
                selectEntries={mode === "edit"}
                /*entries={items}*/
                entries={this.state.cards.length && this.state.cards || items} /* new!!!!! */
                checkEntries={isTableLanguagesPublish}
                selectedRows={selectedRows}
                selectedColumns={selectedColumns}
                onCheckColumn={this.onCheckColumn}
                onCheckAll={this.onCheckAll}
                mode={mode} /* new!!!!! */
                dnd_enabled={this.state.dnd_enabled} /* new!!!!! */
              />
              <TableBody
                perspectiveId={id}
                entitiesMode={entitiesMode}
                /*entries={items}*/
                entries={this.state.cards.length && this.state.cards || items} /* new!!!!! */
                allEntriesGenerator={allEntriesGenerator}
                columns={fields}
                mode={mode}
                selectEntries={mode === "edit"}
                checkEntries={isTableLanguagesPublish}
                selectedEntries={selectedEntries}
                selectedRows={selectedRows}
                checkedRow={checkedRow}
                checkedColumn={checkedColumn}
                checkedAll={checkedAll}
                onCheckRow={this.onCheckRow}
                resetCheckedRow={this.resetCheckedRow}
                resetCheckedColumn={this.resetCheckedColumn}
                resetCheckedAll={this.resetCheckedAll}
                onEntrySelect={onEntrySelect}
                reRender={reRender}
                moveListItem={moveListItem} /* new!!!!!! */
                dragAndDropEntries={dragAndDropEntries} /* new!!!!! */
                dnd_enabled={this.state.dnd_enabled} /* new!!!!! */
              />
            </Table>
          {/* new!!!!! */}
          </DndProvider>
          {/* /new!!!!! */}
        </div>
        {/* new!!!!! */}
        <Pagination
          urlBased
          activePage={page}
          /*pageSize={ROWS_PER_PAGE}*/ 
          pageSize={_ROWS_PER_PAGE} /* new2!!!!! */
          totalItems={entries.length}
          showTotal
          onPageChanged={() => {
            const scrollContainer = document.querySelector(".lingvo-scrolling-tab__table");
            smoothScroll(0, 0, null, scrollContainer);
            if (isTableLanguagesPublish) {
              this.resetCheckedColumn();
              this.resetCheckedAll();
            }
          }}
          className="lingvo-pagination-block_perspective"
        />
        {/* /new!!!!! */}
      </div>
    );
  }
}

P.contextType = TranslationContext;

P.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
  columns: PropTypes.array.isRequired,
  setSortByField: PropTypes.func.isRequired,
  resetSortByField: PropTypes.func.isRequired,
  addLexicalEntry: PropTypes.func.isRequired,
  createEntity: PropTypes.func.isRequired, /* new2!!!!! */
  createLexicalEntry: PropTypes.func.isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  removeLexicalEntries: PropTypes.func.isRequired,
  updateLexgraph: PropTypes.func.isRequired, /* new!!!!! */
  selectLexicalEntry: PropTypes.func.isRequired,
  resetEntriesSelection: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  createdEntries: PropTypes.array.isRequired,
  selectedEntries: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  reRender: PropTypes.func
};

P.defaultProps = {
  filter: "",
  sortByField: null
};

const PerspectiveView = compose(
  connect(
    ({ user, perspective: { sortByField, createdEntries, selectedEntries } }) => ({
      user,
      sortByField,
      createdEntries,
      selectedEntries
    }),
    dispatch =>
      bindActionCreators(
        {
          addLexicalEntry,
          setSortByField,
          resetSortByField,
          selectLexicalEntry,
          resetEntriesSelection,
          openModal
        },
        dispatch
      )
  ),
  graphql(createEntityMutation, {name: "createEntity"}), /* new2!!!!! */
  graphql(createLexicalEntryMutation, { name: "createLexicalEntry" }),
  graphql(mergeLexicalEntriesMutation, { name: "mergeLexicalEntries" }),
  graphql(removeLexicalEntriesMutation, { name: "removeLexicalEntries" }),
  graphql(updateLexgraphMutation, { name: "updateLexgraph" }), /* new!!!!!! */
  graphql(queryLexicalEntries, {
    /*options: { notifyOnNetworkStatusChange: true }*/
    options: { notifyOnNetworkStatusChange: true/*, fetchPolicy: 'cache-first'*/ } /* new2!!!!!! */
  })
)(P);

export const queryLexicalEntry = gql`
  query queryLexicalEntry($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translations
      columns {
        id
        field_id
        parent_id
        self_id
        position
        field {
          id
          translations
          data_type
          data_type_translation_gist_id
        }
      }
    }
  }
`;

const LexicalEntryViewBase = ({
  perspectiveId,
  entries,
  mode,
  entitiesMode,
  data,
  selectEntries,
  selectedEntries,
  onEntrySelect,
  /* eslint-disable react/prop-types */
  selectAllEntries,
  selectAllIndeterminate,
  selectAllChecked,
  onAllEntriesSelect,
  showEntryId,
  selectDisabled,
  selectDisabledIndeterminate,
  disabledEntrySet,
  disabledHeader,
  removeSelectionEntrySet,
  /*  eslint-enable react/prop-types */
  actions
}) => {
  const { loading, error } = data;

  if (loading || (!loading && !error && !data.perspective)) {
    return (
      <Dimmer active style={{ minHeight: "15vh", background: "none" }}>
        <Header as="h2" icon>
          <Icon name="spinner" loading />
        </Header>
      </Dimmer>
    );
  }

  const {
    perspective: { columns }
  } = data;

  const fields = columns.map(column => {
    const field = column.field;
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position
    };
  });

  return (
    <TableComponent
      perspectiveId={perspectiveId}
      entitiesMode={entitiesMode}
      entries={entries}
      columns={fields}
      mode={mode}
      actions={actions}
      selectEntries={selectEntries}
      selectedEntries={selectedEntries}
      onEntrySelect={onEntrySelect}
      selectAllEntries={selectAllEntries}
      selectAllIndeterminate={selectAllIndeterminate}
      selectAllChecked={selectAllChecked}
      onAllEntriesSelect={onAllEntriesSelect}
      showEntryId={showEntryId}
      selectDisabled={selectDisabled}
      selectDisabledIndeterminate={selectDisabledIndeterminate}
      disabledEntrySet={disabledEntrySet}
      disabledHeader={disabledHeader}
      removeSelectionEntrySet={removeSelectionEntrySet}
    />
  );
};

LexicalEntryViewBase.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entries: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    perspective: PropTypes.object
  }).isRequired,
  selectEntries: PropTypes.bool,
  selectedEntries: PropTypes.array,
  onEntrySelect: PropTypes.func,
  actions: PropTypes.array
};

LexicalEntryViewBase.defaultProps = {
  actions: [],
  selectEntries: false,
  selectedEntries: [],
  onEntrySelect: () => {}
};

export const queryLexicalEntriesByIds = gql`
  query queryLexicalEntry($perspectiveId: LingvodocID!, $entriesIds: [LingvodocID]!, $entitiesMode: String!) {
    perspective(id: $perspectiveId) {
      id
      translations
      columns {
        id
        field_id
        parent_id
        self_id
        position
        field {
          id
          translations
          data_type
          data_type_translation_gist_id
        }
      }
      lexical_entries(mode: $entitiesMode, ids: $entriesIds) {
        id
        parent_id
        created_at
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
        }
      }
    }
  }
`;

const LexicalEntryViewBaseByIds = ({ perspectiveId, mode, entitiesMode, data, actions }) => {
  const { loading, error } = data;

  if (loading || (!loading && !error && !data.perspective)) {
    return (
      <ModalContentWrapper>
        <Dimmer active style={{ minHeight: "15vh", background: "none" }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading />
          </Header>
        </Dimmer>
      </ModalContentWrapper>
    );
  }

  if (!data || !data.perspective) {
    return null;
  }

  const {
    perspective: { columns, lexical_entries: entries }
  } = data;

  const fields = columns.map(column => {
    const field = column.field;
    return {
      ...field,
      self_id: column.self_id,
      column_id: column.id,
      position: column.position
    };
  });

  const reRender = () => {
    data.refetch();
    console.log("Refetched 'queryLexicalEntriesByIds'");
  };

  return (
    <TableComponent
      perspectiveId={perspectiveId}
      entitiesMode={entitiesMode}
      entries={entries}
      columns={fields}
      mode={mode}
      actions={actions}
      reRender={reRender}
    />
  );
};

LexicalEntryViewBaseByIds.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  entriesIds: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    perspective: PropTypes.object
  }).isRequired,
  actions: PropTypes.array
};

LexicalEntryViewBaseByIds.defaultProps = {
  actions: []
};

export const LexicalEntryView = graphql(queryLexicalEntry, {
  options: { notifyOnNetworkStatusChange: true }
})(LexicalEntryViewBase);

export const LexicalEntryByIds = compose(
  graphql(queryLexicalEntriesByIds, {
    options: { notifyOnNetworkStatusChange: true }
  })
)(LexicalEntryViewBaseByIds);

const PerspectiveViewWrapper = ({ id, className, mode, entitiesMode, page, data, filter, sortByField }) => {
  if (data.error) {
    return null;
  }

  if (data.perspective === undefined) {
    /* If we refetch data of this perspective with a different set of column fields during initialization
     * of CognateAnalysisModal, data.perspective becomes undefined and errors and query refetching ensue.
     *
     * See additional info in comment on 'languageQuery' from CognateAnalysis modal.
     *
     * This shouldn't happen anymore, but just in case, if this happens, we refetch the data ourselves,
     * which at least precludes the errors and corresponding waste of time on re-initialization of some
     * components. */

    data.refetch();
    return null;
  }

  const {
    perspective: { columns }
  } = data;

  const reRender = () => {
    data.refetch();
    console.log("Refetched 'queryPerspective'");
  };

  return (
    <PerspectiveView
      id={id}
      className={className}
      mode={mode}
      entitiesMode={entitiesMode}
      page={page}
      filter={filter}
      sortByField={sortByField}
      columns={columns}
      reRender={reRender}
    />
  );
};

PerspectiveViewWrapper.propTypes = {
  id: PropTypes.array.isRequired,
  className: PropTypes.string.isRequired,
  page: PropTypes.number.isRequired,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  filter: PropTypes.string,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object
};

PerspectiveViewWrapper.defaultProps = {
  filter: "",
  sortByField: null
};

export default compose(
  graphql(queryPerspective, {
    options: { notifyOnNetworkStatusChange: true }
  }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder))
)(PerspectiveViewWrapper);
