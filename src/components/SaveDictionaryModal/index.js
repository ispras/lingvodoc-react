import React, { useState, useContext } from "react";
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
  mutation SaveDictionary(
    $id: LingvodocID!
    $mode: String!
    $soundFlag: Boolean
    $markupFlag: Boolean
    $fType: String
  ) {
    save_dictionary(id: $id, mode: $mode, sound_flag: $soundFlag, markup_flag: $markupFlag, f_type: $fType) {
      triumph
    }
  }
`;

const Properties = ({ id, data, save, actions }) => {
  const getTranslation = useContext(TranslationContext);

  const [mode, setMode] = useState("all");
  const [saveSound, setSaveSound] = useState(false);
  const [saveMarkup, setSaveMarkup] = useState(false);
  const [fType, setFType] = useState("xlsx");

  const onChangeMode = (e, { value }) => {
    setMode(value);
  };

  const onSaveData = (e, { value }) => {
    saveData(value);
  };

  const saveData = mode => {
    save({
      variables: {
        id,
        mode,
        soundFlag: saveSound,
        markupFlag: saveMarkup,
        fType: fType
      }
    }).then(
      () => {
        window.logger.suc(getTranslation("Saving dictionary task is launched. Please check out tasks for details."));
      },
      () => {
        window.logger.err(getTranslation("Failed to launch saving dictionary task."));
      }
    );
  };

  const { dictionary } = data;
  const { translations } = dictionary;

  return (
    <Modal closeIcon onClose={actions.closeSaveDictionaryModal} open dimmer className="lingvo-modal2">
      <Modal.Header>{`${getTranslation("Save")} '${T(translations)}'?`}</Modal.Header>
      <Modal.Content>
        <div className="lingvo-segment-modal">
          {getTranslation("URL with results of saving data should appear soon after clicking save button in the tasks")}
          .
        </div>
        <div style={{ marginBottom: "25px" }}>
          <Checkbox
            style={{ margin: "0.5em 2em 0.5em 0.5em" }}
            label={getTranslation("Save sound recordings")}
            checked={saveSound}
            onChange={(e, { checked }) => setSaveSound(checked)}
            className="lingvo-checkbox"
          />
          <Checkbox
            style={{ margin: "0.5em 0 0.5em 0.5em" }}
            label={getTranslation("Save markup")}
            checked={saveMarkup}
            onChange={(e, { checked }) => setSaveMarkup(checked)}
            className="lingvo-checkbox"
          />
        </div>
        <div style={{ margin: "0 0 0.5em 0.5em" }} key="xlsx">
          <Checkbox
            radio
            label={getTranslation("Excel file")}
            value="xlsx"
            checked={fType === "xlsx"}
            onChange={(e, { value }) => setFType(value)}
          />
        </div>
        <div style={{ margin: "0 0 0.5em 0.5em" }} key="docx">
          <Checkbox
            radio
            label={getTranslation("Word file")}
            value="docx"
            checked={fType === "docx"}
            onChange={(e, { value }) => setFType(value)}
          />
        </div>
        <div style={{ margin: "0 0 0.5em 0.5em" }} key="rtf">
          <Checkbox
            radio
            label={getTranslation("RichText file")}
            value="rtf"
            checked={fType === "rtf"}
            onChange={(e, { value }) => setFType(value)}
          />
        </div>
      </Modal.Content>

      <Modal.Actions>
        <Button
          content={getTranslation("Save all")}
          value="all"
          onClick={onSaveData}
          className="lingvo-button-violet"
        />
        <Button
          content={getTranslation("Save only published")}
          value="published"
          onClick={onSaveData}
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
};

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
