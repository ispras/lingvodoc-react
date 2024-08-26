import React from "react";
import {
  Button,
  Checkbox,
  Container,
  Dropdown,
  Header,
  Icon,
  Input,
  List
} from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import Immutable, { fromJS } from "immutable";
import { drop, isEqual, take } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, pure, renderNothing, withProps, withReducer } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import { LexicalEntryView, queryLexicalEntries, queryPerspective } from "components/PerspectiveView";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

import Pagination from "./Pagination";

const ROWS_PER_PAGE = 10;

const mergeSuggestionsQuery = gql`
  query mergeSuggestions(
    $id: LingvodocID!
    $algorithm: String!
    $field_selection_list: [ObjectVal]!
    $levenshtein: Int!
    $threshold: Float!
  ) {
    merge_suggestions(
      perspective_id: $id
      algorithm: $algorithm
      field_selection_list: $field_selection_list
      levenshtein: $levenshtein
      threshold: $threshold
    ) {
      match_result
    }
  }
`;

const mergeLexicalEntriesMutation = gql`
  mutation mergeEntries($groupList: [[LingvodocID]]!, $publish_any: Boolean!, $async: Boolean!) {
    merge_bulk(group_list: $groupList, publish_any: $publish_any, async_execution: $async) {
      triumph
    }
  }
`;

const initial_state = {
  blank: true,
  loading: false,
  groups: [],
  entry_map: null,
  entry_group_map: null,
  result_map: {},
  merged_set: {},
  merged_select_map: {},
  error_message: null,
  page_state_map: {}
};

class MergeSettings extends React.Component {
  constructor(props) {
    super(props);

    this.getSuggestions = this.getSuggestions.bind(this);
    this.getSelected = this.getSelected.bind(this);

    this.mergeGroup = this.mergeGroup.bind(this);
    this.mergeBatch = this.mergeBatch.bind(this);
    this.mergeSelected = this.mergeSelected.bind(this);
    this.mergeSelectedPage = this.mergeSelectedPage.bind(this);
    this.mergeAll = this.mergeAll.bind(this);

    this.entrySelect = this.entrySelect.bind(this);
    this.entrySelectAll = this.entrySelectAll.bind(this);
    this.entrySelectAllPage = this.entrySelectAllPage.bind(this);

    this.selection_update = this.selection_update.bind(this);

    this.state = {
      ...initial_state,
      result_map: {},
      merged_set: {},
      merged_select_map: {},
      page_state_map: {}
    };
  }

  async getSuggestions() {
    const { id, settings, client, dispatch } = this.props;

    const {
      dataLexicalEntries: {
        perspective: { perspective_page: { lexical_entries: entries }}
      }
    } = this.props;

    const algorithm = settings.get("mode");
    const threshold = settings.get("threshold");
    const fields = settings.get("field_selection_list");

    this.setState(
      {
        ...initial_state,
        blank: false,
        loading: true,
        result_map: {},
        merged_set: {},
        merged_select_map: {},
        page_state_map: {}
      },
      () => {
        dispatch({ type: "RESET" });
      }
    );

    const { data } = await client.query({
      query: mergeSuggestionsQuery,
      variables: {
        id,
        algorithm,
        field_selection_list: fields,
        threshold,
        levenshtein: 1
      }
    });

    if (data) {
      const entry_map = {};

      for (const entry of entries) {
        entry_map[id2str(entry.id)] = entry;
      }

      const {
        merge_suggestions: { match_result }
      } = data;

      const groups = match_result.map(({ lexical_entries: ids, confidence }) => ({
        lexical_entries: ids.map(eid => entry_map[id2str(eid)]),
        confidence
      }));

      const entry_group_map = {};

      for (const [i, group] of groups.entries()) {
        for (const entry of group.lexical_entries) {
          const id_str = id2str(entry.id);

          if (!entry_group_map.hasOwnProperty(id_str)) {
            entry_group_map[id_str] = new Set();
          }

          entry_group_map[id_str].add(i);
        }
      }

      this.setState(
        {
          loading: false,
          groups,
          entry_map,
          entry_group_map
        },
        () => {
          dispatch({ type: "SET_PAGE", payload: 1 });
        }
      );
    }
  }

