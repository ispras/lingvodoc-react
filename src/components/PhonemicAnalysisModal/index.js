import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Divider, List, Modal, Select } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { map } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { closeModal } from "ducks/phonemicAnalysis";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

import "./style.scss";

export const perspectiveColumnsFieldsQuery = gql`
  query perspectiveColumnsFields($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translations
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
    }
    all_fields {
      id
      translations
      english_translation: translation(locale_id: 2)
      data_type
    }
  }
`;

const computePhonemicAnalysisMutation = gql`
  mutation computePhonemicAnalysis(
    $perspectiveId: LingvodocID!
    $transcriptionFieldId: LingvodocID!
    $translationFieldId: LingvodocID!
    $debugFlag: Boolean
    $intermediateFlag: Boolean
  ) {
    phonemic_analysis(
      perspective_id: $perspectiveId
      transcription_field_id: $transcriptionFieldId
      translation_field_id: $translationFieldId
      debug_flag: $debugFlag
      intermediate_flag: $intermediateFlag
    ) {
      triumph
      entity_count
      result
      intermediate_url_list
    }
  }
`;

class PhonemicAnalysisModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      entity_count: 0,
      library_present: true,
      result: "",

      intermediate_url_list: null,

      transcriptionFieldIdStr: "",
      translationFieldIdStr: "",

      debugFlag: false,
      intermediateFlag: false
    };

    this.handleCreate = this.handleCreate.bind(this);

    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    const {
      data: {
        all_fields: allFields,
        perspective: { columns }
      }
    } = this.props;

    this.fieldDict = {};

    for (const field of allFields) {
      this.fieldDict[id2str(field.id)] = field;
    }

    /* Additional info of fields of our perspective. */

    this.columnFields = columns.map(column => this.fieldDict[id2str(column.field_id)]);

    this.textFields = this.columnFields.filter(field => field.data_type === "Text");

    /* Selecting text fields with 'transcription' and 'translation' in their names, if we have them. */

    for (const field of this.textFields) {
      const check_str = field.english_translation.toLowerCase();

      if (!this.state.transcriptionFieldIdStr && check_str.includes("transcription")) {
        this.state.transcriptionFieldIdStr = id2str(field.id);
      }

      if (!this.state.translationFieldIdStr && (check_str.includes("translation") || check_str.includes("meaning"))) {
        this.state.translationFieldIdStr = id2str(field.id);
      }
    }

    /* If we haven't found thus named fields, we try to select the first one. */

    if (this.textFields.length > 0) {
      if (!this.state.transcriptionFieldIdStr) {
        this.state.transcriptionFieldIdStr = id2str(this.textFields[0].id);
      }

      if (!this.state.translationFieldIdStr) {
        this.state.translationFieldIdStr = id2str(this.textFields[0].id);
      }
    }
  }

  handleCreate() {
    const { perspectiveId, computePhonemicAnalysis } = this.props;

    const transcriptionField = this.fieldDict[this.state.transcriptionFieldIdStr];
    const translationField = this.fieldDict[this.state.translationFieldIdStr];

    computePhonemicAnalysis({
      variables: {
        perspectiveId,
        transcriptionFieldId: transcriptionField.id,
        translationFieldId: translationField.id,
        debugFlag: this.state.debugFlag,
        intermediateFlag: this.state.intermediateFlag
      }
    }).then(
      ({
        data: {
          phonemic_analysis: { entity_count, result, intermediate_url_list }
        }
      }) => {
        this.setState({
          entity_count,
          library_present: true,
          result,
          intermediate_url_list
        });
      },

      error_data => {
        window.logger.err(this.context("Failed to compute phonemic analysis!"));

        if (error_data.message === "GraphQL error: Analysis library is absent, please contact system administrator.") {
          this.setState({
            library_present: false
          });
        }
      }
    );
  }

  render() {
    const textFieldsOptions = this.textFields.map((f, k) => ({
      key: k,
      value: id2str(f.id),
      text: T(f.translations)
    }));

    return (
      <div>
        <Modal closeIcon onClose={this.props.closeModal} dimmer open centered size="large" className="lingvo-modal2">
          <Modal.Header>Phonemic analysis</Modal.Header>

          <Modal.Content>
            {this.textFields.length > 0 && (
              <List>
                <List.Item>
                  <span style={{ marginRight: "0.5em" }}>{this.context("Source transcription field")}:</span>
                  <Select
                    defaultValue={this.state.transcriptionFieldIdStr}
                    placeholder={this.context("Source transcription field selection")}
                    options={textFieldsOptions}
                    onChange={(e, { value }) => this.setState({ transcriptionFieldIdStr: value })}
                  />
                </List.Item>
                <List.Item>
                  <span style={{ marginRight: "0.5em" }}>{this.context("Source translation field")}:</span>
                  <Select
                    defaultValue={this.state.translationFieldIdStr}
                    placeholder={this.context("Source translation field selection")}
                    options={textFieldsOptions}
                    onChange={(e, { value }) => this.setState({ translationFieldIdStr: value })}
                  />
                </List.Item>
              </List>
            )}

            {this.textFields.length <= 0 && (
              <span>Perspective does not have any text fields, phonemic analysis is impossible.</span>
            )}

            {!this.state.library_present && (
              <List>
                <div style={{ color: "red" }}>Analysis library is absent, please contact system administrator.</div>
              </List>
            )}

            {this.props.user.id == 1 && (
              <List>
                <List.Item>
                  <Checkbox
                    label={this.context("Debug flag")}
                    style={{ marginTop: "1em", verticalAlign: "middle" }}
                    checked={this.state.debugFlag}
                    onChange={(e, { checked }) => {
                      this.setState({ debugFlag: checked });
                    }}
                  />
                </List.Item>
                <List.Item>
                  <Checkbox
                    label={this.context("Save intermediate data")}
                    style={{ marginTop: "1em", verticalAlign: "middle" }}
                    checked={this.state.intermediateFlag}
                    onChange={(e, { checked }) => {
                      this.setState({ intermediateFlag: checked });
                    }}
                  />
                </List.Item>
              </List>
            )}
          </Modal.Content>

          {this.state.library_present &&
            this.state.result.length > 0 && [
              <Divider key="divider" />,
              <Modal.Content key="content" scrolling>
                <h3>Analysis results ({this.state.entity_count} text entities analysed):</h3>
                {this.state.intermediate_url_list && (
                  <List.Item>
                    <div style={{ marginTop: "0.75em" }}>
                      <span>Intermediate data:</span>
                      <List>
                        {map(this.state.intermediate_url_list, intermediate_url => (
                          <List.Item key={intermediate_url}>
                            <a href={intermediate_url}>{intermediate_url}</a>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  </List.Item>
                )}
                <div>
                  <pre>{this.state.result}</pre>
                </div>
              </Modal.Content>
            ]}

          <Modal.Actions>
            <Button
              content={this.context("Compute")}
              onClick={this.handleCreate}
              disabled={this.textFields.length <= 0}
              className="lingvo-button-violet"
            />
            <Button
              content={this.context("Close")}
              onClick={this.props.closeModal}
              className="lingvo-button-basic-black"
            />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

PhonemicAnalysisModal.contextType = TranslationContext;

PhonemicAnalysisModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  computePhonemicAnalysis: PropTypes.func.isRequired
};

export default compose(
  connect(
    state => state.phonemicAnalysis,
    dispatch => bindActionCreators({ closeModal }, dispatch)
  ),
  connect(state => state.user),
  branch(({ visible }) => !visible, renderNothing),
  graphql(perspectiveColumnsFieldsQuery),
  graphql(computePhonemicAnalysisMutation, { name: "computePhonemicAnalysis" }),
  branch(({ data }) => data.loading, renderNothing),
  withApollo
)(PhonemicAnalysisModal);
