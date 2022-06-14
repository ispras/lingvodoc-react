import React from "react";
import { connect } from "react-redux";
import { Button, Dropdown, Header, Icon, List, Radio, Segment, Step } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";

import { chooseTranslation as T } from "api/i18n";
import { license_options } from "components/EditDictionaryMetadata";
import Languages from "components/Languages";
import Translations from "components/Translation";
import {
  goToStep,
  initialize,
  nextStep,
  selectors,
  setDialeqtAction,
  setDialeqtBlobId,
  setLicense,
  setParentLanguage,
  setTranslations,
  setUpdateDictionaryId
} from "ducks/dialeqtImport";
import TranslationContext from "Layout/TranslationContext";

import "pages/DictImport/styles.scss";

export const blobQuery = gql`
  query dialeqt_blobs {
    user_blobs(data_type: "dialeqt_dictionary") {
      id
      data_type
      name
      created_at
    }
  }
`;

export const dictionaryQuery = gql`
  query dictionaries {
    dictionaries {
      id
      tree {
        id
        translations
      }
    }
  }
`;

const convertDialeqtMutation = gql`
  mutation convertDialeqt(
    $blobId: LingvodocID!
    $languageId: LingvodocID
    $dictionaryId: LingvodocID
    $translationAtoms: [ObjectVal]
    $license: String
  ) {
    convert_dialeqt(
      blob_id: $blobId
      language_id: $languageId
      dictionary_id: $dictionaryId
      translation_atoms: $translationAtoms
      license: $license
    ) {
      triumph
    }
  }
`;