  getSelected(group) {
    const { settings } = this.props;
    const groupIds = settings.getIn(["selected", group]);
    return groupIds ? groupIds.toJS() : [];
  }

  async mergeGroup(group, entry_list, selected_id_list, settings_before = null) {
    const { dispatch, mergeLexicalEntries } = this.props;

    let settings = settings_before || this.props.settings;

    const { result_map, merged_set, merged_select_map } = this.state;

    const group_str = `${group}`;

    result_map[group_str] = "merging";
    this.setState({ result_map });

    await mergeLexicalEntries({
      variables: {
        async: false,
        publish_any: settings.get("publishedAny"),
        groupList: [selected_id_list]
      }
    }).then(
      () => {
        window.logger.suc(this.context("Merged successfully"));

        result_map[group_str] = "success";

        /* Saving a set of entries not available for selection at the time of the merge. */

        const unselectable_set = new Set();

        for (const entry of entry_list) {
          const entry_id_str = id2str(entry.id);

          if (merged_set.hasOwnProperty(entry_id_str)) {
            unselectable_set[entry_id_str] = null;
          }
        }

        merged_select_map[group_str] = unselectable_set;

        /* Bookkeeping for merged lexical entries. */

        const selected_in_map = settings.get("selected_in");
        const deselect_map = new Map();

        for (const entry_id of selected_id_list) {
          const entry_id_str = id2str(entry_id);

          merged_set[entry_id_str] = null;

          for (const index of selected_in_map.get(entry_id_str)) {
            if (!deselect_map.has(index)) {
              deselect_map.set(index, new Set());
            }

            deselect_map.get(index).add(entry_id_str);
          }
        }

        /* Deselecting merged lexical entries in all groups they are in, except the merged group. */

        deselect_map.delete(group);

        for (const [index, entry_id_str_set] of deselect_map.entries()) {
          settings = this.selection_update(index, entry_id_str_set, false, settings);
        }

        /* Removing attachments to the merged group. */

        const attached_from_set = settings.getIn(["attached_from", group], Immutable.Set());

        let attached_to_map = settings.get("attached_to");

        for (const index of attached_from_set) {
          attached_to_map = attached_to_map.update(index, attached_to_set => attached_to_set.delete(group));
        }

        settings = settings.setIn(["attached_from", group], attached_from_set).set("attached_to", attached_to_map);

        /* Settings update. */

        this.setState(
          {
            result_map,
            merged_set,
            merged_select_map
          },
          () =>
            this.props.dispatch({
              type: "SET",
              payload: settings
            })
        );
      },
      ({ message }) => {
        this.state.result_map[`${group}`] = "error";
        this.state.error_message = message;

        this.setState({
          result_map: this.state.result_map,
          error_message: message
        });
      }
    );

    return settings;
  }

  mergeBatch(groups) {
    const { settings, mergeLexicalEntries } = this.props;

    const publishedAny = settings.get("publishedAny");

    mergeLexicalEntries({
      variables: {
        async: true,
        publish_any: publishedAny,
        groupList: groups
      }
    }).then(() => {
      window.logger.suc(this.context("Merge task created successfully"));
    });
  }

  mergeSelected() {
    return;

    const { settings } = this.props;
    const groupIds = settings.get("selected").toIndexedSeq().toArray();

    this.mergeBatch(groupIds.map(d => d.toJS()));
  }

