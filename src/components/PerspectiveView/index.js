import React, { useState } from "react";
import { connect } from "react-redux";
import { Button, Dimmer, Header, Icon, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { drop, flow, isEqual, reverse, take, cloneDeep } from "lodash";
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
  resetAddedLexes,
  removeAddedLexes,
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
  query queryPerspective2(
    $id: LingvodocID!,
    $entitiesMode: String!,
    $filter: String,
    $sortingField: LingvodocID,
    $isEditMode: Boolean,
    $isCaseSens: Boolean,
    $isAscending: Boolean,
    $isRegexp: Boolean,
    $offset: Int,
    $limit: Int,
    $createdEntries: [LingvodocID]) {

    perspective(id: $id) {
      id
      translations
      perspective_page(
        mode: $entitiesMode,
        filter: $filter,
        sort_by_field: $sortingField,
        is_edit_mode: $isEditMode,
        is_case_sens: $isCaseSens,
        is_ascending: $isAscending,
        is_regexp: $isRegexp,
        offset: $offset,
        limit: $limit,
        created_entries: $createdEntries) {

        entries_total
        lexical_entries {
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
            is_subject_for_parsing
          }
        }
      }
    }
  }
`;

const createLexicalEntryMutation = gql`
  mutation createLexicalEntry($id: LingvodocID!, $entitiesMode: String!) {
    create_lexicalentry(perspective_id: $id) {
      lexicalentry {
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
  onEntrySelect: () => { },
  reRender: () => console.log("Fake refetch")
};

class P extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      checkedRow: null,
      checkedColumn: null,
      checkedAll: null,
      entriesTotal: 0
    };

    this.onCheckRow = this.onCheckRow.bind(this);
    this.resetCheckedRow = this.resetCheckedRow.bind(this);
    this.onCheckColumn = this.onCheckColumn.bind(this);
    this.resetCheckedColumn = this.resetCheckedColumn.bind(this);
    this.onCheckAll = this.onCheckAll.bind(this);
    this.resetCheckedAll = this.resetCheckedAll.bind(this);
    //this.reRender = this.reRender.bind(this);
  }

  componentDidMount() {
    this.props.resetAddedLexes();
  }

  componentDidUpdate(prevProps) {
    const { data } = this.props;
    if (!data.perspective) {
      return;
    }
    if (data !== prevProps.data) {
      this.setState({ entriesTotal: !data.error ? data.perspective.perspective_page.entries_total : 0 });
    }
  }

  reRender() {
    //this.props.data.refetch();
    console.log("Refetched 'queryLexicalEntries'");
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
      setSortByField: setSort,
      resetSortByField: resetSort,
      createLexicalEntry,
      mergeLexicalEntries,
      removeLexicalEntries,
      addLexicalEntry: addCreatedEntry,
      removeAddedLexes: removeCreatedLexes,
      selectLexicalEntry: onEntrySelect,
      resetEntriesSelection: resetSelection,
      openModal: openNewModal,
      createdEntries,
      selectedEntries,
      user,
      reRender,
      client,
      isEditMode,
      isCaseSens,
      isRegexp,
      isAscending,
      sortingField,
      limit,
      offset,
      changePage
    } = this.props;

    const query_args = {
      id,
      entitiesMode,
      filter,
      isEditMode,
      isCaseSens,
      isRegexp,
      isAscending,
      sortingField,
      limit,
      offset,
      createdEntries
    }

    const { loading, error } = data;

    if (loading || (!loading && !error && !data.perspective)) {
      return (
        <Dimmer active style={{ minHeight: "600px", background: "none" }}>
          <Header as="h2" icon>
            <Icon name="spinner" loading className="lingvo-spinner" />
          </Header>
        </Dimmer>
      );
    }

    const lexicalEntries = !error ? data.perspective.perspective_page.lexical_entries : [];
    const { entriesTotal } = this.state;

    const addEntry = () => {
  
      createLexicalEntry({
        variables: {id, entitiesMode},
  
        update: (cache, { data: d }) => {
          if (!d.loading && !d.error) {
            const {
              create_lexicalentry: { lexicalentry }
            } = d;

            cache.updateQuery(
              {
                query: queryLexicalEntries,
                variables: query_args
              },

              (data) => {
                if (!loading && !error) {
                  const result = cloneDeep(data);
                  result.perspective.perspective_page.lexical_entries.unshift(lexicalentry);
                  return result;
                }
                return undefined;
              }
            );
            addCreatedEntry(lexicalentry);
            this.setState({ entriesTotal: entriesTotal + 1 });
          }
        }
      });
    };

    const mergeEntries = () => {
      const groupList = [selectedEntries];

      mergeLexicalEntries({
        variables: { groupList },

        refetchQueries: [
          {
            query: queryLexicalEntries,
            variables: query_args
          }
        ]
        
      }).then(() => {
        resetSelection();
        this.setState({ entriesTotal: entriesTotal - selectedEntries.length + 1 });
      });
    };

    const removeEntries = () => {
        
      removeLexicalEntries({
        variables: { ids: selectedEntries },

        update: (cache, { data: d }) => {
          if (!d.loading && !d.error) {

            cache.updateQuery(
              {
                query: queryLexicalEntries,
                variables: query_args
              },
              (data) => {
                if (!loading && !error) {
                  const result = cloneDeep(data);
                  const perspective_page = result.perspective.perspective_page;
                  perspective_page.lexical_entries = (
                    perspective_page.lexical_entries.filter(c => !selectedEntries.find(s_id => isEqual(c.id, s_id))));

                  return result;
                }
                return undefined;
              }
            );
            removeCreatedLexes(selectedEntries);
            resetSelection();
            this.setState({ entriesTotal: entriesTotal - 1 });
          }
        }
      });
    };

    const onApprove = () => {
      openNewModal(ApproveModal, { perspectiveId: id, mode });
    };

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

    const { checkedRow, checkedColumn, checkedAll } = this.state;

    /* isTableLanguagesPublish */
    if (isTableLanguagesPublish) {
      const selectedRowsSet = new Set();
      const selectedColumnsSet = new Set();

      if (checkedAll) {
        if (checkedAll.checkedAll) {
          lexicalEntries.forEach(item => {
            selectedRowsSet.add(item.id);
          });
        } else {
          lexicalEntries.forEach(item => {
            selectedRowsSet.delete(item.id);
          });
        }
      } else {
        lexicalEntries.forEach(item => {
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

        lexicalEntries.forEach(item => {
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

    function* allEntriesGenerator() {
      yield* lexicalEntries;
    }

    return (
      <div
        style={{ overflowY: "auto" }}
        className={(mode === "edit" && "lingvo-scrolling-tab lingvo-scrolling-tab_edit") || "lingvo-scrolling-tab"}
      >
        {(mode === "edit" ||
          (mode === "publish" && isAuthenticated) ||
          (mode === "contributions" && isAuthenticated)) && (
            <div className="lingvo-perspective-buttons">
              {mode === "edit" && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_add" />}
                  content={this.context("Add lexical entry")}
                  onClick={addEntry}
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
                  disabled={approveDisableCondition(lexicalEntries)}
                  onClick={onApprove}
                  className="lingvo-button-green lingvo-perspective-button"
                />
              )}
              {mode === "contributions" && isAuthenticated && (
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_check" />}
                  content={this.context("Accept Contributions")}
                  disabled={approveDisableCondition(lexicalEntries)}
                  onClick={onApprove}
                  className="lingvo-button-green lingvo-perspective-button"
                />
              )}
            </div>
          )}

        <div className="lingvo-scrolling-tab__table">
          <Table celled padded className={`${className} lingvo-perspective-table`}>
            <TableHeader
              columns={fields}
              sortByField={sortByField}
              onSortModeChange={(fieldId, order) => setSort(fieldId, order)}
              onSortModeReset={() => resetSort()}
              selectEntries={mode === "edit"}
              entries={lexicalEntries}
              checkEntries={isTableLanguagesPublish}
              selectedRows={selectedRows}
              selectedColumns={selectedColumns}
              onCheckColumn={this.onCheckColumn}
              onCheckAll={this.onCheckAll}
            />
            <TableBody
              perspectiveId={id}
              entitiesMode={entitiesMode}
              entries={lexicalEntries}
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
              queryArgs={query_args}
            />
          </Table>
        </div>
        <Pagination
          urlBased={!filter.length}
          activePage={page}
          pageSize={ROWS_PER_PAGE}
          totalItems={entriesTotal}
          showTotal
          onPageChanged={(newPage) => {
            if (changePage) {
              changePage(newPage);
            }
            const scrollContainer = document.querySelector(".lingvo-scrolling-tab__table");
            smoothScroll(0, 0, null, scrollContainer);
            if (isTableLanguagesPublish) {
              this.resetCheckedColumn();
              this.resetCheckedAll();
            }
          }}
          className="lingvo-pagination-block_perspective"
        />
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
  resetAddedLexes: PropTypes.func.isRequired,
  removeAddedLexes: PropTypes.func.isRequired,
  createLexicalEntry: PropTypes.func.isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  removeLexicalEntries: PropTypes.func.isRequired,
  selectLexicalEntry: PropTypes.func.isRequired,
  resetEntriesSelection: PropTypes.func.isRequired,
  openModal: PropTypes.func.isRequired,
  createdEntries: PropTypes.array.isRequired,
  selectedEntries: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  reRender: PropTypes.func,
  changePage: PropTypes.func
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
      selectedEntries,
      createdEntries: createdEntries.map(lex => lex.id),
      sortingField: sortByField?.field,
      isAscending: (sortByField?.order === 'a')
    }),
    dispatch =>
      bindActionCreators(
        {
          addLexicalEntry,
          resetAddedLexes,
          removeAddedLexes,
          setSortByField,
          resetSortByField,
          selectLexicalEntry,
          resetEntriesSelection,
          openModal
        },
        dispatch
      )
  ),
  graphql(createLexicalEntryMutation, { name: "createLexicalEntry" }),
  graphql(mergeLexicalEntriesMutation, { name: "mergeLexicalEntries" }),
  graphql(removeLexicalEntriesMutation, { name: "removeLexicalEntries" }),
  graphql(queryLexicalEntries, {
    options: { notifyOnNetworkStatusChange: true }
  }),
  withApollo
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
  onEntrySelect: () => { }
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
    //data.refetch();
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

const PerspectiveViewWrapper = ({ id, className, mode, entitiesMode, page, data,
  filter, sortByField, isCaseSens, isRegexp, changePage }) => {
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

  //TODO: this needs optimization
  const reRender = () => {
    //data.refetch();
    console.log("Refetched 'queryPerspective'");
  };

  return (
    <PerspectiveView
      id={id}
      className={className}
      mode={mode}
      entitiesMode={entitiesMode}
      page={page}
      limit={ROWS_PER_PAGE}
      offset={ROWS_PER_PAGE * (page - 1)}
      filter={filter}
      isEditMode={mode === "edit"}
      isCaseSens={isCaseSens}
      isRegexp={isRegexp}
      columns={columns}
      reRender={reRender}
      changePage={changePage}
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
  isCaseSens: PropTypes.bool,
  isRegexp: PropTypes.bool,
  data: PropTypes.object.isRequired,
  sortByField: PropTypes.object,
  changePage: PropTypes.func
};

PerspectiveViewWrapper.defaultProps = {
  filter: "",
  isCaseSens: true,
  isRegexp: false,
  sortByField: null
};

export default compose(
  graphql(queryPerspective, {
    options: { notifyOnNetworkStatusChange: true }
  }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder))
)(PerspectiveViewWrapper);