class DialeqtImport extends React.Component {
  static propTypes = {
    data: PropTypes.shape({ loading: PropTypes.bool.isRequired }).isRequired,
    step: PropTypes.string.isRequired,
    isNextStep: PropTypes.bool.isRequired,
    nextStep: PropTypes.func.isRequired,
    goToStep: PropTypes.func.isRequired,
    setParentLanguage: PropTypes.func.isRequired,
    setTranslations: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.importCreate = this.importCreate.bind(this);
    this.importUpdate = this.importUpdate.bind(this);

    this.props.initialize();
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  importCreate() {
    const { convert_dialeqt, dialeqt_blob_id, parentLanguage, translations, license } = this.props;

    convert_dialeqt({
      variables: {
        blobId: dialeqt_blob_id,
        languageId: parentLanguage.id,

        translationAtoms: translations.map(translation => ({
          locale_id: translation.get("localeId"),
          content: translation.get("content")
        })),

        license
      }

      /* 
       * No point in refetching, as dictionary creation happens in the background and takes quite some time,
       * refetching wouldn't get info of the dictionary whose creation is not yet finished.
       *
      refetchQueries: [
        { query: dictionaryQuery }],
       */
    }).then(() => this.props.goToStep("FINISH"));
  }

  importUpdate() {
    const { convert_dialeqt, dialeqt_blob_id, update_dictionary_id } = this.props;

    convert_dialeqt({
      variables: {
        blobId: dialeqt_blob_id,
        dictionaryId: update_dictionary_id
      }
    }).then(() => this.props.goToStep("FINISH"));
  }

  render() {
    const {
      step,
      isNextStep,
      dialeqt_blob_id,
      dialeqt_action,
      parentLanguage,
      translations,
      update_dictionary_id,
      license,
      data,
      dictionaryData
    } = this.props;

    if (data.loading || data.error || dictionaryData.error) {
      return null;
    }

    const blobSelection = dialeqt_blob_id ? dialeqt_blob_id.join("/") : null;

    const blobOptions = data.user_blobs.map(blob => ({
      key: blob.id.join("/"),
      value: blob.id.join("/"),
      text: blob.name
    }));

    const dictionarySelection = update_dictionary_id ? update_dictionary_id.join("/") : null;

    let dictionaryOptions = [];

    if (!dictionaryData.loading) {
      dictionaryOptions = dictionaryData.dictionaries.map(dictionary => ({
        key: dictionary.id.join("/"),
        value: dictionary.id.join("/"),

        text: dictionary.tree
          .map(value =>
            value.hasOwnProperty("status_translations")
              ? `${T(value.translations)} (${T(value.status_translations)})`
              : T(value.translations)
          )
          .reverse()
          .join(" \u203a ")
      }));

      dictionaryOptions.sort((a, b) => {
        if (a.text < b.text) {
          return -1;
        } else if (a.text > b.text) {
          return 1;
        } else {
          return 0;
        }
      });
    }

    return (
      <div className="background-content">
        <Step.Group widths={4}>
          <Step link active={step === "CHOICE"} onClick={this.onStepClick("CHOICE")}>
            <Step.Content>
              <Step.Title>{this.context("File selection")}</Step.Title>
              <Step.Description>{this.context("Select Dialeqt file for import")}</Step.Description>
            </Step.Content>
          </Step>

          {dialeqt_action === "create" && (
            <Step link active={step === "PARENT_LANGUAGE"} onClick={this.onStepClick("PARENT_LANGUAGE")}>
              <Step.Content>
                <Step.Title>{this.context("Parent language")}</Step.Title>
                <Step.Description>{this.context("Select language for the new dictionary")}</Step.Description>
              </Step.Content>
            </Step>
          )}

          {dialeqt_action === "create" && (
            <Step link active={step === "TRANSLATIONS"} onClick={this.onStepClick("TRANSLATIONS")}>
              <Step.Content>
                <Step.Title>{this.context("Dictionary names")}</Step.Title>
                <Step.Description>{this.context("Set dictionary name and translations")}</Step.Description>
              </Step.Content>
            </Step>
          )}

          {dialeqt_action === "update" && (
            <Step link active={step === "UPDATE_DICTIONARY"} onClick={this.onStepClick("UPDATE_DICTIONARY")}>
              <Step.Content>
                <Step.Title>{this.context("Update dictionary")}</Step.Title>
                <Step.Description>{this.context("Select dictionary to be updated")}</Step.Description>
              </Step.Content>
            </Step>
          )}

          <Step link active={step === "FINISH"}>
            <Step.Content>
              <Step.Title>{this.context("Finish")}</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ height: "550px" }}>
          {step === "CHOICE" && (
            <div>
              <Dropdown
                className="main-select"
                search
                selection
                placeholder={this.context("Dialeqt file")}
                options={blobOptions}
                value={blobSelection}
                onChange={(event, data) => this.props.setDialeqtBlobId(data.value.split("/").map(x => parseInt(x, 10)))}
              />
              <List>
                <List.Item>
                  <Radio
                    style={{
                      backgroundColor: "white",
                      borderRadius: "0.25em",
                      padding: "0.5em"
                    }}
                    label={this.context("Create dictionary")}
                    name="dictionaryGroup"
                    value="create"
                    checked={dialeqt_action === "create"}
                    onChange={() => this.props.setDialeqtAction("create")}
                  />
                </List.Item>
                <List.Item>
                  <Radio
                    style={{
                      backgroundColor: "white",
                      borderRadius: "0.25em",
                      padding: "0.5em"
                    }}
                    label={this.context("Update dictionary")}
                    name="dictionaryGroup"
                    value="update"
                    checked={dialeqt_action === "update"}
                    onChange={() => this.props.setDialeqtAction("update")}
                  />
                </List.Item>
              </List>
            </div>
          )}

          {step === "PARENT_LANGUAGE" && (
            <div className="inverted" style={{ height: "450px" }}>
              <Header>
                <span
                  style={{
                    backgroundColor: "white",
                    borderRadius: "0.25em",
                    padding: "0.5em"
                  }}
                >
                  {parentLanguage ? (
                    <span>
                      {this.context("You have selected:")} <b>{T(parentLanguage.translations)}</b>
                    </span>
                  ) : (
                    this.context("Please, select the parent language")
                  )}
                </span>
              </Header>
              <Languages expanded={false} selected={parentLanguage} onSelect={this.props.setParentLanguage} />
            </div>
          )}

          {step === "TRANSLATIONS" && (
            <div>
              <Header inverted>{this.context("Add one or more translations")}</Header>
              <Segment>
                <Translations translations={translations.toJS()} onChange={t => this.props.setTranslations(t)} />
              </Segment>

              <Header inverted>{this.context("Select a license")}</Header>
              <Segment>
                <Dropdown
                  fluid
                  label={this.context("License")}
                  selection
                  search
                  options={license_options(this.context)}
                  defaultValue={license}
                  onChange={(event, data) => this.props.setLicense(data.value)}
                />
              </Segment>
            </div>
          )}

          {step === "UPDATE_DICTIONARY" &&
            (dictionaryData.loading ? (
              <span
                style={{
                  backgroundColor: "white",
                  borderRadius: "0.25em",
                  padding: "0.5em"
                }}
              >
                Loading dictionary data... <Icon loading name="spinner" />
              </span>
            ) : (
              <Dropdown
                fluid
                className="main-select"
                search
                selection
                placeholder={this.context("Update dictionary")}
                options={dictionaryOptions}
                value={dictionarySelection}
                onChange={(_event, d) => this.props.setUpdateDictionaryId(d.value.split("/").map(x => parseInt(x, 10)))}
              />
            ))}
        </div>

        {isNextStep && step === "TRANSLATIONS" && (
          <Button fluid className="lingvo-button-lite-violet" onClick={this.importCreate}>
            {this.context("Create dictionary")}
          </Button>
        )}

        {isNextStep && step === "UPDATE_DICTIONARY" && (
          <Button fluid className="lingvo-button-lite-violet" onClick={this.importUpdate}>
            {this.context("Update dictionary")}
          </Button>
        )}

        {isNextStep && step !== "TRANSLATIONS" && step !== "UPDATE_DICTIONARY" && (
          <Button fluid className="lingvo-button-lite-violet" onClick={this.onNextClick}>
            {this.context("Next Step")}
          </Button>
        )}
      </div>
    );
  }
}

DialeqtImport.contextType = TranslationContext;

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state),
    dialeqt_blob_id: selectors.getDialeqtBlobId(state),
    dialeqt_action: selectors.getDialeqtAction(state),
    parentLanguage: selectors.getParentLanguage(state),
    translations: selectors.getTranslations(state),
    update_dictionary_id: selectors.getUpdateDictionaryId(state),
    license: selectors.getLicense(state)
  };
}

const mapDispatchToProps = {
  initialize,
  nextStep,
  goToStep,
  setDialeqtBlobId,
  setDialeqtAction,
  setParentLanguage,
  setTranslations,
  setUpdateDictionaryId,
  setLicense
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(blobQuery),
  graphql(dictionaryQuery, { name: "dictionaryData" }),
  graphql(convertDialeqtMutation, { name: "convert_dialeqt" })
)(DialeqtImport);