  async mergeSelectedPage(page_number, group_index_start) {
    this.state.page_state_map[`${page_number}`] = "merging";
    this.setState({ page_state_map: this.state.page_state_map });

    let settings = this.props.settings;

    for (let i = 0; i < ROWS_PER_PAGE; i++) {
      const index = group_index_start + i;
      const index_str = `${index}`;

      const result = this.state.result_map[index_str];

      if (result) {
        continue;
      }

      if (settings.getIn(["attached_to", index], Immutable.Set()).size > 0) {
        continue;
      }

      /* Getting group's selected entries info. */

      const group = this.state.groups[index];

      if (!group) {
        break;
      }

      const available_list = settings.getIn(["available", index]);

      const entry_list = available_list
        ? available_list.toJS().map(entry_id_str => this.state.entry_map[entry_id_str])
        : group.lexical_entries;

      const entry_ready_list = entry_list.filter(entry => !this.state.merged_set.hasOwnProperty(id2str(entry.id)));

      const selected_set = settings.getIn(["selected", index], Immutable.Set());
      const selected_id_list = [];

      for (const entry of entry_ready_list) {
        if (selected_set.has(id2str(entry.id))) {
          selected_id_list.push(entry.id);
        }
      }

      /* Merging group if it has enough lexical entries selected. */

      if (selected_id_list.length > 1) {
        settings = await this.mergeGroup(index, entry_list, selected_id_list, settings);
      }
    }

    this.state.page_state_map[`${page_number}`] = "";
    this.setState({ page_state_map: this.state.page_state_map });
  }

  mergeAll() {
    return;

    const groupIds = this.state.groups.map(g => g.lexical_entries.map(e => e.id));
    this.mergeBatch(groupIds);
  }

  selection_update(index, entry_id_str_list, checked, settings_before = null) {
    const { groups, entry_group_map } = this.state;

    const settings = settings_before || this.props.settings;

    /* Updating entry selection data. */

    const selected_set_before = settings.getIn(["selected", index], Immutable.Set());

    let selected_set = selected_set_before;
    let selected_in_map = settings.get("selected_in", Immutable.Map());

    if (checked) {
      for (const entry_id_str of entry_id_str_list) {
        selected_set = selected_set.add(entry_id_str);

        selected_in_map = selected_in_map.update(entry_id_str, Immutable.Set(), selected_in_set =>
          selected_in_set.add(index)
        );
      }
    } else {
      for (const entry_id_str of entry_id_str_list) {
        selected_set = selected_set.delete(entry_id_str);

        selected_in_map = selected_in_map.update(entry_id_str, selected_in_set => selected_in_set.delete(index));
      }
    }

    /* Rebuilding list of entries available for selection. */

    const available_set = new Set();
    const available_list = [];

    const attached_set = new Set();

    function f(index_a) {
      if (attached_set.has(index_a)) {
        return;
      }

      attached_set.add(index_a);

      const ready_list = [];

      /* Two phases, first, checking which entries are not already considered, ... */

      for (const entry of groups[index_a].lexical_entries) {
        const entry_id_str = id2str(entry.id);

        if (!available_set.has(entry_id_str)) {
          available_set.add(entry_id_str);
          ready_list.push(entry_id_str);
        }
      }

      /* ...second, adding not yet considered entries in stable order and looking at other possibly
       * connected entries. */

      for (const entry_id_str of ready_list) {
        available_list.push(entry_id_str);

        if (selected_set.has(entry_id_str)) {
          for (const index_b of entry_group_map[entry_id_str]) {
            f(index_b);
          }
        }
      }
    }

    f(index);

    /* Updating group attachment data. */

    const attached_from_set_before = settings.getIn(["attached_from", index], Immutable.Set());

    attached_set.delete(index);

    const attached_from_set = Immutable.Set(attached_set);
    let attached_to_map = settings.get("attached_to");

    for (const index_c of attached_from_set_before.subtract(attached_from_set)) {
      attached_to_map = attached_to_map.update(index_c, attached_to_set => attached_to_set.delete(index));
    }

    for (const index_c of attached_from_set.subtract(attached_from_set_before)) {
      attached_to_map = attached_to_map.update(index_c, Immutable.Set(), attached_to_set => attached_to_set.add(index));
    }

    return settings
      .setIn(["selected", index], selected_set)
      .set("selected_in", selected_in_map)
      .setIn(["available", index], Immutable.List(available_list))
      .setIn(["attached_from", index], attached_from_set)
      .set("attached_to", attached_to_map);
  }

  entrySelect(index, entry_id, checked) {
    const settings = this.selection_update(index, [id2str(entry_id)], checked);

    this.props.dispatch({
      type: "SET",
      payload: settings
    });
  }

  entrySelectAll(index, entry_list, checked) {
    const settings = this.selection_update(
      index,
      entry_list.map(entry => id2str(entry.id)),
      checked
    );

    this.props.dispatch({
      type: "SET",
      payload: settings
    });
  }

