import React from "react";
import { connect } from "react-redux";
import { Button, Checkbox, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { closeSaveDictionaryModal } from "ducks/saveDictionary";
import TranslationContext from "Layout/TranslationContext";

const query = gql`
  query Dictionary($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      translations
    }
  }
`;

const saveDictionaryMutation = gql`
  mutation SaveDictionary($id: LingvodocID!, $mode: String!, $soundFlag: Boolean, $markupFlag: Boolean, $fType: String) {
    save_dictionary(id: $id, mode: $mode, sound_flag: $soundFlag, markup_flag: $markupFlag, f_type: $fType) {
      triumph
    }
  }
`;

class Properties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      mode: "all",
      save_sound: false,
      save_markup: false,
      f_type: 'xlsx'
    };

    this.onChangeMode = this.onChangeMode.bind(this);
    this.saveData = this.saveData.bind(this);
    this.onSaveData = this.onSaveData.bind(this);
  }

  onChangeMode(e, { value }) {
    this.setState({
      mode: value
    });
  }

  onSaveData(e, { value }) {
    this.saveData(value);
  }

  saveData(mode) {
    const { id, save } = this.props;
    save({
      variables: {
        id,
        mode,
        soundFlag: this.state.save_sound,
        markupFlag: this.state.save_markup,
        fType: this.state.f_type
      }
    }).then(
      () => {
        window.logger.suc(this.context("Saving dictionary task is launched. Please check out tasks for details."));
      },
      () => {
        window.logger.err(this.context("Failed to launch saving dictionary task."));
      }
    );
  }

  render() {
    const {
      data: { dictionary },
      actions
    } = this.props;

    const { translations } = dictionary;

    return (
      <Modal closeIcon onClose={actions.closeSaveDictionaryModal} open dimmer className="lingvo-modal2">
        <Modal.Header>{`${this.context("Save")} '${T(translations)}'?`}</Modal.Header>
        <Modal.Content>
          <div className="lingvo-segment-modal">
            {this.context("URL with results of saving data should appear soon after clicking save button in the tasks")}
            .
          </div>
          <div style={{ marginBottom: "25px" }}>
            <Checkbox
              style={{ margin: "0.5em 2em 0.5em 0.5em" }}
              label={this.context("Save sound recordings")}
              checked={this.state.save_sound}
              onChange={(e, { checked }) => this.setState({ save_sound: checked })}
              className="lingvo-checkbox"
            />
            <Checkbox
              style={{ margin: "0.5em 0 0.5em 0.5em" }}
              label={this.context("Save markup")}
              checked={this.state.save_markup}
              onChange={(e, { checked }) => this.setState({ save_markup: checked })}
              className="lingvo-checkbox"
            />
          </div>
          <div style={{ margin: "0 0 0.5em 0.5em" }} key="xlsx">
            <Checkbox
              radio
              label={this.context("Excel file")}
              value="xlsx"
              checked={this.state.f_type === 'xlsx'}
              onChange={(e, { value }) => this.setState({ f_type: value })}
            />
          </div>
          <div style={{ margin: "0 0 0.5em 0.5em" }} key="docx">
            <Checkbox
              radio
              label={this.context("Word file")}
              value="docx"
              checked={this.state.f_type === 'docx'}
              onChange={(e, { value }) => this.setState({ f_type: value })}
            />
          </div>
          <div style={{ margin: "0 0 0.5em 0.5em" }} key="rtf">
            <Checkbox
              radio
              label={this.context("RichText file")}
              value="rtf"
              checked={this.state.f_type === 'rtf'}
              onChange={(e, { value }) => this.setState({ f_type: value })}
            />
          </div>
        </Modal.Content>

        <Modal.Actions>
          <Button
            content={this.context("Save all")}
            value="all"
            onClick={this.onSaveData}
            className="lingvo-button-violet"
          />
          <Button
            content={this.context("Save only published")}
            value="published"
            onClick={this.onSaveData}
            className="lingvo-button-violet"
          />
          <Button
            content={this.context("Close")}
            onClick={actions.closeSaveDictionaryModal}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

Properties.contextType = TranslationContext;

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  data: PropTypes.object.isRequired,
  save: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    closeSaveDictionaryModal: PropTypes.func.isRequired
  }).isRequired
};

export default compose(
  connect(
    state => state.saveDictionary,
    dispatch => ({ actions: bindActionCreators({ closeSaveDictionaryModal }, dispatch) })
  ),
  branch(({ id }) => !id, renderNothing),
  graphql(query),
  graphql(saveDictionaryMutation, { name: "save" }),
  branch(({ data: { loading, error } }) => loading || !!error, renderNothing),
  onlyUpdateForKeys(["id", "data"])
)(Properties);
