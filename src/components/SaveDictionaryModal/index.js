import React from "react";
import { graphql } from "react-apollo";
import { connect } from "react-redux";
import { Button, Checkbox, Modal } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { closeSaveDictionaryModal } from "ducks/saveDictionary";

const query = gql`
  query Dictionary($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      translation
    }
  }
`;

const saveDictionaryMutation = gql`
  mutation SaveDictionary($id: LingvodocID!, $mode: String!, $soundFlag: Boolean, $markupFlag: Boolean) {
    save_dictionary(id: $id, mode: $mode, sound_flag: $soundFlag, markup_flag: $markupFlag) {
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
      save_markup: false
    };

    this.onChangeMode = this.onChangeMode.bind(this);
    this.saveData = this.saveData.bind(this);
    this.onSaveData = this.onSaveData.bind(this);
  }

  componentWillReceiveProps(props) {
    const {
      data: { error, loading, dictionary }
    } = props;
    if (!(loading && error)) {
    }
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
        markupFlag: this.state.save_markup
      }
    }).then(
      () => {
        window.logger.suc(getTranslation("Saving dictionary task is launched. Please check out tasks for details."));
      },
      () => {
        window.logger.err(getTranslation("Failed to launch saving dictionary task."));
      }
    );
  }

  render() {
    const {
      data: { dictionary },
      actions
    } = this.props;

    const { translation } = dictionary;

    return (
      <Modal closeIcon onClose={actions.closeSaveDictionaryModal} open dimmer className="lingvo-modal2">
        <Modal.Header>{`${getTranslation("Save")} '${translation}'?`}</Modal.Header>
        <Modal.Content>
          <div className="lingvo-segment-modal">
            {getTranslation(
              "URL with results of saving data should appear soon after clicking save button in the tasks"
            )}
            .
          </div>
          <div style={{ marginBottom: "25px" }}>
            <Checkbox
              style={{ margin: "0 50px 10px 4px" }}
              label={getTranslation("Save sound recordings")}
              checked={this.state.save_sound}
              onChange={(e, { checked }) => this.setState({ save_sound: checked })}
              className="lingvo-checkbox"
            />
            <Checkbox
              style={{ margin: "0 0 10px 4px" }}
              label={getTranslation("Save markup")}
              checked={this.state.save_markup}
              onChange={(e, { checked }) => this.setState({ save_markup: checked })}
              className="lingvo-checkbox"
            />
          </div>
        </Modal.Content>

        <Modal.Actions>
          <Button
            content={getTranslation("Save all")}
            value="all"
            onClick={this.onSaveData}
            className="lingvo-button-violet"
          />
          <Button
            content={getTranslation("Save only published")}
            value="published"
            onClick={this.onSaveData}
            className="lingvo-button-violet"
          />
          <Button
            content={getTranslation("Close")}
            onClick={actions.closeSaveDictionaryModal}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
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
