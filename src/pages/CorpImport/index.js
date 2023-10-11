import React from "react";
import { connect } from "react-redux";
import { Button, Message, Step } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { fromJS, Map } from "immutable";
import PropTypes from "prop-types";
import { compose } from "recompose";

import {
  goToStep,
  linkingAdd,
  linkingDelete,
  nextStep,
  selectors,
  setBlobs,
  setColumnType,
  setLanguage,
  setLicense,
  setTranslation,
  updateColumn
} from "ducks/dictImport";
import TranslationContext from "Layout/TranslationContext";
import LanguageSelection from "pages/DictImport/LanguageSelection";

import { columnsInfo, corpusInfo } from "./api";
import ColumnMapper from "./ColumnMapper";
import Linker from "./Linker";

import "pages/DictImport/styles.scss";

export const fieldsQuery = gql`
  query field {
    all_fields(parallel: true) {
      id
      translations
      data_type
      data_type_translation_gist_id
    }
    user_blobs(data_type: "txt") {
      id
      data_type
      name
      created_at
    }
  }
`;

const convertMutation = gql`
  mutation convertMutation($corpus_inf: CorpusInf!, $columns_inf: [ColumnInf]!) {
    convert_plain_text(corpus_inf: $corpus_inf, columns_inf: $columns_inf) {
      triumph
    }
  }
`;

class Info extends React.Component {
  static propTypes = {
    data: PropTypes.shape({ loading: PropTypes.bool.isRequired }).isRequired,
    step: PropTypes.string.isRequired,
    isNextStep: PropTypes.bool.isRequired,
    blobs: PropTypes.any.isRequired,
    linking: PropTypes.any.isRequired,
    columnTypes: PropTypes.any.isRequired,
    languages: PropTypes.any.isRequired,
    locales: PropTypes.array.isRequired,
    setBlobs: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    goToStep: PropTypes.func.isRequired,
    linkingAdd: PropTypes.func.isRequired,
    linkingDelete: PropTypes.func.isRequired,
    updateColumn: PropTypes.func.isRequired,
    setColumnType: PropTypes.func.isRequired,
    setLanguage: PropTypes.func.isRequired,
    setTranslation: PropTypes.func.isRequired
  };

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onNextClick = this.onNextClick.bind(this);
    this.onStepClick = this.onStepClick.bind(this);
    this.onSetColumnType = this.onSetColumnType.bind(this);
    this.onSetLanguage = this.onSetLanguage.bind(this);
    this.onSetLicense = this.onSetLicense.bind(this);
    this.onSetTranslation = this.onSetTranslation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidUpdate() {
    const {
      data: { loading, error, user_blobs: blobs }
    } = this.props;
    if (!loading && !error) {
      const newBlobs = fromJS(blobs.filter(b => b.data_type === "txt")).map(v => v.set("values", new Map()));
      // XXX: Ugly workaround
      if (JSON.stringify(this.props.blobs) !== JSON.stringify(newBlobs)) {
        this.props.setBlobs(newBlobs);
      }
    }
  }

  onSelect(payload) {
    this.props.linkingAdd(payload);
  }

  onDelete(payload) {
    this.props.linkingDelete(payload);
  }

  onNextClick() {
    this.props.nextStep();
  }

  onStepClick(name) {
    return () => this.props.goToStep(name);
  }

  onSetColumnType(id) {
    return column => (field, name) => {
      this.props.setColumnType(id, column, field);
      this.props.updateColumn(id, column, name, null);
    };
  }

  onSetLanguage(id) {
    return language => this.props.setLanguage(id, language);
  }

  onSetTranslation(id) {
    return (locale, value) => this.props.setTranslation(id, locale, value);
  }

  onSetLicense(id) {
    return license => this.props.setLicense(id, license);
  }

  onSubmit() {
    const { convert } = this.props;
    const corpus_inf = corpusInfo(this.props);
    const columns_inf = columnsInfo(this.props);
    convert({
      variables: { corpus_inf, columns_inf }
    }).then(() => this.props.goToStep("FINISH"));
  }

