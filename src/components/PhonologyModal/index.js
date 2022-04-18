import React from "react";
import { connect } from "react-redux";
import { Breadcrumb, Button, Checkbox, Divider, Dropdown, Icon, Input, List, Modal, Select } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { getTranslation } from "api/i18n";
import { fromJS } from "immutable";
import { isEqual, map } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { closeModal } from "ducks/phonology";
import { assignDictsToTree, buildDictTrees, buildLanguageTree } from "pages/Search/treeBuilder";
import { compositeIdToString as id2str } from "utils/compositeId";

import {
  computePSDMutation,
  createPhonologyMutation,
  perspectiveColumnsFieldsQuery,
  perspectiveColumnsQuery,
  phonologyLinkPerspectiveQuery,
  phonologyPerspectiveInfoQuery,
  phonologySkipListQuery,
  phonologyTierListQuery
} from "./graphql";

const DEFAULT_CHART_THRESHOLD = 8;
const DEFAULT_STAT_THRESHOLD = 1;

class PhonologyModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      vowelsMode: "all",
      translationFieldIdStr: "",
      translationsMode: "all",
      enabledGroup: false,

      chartThreshold: this.props.mode == "statistical_distance" ? DEFAULT_STAT_THRESHOLD : DEFAULT_CHART_THRESHOLD,

      enabledCsv: false,

      enabledTiers: false,
      loadedTiers: false,
      tierList: [],
      tierSet: new Set(),

      loadedKeepJoin: false,
      keepList: [],
      enabledKeep: false,
      selectedKeepSet: new Set(),
      joinList: [],
      enabledJoin: false,
      selectedJoinSet: new Set(),

      enabledFastTrack: false,

      useLinkedData: false,
      loadedLinkedData: false,
      selectedLinkFieldSet: new Set(),

      linkFieldDataDict: {},
      linkPerspectiveDataList: [],
      linkPerspectiveDataDict: {},
      linkPerspectiveDict: {},
      lpTranslationFieldDict: {},

      perspective_selection_loading: true,
      perspective_selection_error: false,

      perspective_list: [],
      perspective_id_set: new Set()
    };

    this.perspective_info_list = [];

    this.handleVowelsChange = this.handleVowelsChange.bind(this);
    this.handleTranslationsChange = this.handleTranslationsChange.bind(this);

    this.handleEnableTier = this.handleEnableTier.bind(this);
    this.handleSelectKeep = this.handleSelectKeep.bind(this);
    this.handleSelectJoin = this.handleSelectJoin.bind(this);
    this.handleSelectLink = this.handleSelectLink.bind(this);
    this.handleSelectLinkTranslation = this.handleSelectLinkTranslation.bind(this);

    this.handleCreate = this.handleCreate.bind(this);

    this.getTierList = this.getTierList.bind(this);
    this.getKeepJoinList = this.getKeepJoinList.bind(this);
    this.getLinkData = this.getLinkData.bind(this);

    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    const {
      client,
      data: {
        all_fields: allFields,
        perspective,
        perspective: { columns, tree }
      },
      perspectiveId
    } = this.props;

    this.fieldDict = {};

    for (const field of allFields) {
      this.fieldDict[id2str(field.id)] = field;
    }

    /* Additional info of fields of our perspective. */

    this.columnFields = columns.map(column => this.fieldDict[id2str(column.field_id)]);

    this.linkFields = this.columnFields.filter(field => field.data_type === "Link");

    this.textFields = this.columnFields.filter(field => field.data_type === "Text");

    /* Trying to find a default translation field choice. */

    for (const field of this.textFields) {
      const check_str = field.english_translation.toLowerCase();

      if (check_str.includes("translation") || check_str.includes("meaning")) {
        this.state.translationFieldIdStr = id2str(field.id);
        break;
      }
    }

    /* Initializing list of perspectives selected for statistical distance analysis, if required. */

    if (this.props.mode == "statistical_distance") {
      this.state.perspective_list.push([
        perspective,
        tree
          .map(value => (value.hasOwnProperty("status") ? `${value.translation} (${value.status})` : value.translation))
          .reverse()
          .join(" \u203a ")
      ]);

      this.state.perspective_id_set.add(id2str(perspectiveId));

      client
        .query({
          query: phonologyPerspectiveInfoQuery,
          variables: {}
        })
        .then(
          ({ data: { perspectives, dictionaries, language_tree } }) => {
            this.initialize_perspective_data(perspectives, dictionaries, language_tree);
          },

          error => {
            this.setState({
              perspective_selection_loading: false,
              perspective_selection_error: true
            });
          }
        );
    }
  }

  initialize_perspective_data(perspectives, dictionaries, language_tree) {
    const tree = assignDictsToTree(
      buildDictTrees(
        fromJS({
          lexical_entries: [],
          perspectives,
          dictionaries
        })
      ),
      buildLanguageTree(fromJS(language_tree))
    ).toJS();

    /* Collecting perspectives by languages and dictionaries. */

    const perspective_info_list = [];
    const perspective_info_dict = {};

    const tree_path = [];

    function f(object) {
      const object_str = object.hasOwnProperty("status")
        ? `${object.translation} (${object.status})`
        : object.translation;

      tree_path.push(object_str);

      if (object.type == "perspective") {
        const perspective_info = [object, tree_path.join(" \u203a ")];

        perspective_info_list.push(perspective_info);
        perspective_info_dict[id2str(object.id)] = perspective_info;

        tree_path.pop();
        return;
      }

      for (const child of object.children) {
        f(child);
      }

      tree_path.pop();
    }

    for (const value of tree) {
      f(value);
    }

    this.perspective_info_list = perspective_info_list;
    this.perspective_info_dict = perspective_info_dict;

    this.setState({
      perspective_selection_loading: false
    });
  }

  handleVowelsChange(e, { value: vowelsMode }) {
    this.setState({ vowelsMode });
  }

  handleTranslationsChange(e, { value: translationsMode }) {
    this.setState({ translationsMode });
  }

  /* Loads list of perspective tiers, asynchronously. */
  async getTierList() {
    const { perspectiveId, client } = this.props;

    const { data } = await client.query({
      query: phonologyTierListQuery,
      variables: { perspectiveId }
    });

    if (data) {
      const {
        phonology_tier_list: { tier_count, total_count }
      } = data;

      /* Getting markup tiers with their occurence counts, sorting them in alphabetical order. */

      const tierList = map(tier_count, (count, tier) => [tier, count, count / total_count]);

      tierList.sort((a, b) => {
        if (a[0].toLowerCase() < b[0].toLowerCase()) {
          return -1;
        }
        if (a[0].toLowerCase() > b[0].toLowerCase()) {
          return 1;
        }

        if (a[0] < b[0]) {
          return -1;
        }
        if (a[0] > b[0]) {
          return 1;
        }

        return 0;
      });

      this.setState({
        loadedTiers: true,
        tierList
      });
    }
  }

  handleTiersChange(enabled) {
    this.setState({ enabledTiers: enabled });

    if (!this.state.loadedTiers) {
      this.getTierList();
    }
  }

  handleEnableTier(tier, enable) {
    const tierSet = this.state.tierSet;

    if (enable) {
      tierSet.add(tier);
    } else {
      tierSet.delete(tier);
    }

    this.setState({ tierSet });
  }

  /* Loads lists of skipped and adjacent markup characters, asynchronously. */
  async getKeepJoinList() {
    const { perspectiveId, client } = this.props;

    const { data } = await client.query({
      query: phonologySkipListQuery,
      variables: { perspectiveId }
    });

    if (data) {
      const {
        phonology_skip_list: { neighbour_list, skip_list }
      } = data;

      this.setState({
        loadedKeepJoin: true,
        keepList: skip_list,
        joinList: neighbour_list
      });
    }
  }

  handleKeepChange(enabled) {
    this.setState({ enabledKeep: enabled });

    if (!this.state.loadedKeepJoin) {
      this.getKeepJoinList();
    }
  }

  handleJoinChange(enabled) {
    this.setState({ enabledJoin: enabled });

    if (!this.state.loadedKeepJoin) {
      this.getKeepJoinList();
    }
  }

  /* Processes selection/deselection of one of the skipped characters for keeping. */
  handleSelectKeep(ord, enable) {
    const selectedKeepSet = this.state.selectedKeepSet;

    if (enable) {
      selectedKeepSet.add(ord);
    } else {
      selectedKeepSet.delete(ord);
    }

    this.setState({ selectedKeepSet });
  }

  /* Processes selection/deselection of one of adjacent characters for combining. */
  handleSelectJoin(ord, enable) {
    const selectedJoinSet = this.state.selectedJoinSet;

    if (enable) {
      selectedJoinSet.add(ord);
    } else {
      selectedJoinSet.delete(ord);
    }

    this.setState({ selectedJoinSet });
  }

  handleLinkChange(enabled) {
    this.setState({ useLinkedData: enabled });

    if (!this.state.loadedLinkData) {
      this.getLinkData();
    }
  }

  /* Loads data of perspectives containing info linked from this perspective. */
  async getLinkData() {
    const { client, data, perspectiveId } = this.props;
    const {
      perspective: { columns },
      all_fields: allFields
    } = data;

    const linkFieldIdList = this.linkFields.map(field => field.id);

    const { data: link_data } = await client.query({
      query: phonologyLinkPerspectiveQuery,
      variables: {
        perspectiveId,
        fieldIdList: linkFieldIdList
      }
    });

    if (!link_data) {
      return;
    }

    /* Getting info of linked perspectives. */

    const linkFieldDataDict = {};
    const linkPerspectiveDataList = [];
    const linkPerspectiveDataDict = {};
    const linkPerspectiveDict = {};

    const {
      phonology_link_perspective_data: { field_data_list, perspective_id_list }
    } = link_data;

    /* Preparing correspondence between link fields and sets of perspectives having data referenced by the
     * link fields. */

    for (const fieldData of field_data_list) {
      const [fieldId, perspectiveIdList] = fieldData;
      linkFieldDataDict[id2str(fieldId)] = perspectiveIdList.map(id2str);
    }

    for (let i = 0; i < perspective_id_list.length; i++) {
      const {
        data: { perspective: perspective_data }
      } = await client.query({
        query: perspectiveColumnsQuery,
        variables: { perspectiveId: perspective_id_list[i] }
      });

      if (!perspective_data) {
        continue;
      }

      const perspectiveData = { ...perspective_data };

      /* Preparing data of text fields of the perspective, i.e. fields selectable as a source fields for
       * phonology results compilation. */

      perspectiveData.columnFields = perspectiveData.columns.map(column => this.fieldDict[id2str(column.field_id)]);

      perspectiveData.textFields = perspectiveData.columnFields.filter(field => field.data_type === "Text");

      perspectiveData.textFieldsOptions = perspectiveData.textFields.map((field, index) => ({
        key: index,
        value: id2str(field.id),
        text: field.translation
      }));

      /* Saving perspective info. */

      linkPerspectiveDataList.push(perspectiveData);

      const key = id2str(perspectiveData.id);

      linkPerspectiveDataDict[key] = perspectiveData;
      linkPerspectiveDict[key] = 0;
    }

    this.setState({
      loadedLinkData: true,
      linkFieldDataDict,
      linkPerspectiveDataList,
      linkPerspectiveDataDict,
      linkPerspectiveDict
    });
  }

  /* Processes selection/deselection of one of the fields linking to additional data. */
  handleSelectLink(field, enable) {
    const selectedLinkFieldSet = this.state.selectedLinkFieldSet;
    const linkPerspectiveDict = this.state.linkPerspectiveDict;

    const key = id2str(field.id);

    if (enable) {
      selectedLinkFieldSet.add(key);

      for (const perspectiveIdKey of this.state.linkFieldDataDict[key]) {
        linkPerspectiveDict[perspectiveIdKey] += 1;
      }
    } else {
      selectedLinkFieldSet.delete(key);

      for (const perspectiveIdKey of this.state.linkFieldDataDict[key]) {
        linkPerspectiveDict[perspectiveIdKey] -= 1;
      }
    }

    this.setState({
      selectedLinkFieldSet,
      linkPerspectiveDict
    });
  }

  /* Selection of a source text field for one of the linked data perspectives. */
  handleSelectLinkTranslation(perspectiveId, value) {
    const lpTranslationFieldDict = this.state.lpTranslationFieldDict;
    lpTranslationFieldDict[id2str(perspectiveId)] = value;

    this.setState({ lpTranslationFieldDict });
  }

  handleCreate() {
    const { perspectiveId, computePSD, createPhonology, data } = this.props;
    const { all_fields: allFields } = data;

    /* Maybe we are to compute phonological statistical comparison? */

    if (this.props.mode == "statistical_distance") {
      const idList = this.state.perspective_list.map(([perspective, perspective_str]) => perspective.id);

      computePSD({
        variables: {
          idList,
          vowelSelection: this.state.vowelsMode === "longest",
          chartThreshold: this.state.chartThreshold
        }
      }).then(
        () => {
          window.logger.suc(
            "Phonological statistical distance comparison is being computed. " + "Please check out tasks for details."
          );
          this.props.closeModal();
        },
        () => {
          window.logger.err("Failed to launch phonological statistical distance computation!");
        }
      );

      return;
    }

    /* Standard phonology computation. */

    const translationField = this.fieldDict[this.state.translationFieldIdStr];

    const linkFieldList = Array.from(this.state.selectedLinkFieldSet.keys()).map(fieldIdStr => [
      this.fieldDict[fieldIdStr].id,
      this.state.linkFieldDataDict[fieldIdStr].map(
        perspectiveIdStr => this.state.linkPerspectiveDataDict[perspectiveIdStr].id
      )
    ]);

    const linkPerspectiveList = Object.entries(this.state.linkPerspectiveDict)

      .filter(
        ([perspectiveIdStr, count]) => count > 0 && this.state.lpTranslationFieldDict.hasOwnProperty(perspectiveIdStr)
      )

      .map(([perspectiveIdStr, count]) => [
        this.state.linkPerspectiveDataDict[perspectiveIdStr].id,
        this.fieldDict[this.state.lpTranslationFieldDict[perspectiveIdStr]].id
      ]);

    createPhonology({
      variables: {
        perspectiveId,
        groupByDescription: this.state.enabledGroup,
        translationFieldId: translationField !== undefined ? translationField.id : null,
        firstTranslation: this.state.translationsMode === "first",
        vowelSelection: this.state.vowelsMode === "longest",
        tiers: this.state.enabledTiers ? Array.from(this.state.tierSet.keys()) : null,
        chartThreshold: this.state.chartThreshold,
        keepList: this.state.enabledKeep ? Array.from(this.state.selectedKeepSet.keys()) : [],
        joinList: this.state.enabledJoin ? Array.from(this.state.selectedJoinSet.keys()) : [],
        generateCsv: this.state.enabledCsv,
        linkFieldList,
        linkPerspectiveList,
        useFastTrack: this.state.enabledFastTrack
      }
    }).then(
      () => {
        window.logger.suc("Phonology is being compiled. Please check out tasks for details.");
        this.props.closeModal();
      },
      () => {
        window.logger.err("Failed to launch phonology compilation!");
      }
    );
  }

  render() {
    const { data } = this.props;
    const {
      perspective: { columns, tree },
      all_fields: allFields
    } = data;

    const textFieldsOptions = this.textFields.map((f, k) => ({
      key: k,
      value: id2str(f.id),
      text: f.translation
    }));

    const linkPerspectiveDataList = this.state.linkPerspectiveDataList.filter(
      perspectiveData => this.state.linkPerspectiveDict[id2str(perspectiveData.id)] > 0
    );

    return (
      <div>
        <Modal closeIcon onClose={this.props.closeModal} dimmer open size="fullscreen" className="lingvo-modal2">
          <Modal.Header>
            {getTranslation(
              this.props.mode == "statistical_distance" ? "Phonological statistical distance" : "Phonology"
            )}
          </Modal.Header>

          <Modal.Content>
            <List>
              <List.Item>
                <Checkbox
                  radio
                  label={getTranslation("All vowels.")}
                  name="vowelsRadioGroup"
                  value="all"
                  checked={this.state.vowelsMode === "all"}
                  onChange={this.handleVowelsChange}
                />
              </List.Item>

              <List.Item>
                <Checkbox
                  radio
                  label={getTranslation("Only longest vowels and vowels with highest intensity.")}
                  name="vowelsRadioGroup"
                  value="longest"
                  checked={this.state.vowelsMode === "longest"}
                  onChange={this.handleVowelsChange}
                />
              </List.Item>
            </List>

            {!this.props.mode && (
              <div>
                <Select
                  defaultValue={this.state.translationFieldIdStr}
                  placeholder="Translation field"
                  options={textFieldsOptions}
                  onChange={(e, { value }) => this.setState({ translationFieldIdStr: value })}
                />
              </div>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    radio
                    label={getTranslation("Show all translations of each word.")}
                    name="translationsRadioGroup"
                    value="all"
                    checked={this.state.translationsMode === "all"}
                    onChange={this.handleTranslationsChange}
                  />
                </List.Item>

                <List.Item>
                  <Checkbox
                    radio
                    label={getTranslation("Show only the first translation of each word.")}
                    name="translationsRadioGroup"
                    value="longest"
                    checked={this.state.translationsMode === "longest"}
                    onChange={this.handleTranslationsChange}
                  />
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Use linked data")}
                    checked={this.state.useLinkedData}
                    onChange={(e, { checked }) => this.handleLinkChange(checked)}
                  />

                  {this.state.useLinkedData && !this.state.loadedLinkData && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        <List.Item>
                          Loading linked perspective data... <Icon name="spinner" loading />
                        </List.Item>
                      </List>
                    </div>
                  )}

                  {this.state.useLinkedData && this.state.loadedLinkData && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        {map(this.linkFields, field => (
                          <List.Item key={id2str(field.id)}>
                            <Checkbox
                              label={field.translation}
                              checked={this.state.selectedLinkFieldSet[id2str(field.id)]}
                              onChange={(e, { checked }) => this.handleSelectLink(field, checked)}
                            />
                          </List.Item>
                        ))}
                      </List>

                      {linkPerspectiveDataList.length > 0 && (
                        <List>
                          {map(linkPerspectiveDataList, perspectiveData => (
                            <List.Item key={id2str(perspectiveData.id)}>
                              <Breadcrumb
                                icon="right angle"
                                sections={perspectiveData.tree
                                  .slice()
                                  .reverse()
                                  .map(x => ({ key: x.id, content: x.translation, link: false }))}
                              />
                              <span style={{ marginLeft: "1em" }}>
                                <Select
                                  defaultValue={
                                    this.state.lpTranslationFieldDict.hasOwnProperty(id2str(perspectiveData.id))
                                      ? this.state.lpTranslationFieldDict[id2str(perspectiveData.id)]
                                      : ""
                                  }
                                  placeholder="Translation field"
                                  options={perspectiveData.textFieldsOptions}
                                  onChange={(e, { value }) =>
                                    this.handleSelectLinkTranslation(perspectiveData.id, value)
                                  }
                                />
                              </span>
                            </List.Item>
                          ))}
                        </List>
                      )}
                    </div>
                  )}
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Group phonology data by markup descriptions.")}
                    checked={this.state.enabledGroup}
                    onChange={(e, { checked }) => this.setState({ enabledGroup: checked })}
                  />
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  {!this.props.mode ? (
                    <Input
                      label={getTranslation("Formant chart threshold")}
                      value={this.state.chartThreshold}
                      onChange={(e, { value }) =>
                        this.setState({
                          chartThreshold: parseInt(value) || DEFAULT_CHART_THRESHOLD
                        })
                      }
                      className="label-input-adaptive"
                    />
                  ) : (
                    <Input
                      label={getTranslation("Vowel formant count threshold")}
                      value={this.state.chartThreshold}
                      onChange={(e, { value }) =>
                        this.setState({
                          chartThreshold: parseInt(value) || DEFAULT_STAT_THRESHOLD
                        })
                      }
                    />
                  )}
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Export phonology data to a CSV file.")}
                    checked={this.state.enabledCsv}
                    onChange={(e, { checked }) => this.setState({ enabledCsv: checked })}
                  />
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Choose markup tiers")}
                    checked={this.state.enabledTiers}
                    onChange={(e, { checked }) => this.handleTiersChange(checked)}
                  />

                  {this.state.enabledTiers && !this.state.loadedTiers && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        <List.Item>
                          Loading tier data... <Icon name="spinner" loading />
                        </List.Item>
                      </List>
                    </div>
                  )}

                  {this.state.enabledTiers && this.state.tierList.length > 0 && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        {map(this.state.tierList, ([tier, count, fraction]) => (
                          <List.Item key={tier}>
                            <Checkbox
                              label={`Tier "${tier}" (present at ${parseFloat(fraction * 100).toFixed(
                                2
                              )}% of markup records)`}
                              checked={this.state.tierSet[tier]}
                              onChange={(e, { checked }) => this.handleEnableTier(tier, checked)}
                            />
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Keep skipped vowel interval characters")}
                    checked={this.state.enabledKeep}
                    onChange={(e, { checked }) => this.handleKeepChange(checked)}
                  />

                  {this.state.enabledKeep && !this.state.loadedKeepJoin && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        <List.Item>
                          Loading skipped character data... <Icon name="spinner" loading />
                        </List.Item>
                      </List>
                    </div>
                  )}

                  {this.state.enabledKeep && this.state.keepList.length > 0 && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        {map(this.state.keepList, ([ord, count, str, name]) => (
                          <List.Item key={ord}>
                            <Checkbox
                              label={`"${str}" U+${ord.toString(16).padStart(4, "0")} ${name}`}
                              checked={this.state.selectedKeepSet.has(ord)}
                              onChange={(e, { checked }) => this.handleSelectKeep(ord, checked)}
                            />
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("Combine with adjacent interval characters")}
                    checked={this.state.enabledJoin}
                    onChange={(e, { checked }) => this.handleJoinChange(checked)}
                  />

                  {this.state.enabledJoin && !this.state.loadedKeepJoin && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        <List.Item>
                          Loading adjacent character data... <Icon name="spinner" loading />
                        </List.Item>
                      </List>
                    </div>
                  )}

                  {this.state.enabledJoin && this.state.joinList.length > 0 && (
                    <div style={{ marginLeft: "1.5em" }}>
                      <List>
                        {map(this.state.joinList, ([ord, count, str, name]) => (
                          <List.Item key={ord}>
                            <Checkbox
                              label={`"${str}" U+${ord.toString(16).padStart(4, "0")} ${name}`}
                              checked={this.state.selectedJoinSet.has(ord)}
                              onChange={(e, { checked }) => this.handleSelectJoin(ord, checked)}
                            />
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  )}
                </List.Item>
              </List>
            )}

            {!this.props.mode && (
              <List>
                <List.Item>
                  <Checkbox
                    label={getTranslation("'Fast Track' formant extraction")}
                    checked={this.state.enabledFastTrack}
                    onChange={(e, { checked }) => this.setState({ enabledFastTrack: checked })}
                  />
                </List.Item>
              </List>
            )}

            {this.props.mode == "statistical_distance" && (
              <div style={{ marginTop: "1.5em" }}>
                <span>Perspectives selected for comparison:</span>
                {map(this.state.perspective_list, ([perspective, perspective_str], index) => (
                  <List style={{ marginLeft: "1em" }} key={`perspective${index}`}>
                    <List.Item>
                      <span>
                        {perspective_str}
                        <Icon
                          name="delete"
                          style={{ paddingLeft: "0.5em", paddingRight: "0.5em" }}
                          onClick={() => {
                            this.state.perspective_list.splice(index, 1);
                            this.state.perspective_id_set.delete(id2str(perspective.id));

                            this.setState({
                              perspective_list: this.state.perspective_list,
                              perspective_id_set: this.state.perspective_id_set
                            });
                          }}
                        />
                      </span>
                    </List.Item>
                  </List>
                ))}
                <List style={{ marginLeft: "1em" }}>
                  <List.Item>
                    {this.state.perspective_selection_loading ? (
                      <span>
                        Loading perspective selection... <Icon name="spinner" loading />
                      </span>
                    ) : this.state.perspective_selection_error ? (
                      <span>Loading perspective selection... Failure.</span>
                    ) : (
                      <Dropdown
                        fluid
                        placeholder="Add perspective"
                        search
                        selection
                        options={this.perspective_info_list

                          .filter(
                            ([perspective, perspective_str]) =>
                              !this.state.perspective_id_set.has(id2str(perspective.id))
                          )

                          .map(([perspective, perspective_str]) => ({
                            key: perspective.id,
                            value: id2str(perspective.id),
                            text: perspective_str
                          }))}
                        value={""}
                        onChange={(event, data) => {
                          const perspective_info = this.perspective_info_dict[data.value];

                          if (!this.state.perspective_id_set.has(data.value)) {
                            this.state.perspective_list.push(perspective_info);
                            this.state.perspective_id_set.add(data.value);
                          }

                          this.setState({
                            perspective_list: this.state.perspective_list,
                            perspective_id_set: this.state.perspective_id_set
                          });
                        }}
                      />
                    )}
                  </List.Item>
                </List>
              </div>
            )}
          </Modal.Content>

          <Modal.Actions>
            <Button content="Create" onClick={this.handleCreate} className="lingvo-button-violet" />
            <Button content="Cancel" onClick={this.props.closeModal} className="lingvo-button-basic-black" />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

PhonologyModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  createPhonology: PropTypes.func.isRequired
};

export default compose(
  connect(
    state => state.phonology,
    dispatch => bindActionCreators({ closeModal }, dispatch)
  ),
  branch(({ visible }) => !visible, renderNothing),
  graphql(perspectiveColumnsFieldsQuery),
  graphql(createPhonologyMutation, { name: "createPhonology" }),
  graphql(computePSDMutation, { name: "computePSD" }),
  branch(({ data }) => data.loading, renderNothing),
  withApollo
)(PhonologyModal);