  entrySelectAllPage(page_number, group_index_start) {
    let settings = this.props.settings;

    for (let i = 0; i < ROWS_PER_PAGE; i++) {
      const index = group_index_start + i;
      const index_str = `${index}`;

      const result = this.state.result_map[index_str];

      if (result) {
        continue;
      }

      if (settings.getIn(["attached_to", index], Immutable.Set()).size > 0) {
        continue;
      }

      /* Selecting all we can, first iteration. */

      const group = this.state.groups[index];

      if (!group) {
        break;
      }

      let available_list = settings.getIn(["available", index]);
      let available_count = available_list ? available_list.size : 0;

      const entry_id_str_list = (
        available_list ? available_list.toJS() : group.lexical_entries.map(entry => id2str(entry.id))
      ).filter(entry_id_str => !this.state.merged_set.hasOwnProperty(entry_id_str));

      settings = this.selection_update(index, entry_id_str_list, true, settings);
      

      /* Continuing to select until we have no more new selectable entries. */

      available_list = settings.getIn(["available", index]);

      while (available_list.size > available_count) {
        available_count = available_list.size;

        const entry_id_str_list = settings
          .getIn(["available", index])
          .toJS()

          .filter(entry_id_str => !this.state.merged_set.hasOwnProperty(entry_id_str));

        settings = this.selection_update(index, entry_id_str_list, true, settings);

        available_list = settings.getIn(["available", index]);
      }
    }

    this.props.dispatch({
      type: "SET",
      payload: settings
    });
  }