  render() {
    const { step, isNextStep, blobs, linking, columnTypes, languages, licenses, locales, data } = this.props;

    if (data.loading || data.error) {
      return null;
    }

    const { all_fields: fields } = data;
    const fieldTypes = fromJS(fields).filter(field => field.get("data_type") === "Text");
    let i = 0;
    return (
      <div className="background-content">
        <Step.Group widths={4}>
          <Step link active={step === "LINKING"} onClick={this.onStepClick("LINKING")}>
            <Step.Content>
              <Step.Title>{this.context("Parent Corpora")}</Step.Title>
              <Step.Description>{this.context("Choose parallel corpora")}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === "COLUMNS"} onClick={this.onStepClick("COLUMNS")}>
            <Step.Content>
              <Step.Title>{this.context("Columns Mapping")}</Step.Title>
              <Step.Description>{this.context("Map columns to LingvoDoc types")}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === "LANGUAGES"} onClick={this.onStepClick("LANGUAGES")}>
            <Step.Content>
              <Step.Title>{this.context("Language Selection")}</Step.Title>
              <Step.Description>{this.context("Map dictionary to LingvoDoc language")}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === "FINISH"}>
            <Step.Content>
              <Step.Title>{this.context("Finish")}</Step.Title>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: "400px", background: "white" }}>
          {step === "LINKING" && (
            <Linker
              blobs={blobs}
              state={linking}
              onSelect={this.onSelect}
              onDelete={this.onDelete}
            />
          )}
          {step === "COLUMNS" && (
            <ColumnMapper
              state={linking}
              columnTypes={columnTypes}
              types={fieldTypes}
              onSetColumnType={this.onSetColumnType}
            />
          )}
          {step === "LANGUAGES" && (
            <LanguageSelection
              state={linking.filter(() => !i++)}
              languages={languages}
              licenses={licenses}
              locales={locales}
              onSetLanguage={this.onSetLanguage}
              onSetTranslation={this.onSetTranslation}
              onSetLicense={this.onSetLicense}
            />
          )}
          {step === "FINISH" && (
            <Message>
              <Message.Header>{this.context("Conversion is in progress...")}</Message.Header>
              <Message.Content>
                {this.context(
                  "Your dictionary is scheduled for conversion. Please, check tasks tab for conversion status."
                )}
              </Message.Content>
            </Message>
          )}
        </div>
        {step === "LANGUAGES" ? (
          isNextStep ? (
            <Button
              fluid
              className="lingvo-button-lite-violet lingvo-button-lite-violet_bradius-bottom"
              onClick={this.onSubmit}
            >
              {this.context("Submit")}
            </Button>
          ) : (
            <Message style={{ margin: 0, textAlign: "center" }}>
              <Message.Content>
                {this.context(
                  "Please select parent language and specify at least one translation to name the dictionary. Meet the previous terms."
                )}
              </Message.Content>
            </Message>
          )
        ) : isNextStep ? (
          <Button
            fluid
            className="lingvo-button-lite-violet lingvo-button-lite-violet_bradius-bottom"
            onClick={this.onNextClick}
          >
            {this.context("Next Step")}
          </Button>
        ) : step === "LINKING" ? (
          <Message style={{ margin: 0, textAlign: "center" }}>
            <Message.Content>{this.context("Choose at least two parent corpora.")}</Message.Content>
          </Message>
        ) : step === "COLUMNS" ? (
          <Message style={{ margin: 0, textAlign: "center" }}>
            <Message.Content>{this.context("Please map all the columns to Lingvodoc types. Meet the previous terms.")}</Message.Content>
          </Message>
        ) : null}
      </div>
    );
  }
}

Info.contextType = TranslationContext;

function mapStateToProps(state) {
  return {
    step: selectors.getStep(state),
    isNextStep: selectors.getNextStep(state, true),
    blobs: selectors.getBlobs(state),
    linking: selectors.getLinking(state),
    columnTypes: selectors.getColumnTypes(state),
    languages: selectors.getLanguages(state),
    licenses: selectors.getLicenses(state),
    locales: state.locale.locales
  };
}

const mapDispatchToProps = {
  setBlobs,
  nextStep,
  goToStep,
  linkingAdd,
  linkingDelete,
  updateColumn,
  setColumnType,
  setLanguage,
  setTranslation,
  setLicense
};

Info.propTypes = {
  data: PropTypes.object,
  convert: PropTypes.func.isRequired,
  licenses: PropTypes.object.isRequired,
  setLicense: PropTypes.func.isRequired
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(fieldsQuery, { options: { fetchPolicy: "network-only" } }),
  graphql(convertMutation, { name: "convert" })
)(Info);
