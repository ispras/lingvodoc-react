import React, { useContext, useState } from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Dropdown, Header, Icon, List, Message, Modal } from "semantic-ui-react";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing, withProps } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Languages from "components/Languages";
import { content as contentMarkup } from "components/LexicalEntry/Markup";
import { content as contentSound } from "components/LexicalEntry/Sound";
import { validateQuery } from "components/MarkupModal";
import Translations from "components/Translation";
import { closeConvert } from "ducks/markup";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

import { convertToExistingDictionaryMutation, convertToNewDictionaryMutation, dictionariesQuery } from "./graphql";

const AdditionalMarkup = ({ info }) => {
  const {
    loading,
    error,
    source_id_str,
    valid_id_str_set,
    field_type_dict,
    tree_list,
    selection_dict: initial_selection_dict,
    selection_count: initial_selection_count,
    total_count
  } = info;

  const getTranslation = useContext(TranslationContext);

  let [{ selection_dict, selection_count }, setState] = useState({
    selection_dict: initial_selection_dict,
    selection_count: initial_selection_count
  });

  const f = tree => {
    const entity = tree[0];

    let text = "";

    const id_str = id2str(entity.id);

    const is_source = id_str == source_id_str;
    const is_markup = selection_dict.hasOwnProperty(id_str);
    const is_selected = selection_dict[id_str];
    const is_valid = valid_id_str_set.hasOwnProperty(id_str);

    switch (field_type_dict[id2str(entity.field_id)]) {
      case "Text":
        text = entity.content;
        break;
      case "Sound":
        text = contentSound(entity.content, 64);
        break;
      case "Markup":
        text = contentMarkup(entity.content, 64);
        if (is_markup && !is_valid) {
          text += " (Invalid)";
        }
      default:
        break;
    }

    const tree_list_length = tree.length > 1 && tree[1].length;

    return (
      <div>
        <li>
          {is_markup ? (
            <Checkbox
              label={text}
              disabled={is_source || !is_valid}
              checked={is_selected}
              onChange={(e, { checked }) => {
                selection_dict[id_str] = checked;

                if (checked) {
                  selection_count++;
                } else {
                  selection_count--;
                }

                setState({
                  selection_dict,
                  selection_count
                });
              }}
            />
          ) : (
            text
          )}
        </li>
        {tree.length > 1 &&
          tree[1].map((tree, index) => (
            <ul key={id2str(tree[0].id)} className={index + 1 == tree_list_length ? "last" : ""}>
              {f(tree)}
            </ul>
          ))}
      </div>
    );
  };

  const tree_list_length = tree_list.length;

  return (
    <div className="entity">
      {total_count > 1 && (
        <Checkbox
          style={{ marginBottom: "0.5em" }}
          label={getTranslation("Select/deselect all markup")}
          checked={selection_count >= total_count}
          indeterminate={selection_count > 0 && selection_count < total_count}
          onChange={(e, { checked }) => {
            if (selection_count < total_count) {
              for (const id_str of Object.keys(valid_id_str_set)) {
                if (id_str != source_id_str) {
                  selection_dict[id_str] = true;
                }
              }

              selection_count = total_count;
            } else {
              for (const id_str of Object.keys(valid_id_str_set)) {
                if (id_str != source_id_str) {
                  selection_dict[id_str] = false;
                }
              }

              selection_count = 0;
            }

            setState({
              selection_dict,
              selection_count
            });
          }}
        />
      )}
      {tree_list.map((tree, index) => (
        <ul key={id2str(tree[0].id)} className={index + 1 == tree_list_length ? "last" : ""}>
          {f(tree)}
        </ul>
      ))}
    </div>
  );
};

class ConvertEafModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "new",
      parentLanguage: null,
      translations: [],
      dictionary: null,
      mergeByMeaning: true,
      mergeByMeaningAll: true,
      additionalEntries: true,
      additionalEntriesAll: true,
      useAdditionalMarkup: false,
      additionalMarkupInfo: null
    };
    this.convert = this.convert.bind(this);
    this.handleModeChange = this.handleModeChange.bind(this);
    this.useAdditionalMarkupChange = this.useAdditionalMarkupChange.bind(this);
    this.conversionEnabled = this.conversionEnabled.bind(this);
  }

  useAdditionalMarkupChange(checked) {
    if (!checked) {
      this.setState({ useAdditionalMarkup: false });
      return;
    }

    /* Using additional markup, checking if we need to compile additional markup info. */

    if (this.state.additionalMarkupInfo != null) {
      this.setState({ useAdditionalMarkup: true });
      return;
    }

    /* Compiling additional markup info. */

    this.setState({
      useAdditionalMarkup: true,
      additionalMarkupInfo: { loading: true }
    });

    const { markup: source, columns } = this.props;
    const source_id_str = id2str(source.id);

    const markup_field_id = source.field_id;

    const markup_entity_id_list = [];
    const entity_tree_list = [];

    const selection_dict = { [source_id_str]: true };

    let selection_count = 0;
    let total_count = 0;

    /* For each entry we get all minimal entity trees including markup entities. */

    for (const entry of this.props.allEntriesGenerator()) {
      const markup_entity_id_str_list = [];

      const from_to_dict = {};
      const to_from_dict = {};

      const entity_dict = {};

      for (const [index, entity] of entry.entities.entries()) {
        const from_id_str = entity.self_id ? id2str(entity.self_id) : "";
        const to_id_str = id2str(entity.id);

        if (isEqual(entity.field_id, markup_field_id)) {
          markup_entity_id_str_list.push(to_id_str);

          if (!isEqual(entity.id, source.id)) {
            markup_entity_id_list.push(entity.id);

            if (this.state.mode == "new") {
              selection_dict[to_id_str] = true;
              selection_count++;
            } else {
              selection_dict[to_id_str] = false;
            }
          }
        }

        if (!from_to_dict.hasOwnProperty(from_id_str)) {
          from_to_dict[from_id_str] = [to_id_str];
        } else {
          from_to_dict[from_id_str].push(to_id_str);
        }

        to_from_dict[to_id_str] = from_id_str;
        entity_dict[to_id_str] = entity;
      }

      /* Generating minimal markup-containing entity trees. */

      const entity_id_str_set = {};

      const f = entity_id_str => {
        if (entity_id_str_set.hasOwnProperty(entity_id_str)) {
          return;
        }

        entity_id_str_set[entity_id_str] = null;

        const from_id_str = to_from_dict[entity_id_str];

        if (from_id_str) {
          f(from_id_str);
        }
      };

      for (const markup_entity_id_str of markup_entity_id_str_list) {
        f(markup_entity_id_str);
      }

      const g = entity_id_str => {
        const node = [entity_dict[entity_id_str]];
        const item_list = [];

        const subentity_id_str_list = from_to_dict[entity_id_str];

        if (subentity_id_str_list) {
          for (const subentity_id_str of subentity_id_str_list) {
            if (entity_id_str_set.hasOwnProperty(subentity_id_str)) {
              item_list.push(g(subentity_id_str));
            }
          }
        }

        if (item_list.length > 0) {
          node.push(item_list);
        }

        return node;
      };

      for (const entity_id_str of from_to_dict[""]) {
        if (entity_id_str_set.hasOwnProperty(entity_id_str)) {
          entity_tree_list.push(g(entity_id_str));
        }
      }
    }

    /* Validating other markups, preparing to allow other markup selection. */

    this.props.client
      .query({
        query: validateQuery,
        variables: { idList: markup_entity_id_list }
      })
      .then(
        ({ data: { convert_five_tiers_validate: is_valid_list } }) => {
          const valid_id_str_set = { [source_id_str]: null };

          for (const [index, markup_entity_id] of markup_entity_id_list.entries()) {
            const markup_entity_id_str = id2str(markup_entity_id);

            if (is_valid_list[index]) {
              valid_id_str_set[markup_entity_id_str] = null;
              total_count += 1;

              continue;
            }

            if (selection_dict[markup_entity_id_str]) {
              selection_dict[markup_entity_id_str] = false;
              selection_count--;
            }
          }

          const field_type_dict = {};

          for (const column of columns) {
            field_type_dict[id2str(column.id)] = column.data_type;
          }

          this.setState({
            useAdditionalMarkup: true,
            additionalMarkupInfo: {
              source_id_str,
              valid_id_str_set,
              field_type_dict,
              tree_list: entity_tree_list,
              selection_dict,
              selection_count,
              total_count,
              markup_entity_id_list
            }
          });
        },
        error => {
          this.setState({ additionalMarkupInfo: { error: true } });
        }
      );
  }

  handleModeChange(e, { value: mode }) {
    this.setState({ mode });
  }

  convert() {
    const { convertToNewDictionary, convertToExistingDictionary, markup, actions } = this.props;
    const {
      mode,
      parentLanguage,
      dictionary,
      translations,
      mergeByMeaning,
      mergeByMeaningAll,
      additionalEntries,
      additionalEntriesAll,
      useAdditionalMarkup,
      additionalMarkupInfo
    } = this.state;

    const markupIdList = [markup.id];

    if (useAdditionalMarkup) {
      const { markup_entity_id_list, selection_dict } = additionalMarkupInfo;

      for (const markup_entity_id of markup_entity_id_list) {
        if (selection_dict[id2str(markup_entity_id)]) {
          markupIdList.push(markup_entity_id);
        }
      }
    }

    if (mode === "new") {
      convertToNewDictionary({
        variables: {
          markupIdList,
          languageId: parentLanguage.id,
          atoms: translations.map(a => ({ locale_id: a.localeId, content: a.content })),
          mergeByMeaning,
          mergeByMeaningAll,
          additionalEntries,
          additionalEntriesAll
        }
      }).then(
        () => {
          window.logger.suc(
            this.context("Started convertion to a new dictionary. Please check out tasks for details.")
          );
          actions.closeConvert();
        },
        () => {
          window.logger.err(this.context("Failed to start convertion to a new dictionary!"));
        }
      );
    } else if (mode === "update") {
      convertToExistingDictionary({
        variables: {
          markupIdList,
          dictionaryId: dictionary.id,
          mergeByMeaning,
          mergeByMeaningAll,
          additionalEntries,
          additionalEntriesAll
        }
      }).then(
        () => {
          window.logger.suc(this.context("Started dictionary update. Please check out tasks for details."));
          actions.closeConvert();
        },
        () => {
          window.logger.err(this.context("Failed to start dictionary update!"));
        }
      );
    }
  }

  conversionEnabled() {
    const { mode, parentLanguage, dictionary, translations } = this.state;

    switch (mode) {
      case "new":
        return !!parentLanguage && translations.length > 0 && translations.some(t => t.content);

      case "update":
        return !!dictionary;

      default:
        return false;
    }
  }

  render() {
    const {
      visible,
      actions,
      data: { loading, error, dictionaries }
    } = this.props;

    const {
      mode,
      parentLanguage,
      translations,
      mergeByMeaning,
      mergeByMeaningAll,
      additionalEntries,
      additionalEntriesAll,
      useAdditionalMarkup,
      additionalMarkupInfo
    } = this.state;

    const dictMap = {};
    const dictOptions = [];

    if (mode === "update" && !loading && !error) {
      for (const d of dictionaries) {
        const id = id2str(d.id);
        dictMap[id] = d;
        dictOptions.push({ key: id, value: id, text: T(d.translations) });
      }
    }

    return (
      <Modal closeIcon onClose={actions.closeConvert} open={visible} dimmer size="large" className="lingvo-modal2">
        <Modal.Header>
          <Checkbox
            radio
            label={this.context("Create dictionary")}
            name="vowelsRadioGroup"
            value="new"
            checked={mode === "new"}
            onChange={this.handleModeChange}
          />
          <Checkbox
            style={{ marginLeft: "1em" }}
            radio
            label={this.context("Update dictionary")}
            name="vowelsRadioGroup"
            value="update"
            checked={mode === "update"}
            onChange={this.handleModeChange}
          />
        </Modal.Header>
        <Modal.Content>
          <div style={{ marginBottom: "1.75em" }}>
            <div>
              <Checkbox
                checked={mergeByMeaning}
                label={`${this.context("Merge lexical entries by meaning")}.`}
                onChange={(e, { checked }) => this.setState({ mergeByMeaning: checked })}
              />
              {mergeByMeaning && (
                <div style={{ marginLeft: "1em" }}>
                  <div style={{ marginTop: "0.25em" }} key="empty">
                    <Checkbox
                      radio
                      label={`${this.context("Only entries of paradigmatic annotated forms")}.`}
                      checked={!mergeByMeaningAll}
                      onChange={e => this.setState({ mergeByMeaningAll: false })}
                    />
                  </div>
                  <div style={{ marginTop: "0.25em" }} key="all">
                    <Checkbox
                      radio
                      label={`${this.context("All entries")}.`}
                      checked={mergeByMeaningAll}
                      onChange={e => this.setState({ mergeByMeaningTrue: false })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: "0.5em" }}>
              <Checkbox
                checked={additionalEntries}
                label={this.context(
                  "Add words and transcriptions from paradigms to lexical entries, grouping by meaning."
                )}
                onChange={(e, { checked }) => this.setState({ additionalEntries: checked })}
              />
              {additionalEntries && (
                <div style={{ marginLeft: "1em" }}>
                  <div style={{ marginTop: "0.25em" }} key="empty">
                    <Checkbox
                      radio
                      label={this.context("Only to entries lacking words and transcriptions.")}
                      checked={!additionalEntriesAll}
                      onChange={e => this.setState({ additionalEntriesAll: false })}
                    />
                  </div>
                  <div style={{ marginTop: "0.25em" }} key="all">
                    <Checkbox
                      radio
                      label={this.context("To all lexical entries linked to paradigms.")}
                      checked={additionalEntriesAll}
                      onChange={e => this.setState({ additionalEntriesAll: true })}
                    />
                  </div>
                </div>
              )}
            </div>
            <div style={{ marginTop: "0.5em" }}>
              <Checkbox
                checked={useAdditionalMarkup}
                label={this.context("Convert additional markup") + (useAdditionalMarkup ? ":" : ".")}
                onChange={(e, { checked }) => this.useAdditionalMarkupChange(checked)}
              />
              {useAdditionalMarkup && (
                <div style={{ marginTop: "0.5em", marginLeft: "1em" }}>
                  {additionalMarkupInfo.loading ? (
                    <span>
                      {this.context("Loading markup data")}... <Icon name="spinner" loading />
                    </span>
                  ) : additionalMarkupInfo.error ? (
                    <Message negative compact>
                      {getTranslation("Markup data loading error, please contact administrators.")}
                    </Message>
                  ) : (
                    <AdditionalMarkup info={additionalMarkupInfo} />
                  )}
                </div>
              )}
            </div>
          </div>
          {mode === "new" && (
            <div style={{ minHeight: "500px" }}>
              <div>
                <Header>{this.context("Add one or more translations")}</Header>
                <Translations
                  translations={translations}
                  initialize={true}
                  onChange={t => this.setState({ translations: t })}
                />
              </div>

              {!parentLanguage && <Header>{this.context("Please, select the parent language")}</Header>}
              {parentLanguage && (
                <Header>
                  {this.context("You have selected:")} <b>{T(parentLanguage.translations)}</b>
                </Header>
              )}
              <div style={{ height: "400px" }}>
                <Languages
                  inverted={false}
                  selected={parentLanguage}
                  onSelect={p => this.setState({ parentLanguage: p })}
                />
              </div>
            </div>
          )}
          {mode === "update" &&
            (loading ? (
              <span>
                {this.context("Loading dictionary data")}... <Icon name="spinner" loading />
              </span>
            ) : error ? (
              <Message negative compact>
                {this.context("Dictionary data loading error, please contact adiministrators.")}
              </Message>
            ) : (
              <div>
                <Dropdown
                  placeholder={this.context("Select dictionary")}
                  fluid
                  search
                  selection
                  options={dictOptions}
                  onChange={(e, { value }) => this.setState({ dictionary: dictMap[value] })}
                />
              </div>
            ))}
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={this.context("Convert")}
            onClick={this.convert}
            disabled={!this.conversionEnabled()}
            className="lingvo-button-violet"
          />
          <Button
            content={this.context("Cancel")}
            onClick={actions.closeConvert}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

ConvertEafModal.contextType = TranslationContext;

ConvertEafModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  audio: PropTypes.object,
  markup: PropTypes.object,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    closeConvert: PropTypes.func.isRequired
  }).isRequired,
  convertToNewDictionary: PropTypes.func.isRequired,
  convertToExistingDictionary: PropTypes.func.isRequired
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeConvert }, dispatch)
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  branch(({ convertVisible }) => !convertVisible, renderNothing),
  withProps(({ convertVisible, data: { audio, markup, columns, allEntriesGenerator } }) => ({
    visible: convertVisible,
    audio,
    markup,
    columns,
    allEntriesGenerator
  })),
  graphql(dictionariesQuery),
  graphql(convertToNewDictionaryMutation, { name: "convertToNewDictionary" }),
  graphql(convertToExistingDictionaryMutation, { name: "convertToExistingDictionary" }),
  //branch(({ data }) => data.loading, renderNothing),
  withApollo
)(ConvertEafModal);