  render() {
    const { id, entitiesMode, settings, dispatch, data } = this.props;
    const mode = settings.get("mode");
    const threshold = settings.get("threshold");
    const fields = settings.get("field_selection_list");
    const publishedAny = settings.get("publishedAny");
    const page = settings.get("page");

    const {
      perspective: { columns }
    } = data;

    const fieldOptions = columns.map(c => {
      const field = c.field;
      return {
        text: T(field.translations),
        value: JSON.stringify(field.id)
      };
    });

    const groups =
      this.state.groups.length > ROWS_PER_PAGE
        ? take(drop(this.state.groups, ROWS_PER_PAGE * (page - 1)), ROWS_PER_PAGE)
        : this.state.groups;

    const group_index_shift = this.state.groups.length > ROWS_PER_PAGE ? ROWS_PER_PAGE * (page - 1) : 0;

    const page_state = this.state.page_state_map[`${page}`];

    return (
      <div>
        <div className="lingvo-segment">
          <div className="lingvo-merge-header" style={{ marginBottom: "16px" }}>
            {this.context("Entity matching algorithm")}
          </div>

          <div className="lingvo-radio">
            <Checkbox
              radio
              name="mode"
              value="simple"
              label={this.context("Simple")}
              checked={mode === "simple"}
              onChange={(e, { value }) => dispatch({ type: "SET_MODE", payload: value })}
            />
          </div>

          <div className="lingvo-radio">
            <Checkbox
              radio
              name="mode"
              value="fields"
              label={this.context("With field selection")}
              checked={mode === "fields"}
              onChange={(e, { value }) => dispatch({ type: "SET_MODE", payload: value })}
            />
          </div>

          {mode === "fields" && (
            <div style={{ paddingTop: "4px" }}>
              {fields.size === 0 && (
                <div className="container-gray" style={{ textAlign: "center" }}>
                  {this.context("No fields, click button below to add a new one")}
                </div>
              )}
              {fields.map((e, i) => (
                <div key={i} className="container-gray lingvo-merge-field-selection">
                  <i 
                    className="lingvo-icon lingvo-icon_close" 
                    onClick={() => dispatch({ type: "REMOVE_FIELD", payload: i })} 
                  />
                  <List>
                    <List.Item>
                      <Dropdown
                        selection
                        options={fieldOptions}
                        onChange={(_e, { value }) =>
                          dispatch({ type: "CHANGE_FIELD_ID", payload: { id: JSON.parse(value), index: i } })
                        }
                        icon={<i className="lingvo-icon lingvo-icon_arrow" />}
                        className="lingvo-dropdown-select lingvo-dropdown-select_merge"
                        placeholder={this.context("Choose what?")}
                      />
                    </List.Item>
                    <List.Item style={{ paddingTop: "13px" }}>
                      <Input
                        label={this.context("Levenshtein distance limit for entity content matching")}
                        value={
                          Math.round(e.levenshtein) == e.levenshtein ? `${e.levenshtein.toString()}.0` : e.levenshtein
                        }
                        onChange={(ev, { value }) =>
                          dispatch({ type: "SET_LEVENSHTEIN", payload: { index: i, levenshtein: value } })
                        }
                        className="lingvo-labeled-input"
                      />
                    </List.Item>
                    <List.Item style={{ paddingTop: "15px" }}>
                      <Checkbox
                        label={this.context("Split contents of the field on whitespace before matching")}
                        checked={e.split_space}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: "SET_WHITESPACE_FLAG", payload: { index: i, checked } })
                        }
                        className="lingvo-checkbox"
                      />
                    </List.Item>
                    <List.Item>
                      <Checkbox
                        label={this.context("Split contents of the field on punctuation before matching")}
                        checked={e.split_punctuation}
                        onChange={(_e, { checked }) =>
                          dispatch({ type: "SET_PUNCTUATION_FLAG", payload: { index: i, checked } })
                        }
                        className="lingvo-checkbox"
                      />
                    </List.Item>
                  </List>
                </div>
              ))}
              <div style={{ marginTop: "12px" }}>
                <Button content={this.context("Add field")} onClick={() => dispatch({ type: "ADD_FIELD" })} className="lingvo-button-violet-dashed" />
              </div>
            </div>
          )}

          {mode === "simple" && (
            <Input
              label={this.context("Entity matching threshold")}
              value={Math.round(threshold) == threshold ? `${threshold.toString()}.0` : threshold}
              onChange={(e, { value }) => dispatch({ type: "SET_THRESHOLD", payload: value })}
              className="lingvo-labeled-input"
            />
          )}

          <div style={{ marginTop: "30px", marginBottom: "4px", textAlign: "center" }}>
            <Button
              className="lingvo-button-violet"
              content={
                this.props.dataLexicalEntries.loading ? (
                  <span>
                    {this.context("Loading perspective data")}... <Icon name="spinner" loading />
                  </span>
                ) : (
                  this.context("View suggestions")
                )
              }
              onClick={this.getSuggestions}
              disabled={this.props.dataLexicalEntries.loading || this.state.loading}
            />
          </div>
        </div>

        {this.state.loading && (
          <div className="lingvo-segment">
            <Container textAlign="center">
              {this.context("Loading suggestions...")}
              <div style={{ marginTop: "2em" }}>
                <Header as="h4" icon>
                  <Icon name="spinner" loading />
                </Header>
              </div>
            </Container>
          </div>
        )}

        {!(this.state.blank || this.state.loading) && (
          <div className="lingvo-segment">
            {this.state.groups.length > 0 && (
              <List>
                <List.Item style={{ marginBottom: "10px" }}>
                  <Checkbox
                    label={this.context("Publish result of entity merge if any merged entity is published")}
                    checked={publishedAny}
                    onChange={(e, { checked }) => dispatch({ type: "SET_MERGE_PUBLISHED_MODE", payload: checked })}
                    className="lingvo-checkbox"
                  />
                </List.Item>

                <List.Item>
                  <div className="lingvo-merge-buttons">
                    <Button
                      className="lingvo-button-black"
                      disabled={this.state.error_message}
                      content={this.context("Select all on current page")}
                      onClick={() => this.entrySelectAllPage(page, group_index_shift)}
                    />
                    <Button
                      className="lingvo-button-greenest"
                      disabled={page_state === "merging" || this.state.error_message}
                      content={
                        page_state === "merging"
                          ? this.context("Merging selected on current page...")
                          : this.context("Merge selected on current page")
                      }
                      onClick={() => this.mergeSelectedPage(page, group_index_shift)}
                    />
                  </div>
                </List.Item>

                {/*<List.Item>
                  <Button
                    disabled
                    positive
                    size="small"
                    content={this.context('Merge all')}
                    onClick={this.mergeAll}
                  />
                </List.Item>*/}
              </List>
            )}

            {groups.length === 0 && <Container textAlign="center">{this.context("No suggestions")}</Container>}

            {groups.map((group, i) => {
              const index = group_index_shift + i;
              const index_str = `${index}`;

              const result = this.state.result_map[index_str];

              const attached = settings.getIn(["attached_to", index], Immutable.Set()).size > 0 && !result;

              const merged_select_set = this.state.merged_select_map[index_str];

              const group_merged_set = result === "success" ? merged_select_set : this.state.merged_set;

              /* Lexical entries of the group. */

              const available_list = settings.getIn(["available", index]);

              const entry_list = available_list
                ? available_list.toJS().map(entry_id_str => this.state.entry_map[entry_id_str])
                : group.lexical_entries;

              const entry_ready_list = entry_list.filter(entry => !group_merged_set.hasOwnProperty(id2str(entry.id)));

              const merged_count = entry_list.length - entry_ready_list.length;

              const empty_flag = entry_ready_list.length <= 0;

              /* Which lexical entries are selected. */

              const selected_set = settings.getIn(["selected", index], Immutable.Set());
              const selected_id_list = [];

              for (const entry of entry_ready_list) {
                if (selected_set.has(id2str(entry.id))) {
                  selected_id_list.push(entry.id);
                }
              }

              const selectAllIndeterminate =
                selected_id_list.length > 0 && selected_id_list.length < entry_ready_list.length;

              const selectAllChecked = selected_id_list.length === entry_ready_list.length;

              return (
                <div key={i} className="lingvo-merge-group">
                  <div className={(!!this.state.error_message || attached || empty_flag) && "lingvo-merge-header lingvo-merge-header_disabled" || "lingvo-merge-header"} style={{ marginBottom: "8px" }}>
                    {`${this.context("Group")} #${index}, ${this.context("confidence")}: ${
                      group.confidence.toFixed(4).length < group.confidence.toString().length
                        ? group.confidence.toFixed(4)
                        : group.confidence.toString()
                    }`}
                  </div>
                  <LexicalEntryView
                    perspectiveId={id}
                    entries={entry_list}
                    mode="view"
                    entitiesMode={entitiesMode}
                    selectEntries
                    selectedEntries={selected_id_list}
                    onEntrySelect={(entry_id, checked) => this.entrySelect(index, entry_id, checked)}
                    selectAllEntries={!empty_flag}
                    selectAllIndeterminate={selectAllIndeterminate}
                    selectAllChecked={selectAllChecked}
                    onAllEntriesSelect={checked => this.entrySelectAll(index, entry_ready_list, checked)}
                    showEntryId
                    selectDisabled={result === "success" || !!this.state.error_message || attached || empty_flag}
                    selectDisabledIndeterminate={attached}
                    disabledEntrySet={this.state.merged_set}
                    disabledHeader={merged_count >= entry_list.length && result !== "success"}
                    removeSelectionEntrySet={result === "success" ? merged_select_set : this.state.merged_set}
                  />
                  
                  <div style={{ marginTop: "10px", paddingBottom: "6px" }}>
                    {empty_flag ? (
                      <div className="lingvo-message lingvo-message_info">
                        {this.context("Group doesn't have any unmerged lexical entries left.")}
                      </div>
                    ) : attached ? (
                      <div className="lingvo-message lingvo-message_info">
                        {this.context("Attached to another group.")}
                      </div>
                    ) : result === "merging" ? (
                      <div style={{ textAlign: "center", paddingTop: "10px" }}>
                        <Button className="lingvo-button-greenest" disabled content={this.context("Merging...")} />
                      </div>
                    ) : result === "success" ? (
                      <div className="lingvo-message lingvo-message_success">
                        {this.context("Merged successfully")}
                      </div>
                    ) : result === "error" ? (
                      <div className="lingvo-message lingvo-message_error">
                        {this.context("Merge error")}
                        <p>
                          {this.context("Failed to merge selected lexical entries, please contact developers.")}
                        </p>
                        <p>
                          {this.state.error_message.split(/[\r\n]+/).map((line, i) => (
                            <span key={i}>
                              {line}
                              <br />
                            </span>
                          ))}
                        </p>
                      </div>
                    ) : this.state.error_message ? (
                      <div className="lingvo-message lingvo-message_warning">
                        {this.context("Merges are disabled due to an error, please contact developers.")}
                      </div>
                    ) : (
                      <div style={{ textAlign: "center", paddingTop: "10px" }}>
                        <Button
                          className="lingvo-button-greenest"
                          content={this.context("Merge group")}
                          onClick={() => this.mergeGroup(index, entry_list, selected_id_list)}
                          disabled={selected_id_list.length < 2}
                        />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <Pagination
          current={page}
          total={Math.floor(this.state.groups.length / ROWS_PER_PAGE) + 1}
          changePage={p => dispatch({ type: "SET_PAGE", payload: p })}
        />
      </div>
    );
  }
}

MergeSettings.contextType = TranslationContext;

MergeSettings.propTypes = {
  id: PropTypes.array.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  mergeLexicalEntries: PropTypes.func.isRequired,
  settings: PropTypes.instanceOf(Immutable.Map).isRequired,
  dispatch: PropTypes.func.isRequired,
  client: PropTypes.object.isRequired
};

const fieldListEntry = {
  field_id: null,
  split_punctuation: true,
  split_space: true,
  levenshtein: 0,
  type: "text"
};

function maybe_float(string, default_value) {
  const maybe_value = parseFloat(string);
  return maybe_value == 0.0 ? 0.0 : maybe_value || default_value;
}

const initialSettings = {
  mode: "simple",
  threshold: 0.1,
  field_selection_list: Immutable.List(),
  selected: Immutable.Map(),
  selected_in: Immutable.Map(),
  available: Immutable.Map(),
  attached_from: Immutable.Map(),
  attached_to: Immutable.Map(),
  page: 1,
  publishedAny: false
};

function reducer(state, { type, payload }) {
  switch (type) {
    case "SET":
      return payload;

    case "RESET":
      return state
        .set("selected", Immutable.Map())
        .set("selected_in", Immutable.Map())
        .set("available", Immutable.Map())
        .set("attached_from", Immutable.Map())
        .set("attached_to", Immutable.Map());

    case "SET_MODE":
      return state.set("mode", payload);
    case "SET_THRESHOLD":
      return state.set("threshold", maybe_float(payload, 0.1));
    case "ADD_FIELD":
      return state.update("field_selection_list", list => list.push(fieldListEntry));
    case "REMOVE_FIELD":
      return state.update("field_selection_list", list => list.delete(payload));
    case "CHANGE_FIELD_ID":
      return state.update("field_selection_list", list =>
        list.update(payload.index, old => ({ ...old, field_id: payload.id }))
      );
    case "SET_WHITESPACE_FLAG":
      return state.update("field_selection_list", list =>
        list.update(payload.index, old => ({ ...old, split_space: payload.checked }))
      );
    case "SET_PUNCTUATION_FLAG":
      return state.update("field_selection_list", list =>
        list.update(payload.index, old => ({ ...old, split_punctuation: payload.checked }))
      );
    case "SET_LEVENSHTEIN":
      return state.update("field_selection_list", list =>
        list.update(payload.index, old => ({ ...old, levenshtein: maybe_float(payload.levenshtein, 0.1) }))
      );
    case "SET_MERGE_PUBLISHED_MODE":
      return state.set("publishedAny", payload);
    case "SET_PAGE":
      return state.set("page", payload);
    case "SELECT_ALL_PAGE": {
      const allIds = payload.reduce((result, g, i) => result.set(i, Immutable.List(g)), Immutable.Map());
      return state.set("selected", allIds);
    }
    default:
      return state;
  }
}

export default compose(
  withProps(p => ({ ...p, entitiesMode: "all" })),
  withReducer("settings", "dispatch", reducer, fromJS(initialSettings)),
  graphql(queryPerspective),
  graphql(queryLexicalEntries, { name: "dataLexicalEntries" }),
  graphql(mergeLexicalEntriesMutation, { name: "mergeLexicalEntries" }),
  branch(({ data }) => data.loading || !!data.error, renderNothing),
  withApollo,
  pure
)(MergeSettings);
