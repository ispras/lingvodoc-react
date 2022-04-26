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
  toggleAddColumn,
  updateColumn
} from "ducks/dictImport";
import TranslationContext from "Layout/TranslationContext";

import { buildExport } from "./api";
import ColumnMapper from "./ColumnMapper";
import LanguageSelection from "./LanguageSelection";
import Linker from "./Linker";

import "./styles.scss";

export const fieldsQuery = gql`
  query field {
    all_fields {
      id
      translations
      data_type
      data_type_translation_gist_id
    }
    user_blobs(data_type: "starling/csv") {
      id
      data_type
      name
      created_at
      additional_metadata {
        starling_fields
      }
    }
  }
`;

const convertMutation = gql`
  mutation convertMutation($starling_dictionaries: [StarlingDictionary]!) {
    convert_starling(starling_dictionaries: $starling_dictionaries) {
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
    spreads: PropTypes.any.isRequired,
    columnTypes: PropTypes.any.isRequired,
    languages: PropTypes.any.isRequired,
    locales: PropTypes.array.isRequired,
    setBlobs: PropTypes.func.isRequired,
    nextStep: PropTypes.func.isRequired,
    goToStep: PropTypes.func.isRequired,
    linkingAdd: PropTypes.func.isRequired,
    linkingDelete: PropTypes.func.isRequired,
    updateColumn: PropTypes.func.isRequired,
    toggleAddColumn: PropTypes.func.isRequired,
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
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.onToggleColumn = this.onToggleColumn.bind(this);
    this.onSetColumnType = this.onSetColumnType.bind(this);
    this.onSetLanguage = this.onSetLanguage.bind(this);
    this.onSetLicense = this.onSetLicense.bind(this);
    this.onSetTranslation = this.onSetTranslation.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentWillReceiveProps(props) {
    const {
      data: { loading, error, user_blobs: blobs }
    } = props;
    if (!loading && !error) {
      const newBlobs = fromJS(blobs.filter(b => b.data_type === "starling/csv")).map(v => v.set("values", new Map()));
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

  onUpdateColumn(id) {
    return (column, value, oldValue) => this.props.updateColumn(id, column, value, oldValue);
  }

  onToggleColumn(id) {
    return () => this.props.toggleAddColumn(id);
  }

  onSetColumnType(id) {
    return column => field => this.props.setColumnType(id, column, field);
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
    const params = buildExport(this.props);
    convert({
      variables: { starling_dictionaries: params }
    }).then(() => this.props.goToStep("FINISH"));
  }

  render() {
    const { step, isNextStep, blobs, linking, spreads, columnTypes, languages, licenses, locales, data } = this.props;

    if (data.loading || data.error) {
      return null;
    }

    const { all_fields: fields } = data;
    const fieldTypes = fromJS(fields).filter(field => field.get("data_type") === "Text");

    return (
      <div className="background-content">
        <Step.Group widths={4}>
          <Step link active={step === "LINKING"} onClick={this.onStepClick("LINKING")}>
            <Step.Content>
              <Step.Title>{this.context("Linking")}</Step.Title>
              <Step.Description>{this.context("Link columns from files with each other")}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === "COLUMNS"} onClick={this.onStepClick("COLUMNS")}>
            <Step.Content>
              <Step.Title>{this.context("Columns Mapping")}</Step.Title>
              <Step.Description>{this.context("Map linked columns to LingvoDoc types")}</Step.Description>
            </Step.Content>
          </Step>

          <Step link active={step === "LANGUAGES"} onClick={this.onStepClick("LANGUAGES")}>
            <Step.Content>
              <Step.Title>{this.context("Language Selection")}</Step.Title>
              <Step.Description>{this.context("Map dictionaries to LingvoDoc languages")}</Step.Description>
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
              spreads={spreads}
              onSelect={this.onSelect}
              onDelete={this.onDelete}
              onUpdateColumn={this.onUpdateColumn}
              onToggleColumn={this.onToggleColumn}
            />
          )}
          {step === "COLUMNS" && (
            <ColumnMapper
              state={linking}
              spreads={spreads}
              columnTypes={columnTypes}
              types={fieldTypes}
              onSetColumnType={this.onSetColumnType}
            />
          )}
          {step === "LANGUAGES" && (
            <LanguageSelection
              state={linking}
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
                  "Your dictionaries are scheduled for conversion. Please, check tasks tab for conversion status."
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
                {this.context("Please select parent language for each Starling dictionary.")}
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
            <Message.Content>{this.context("Please use at least one Starling column.")}</Message.Content>
          </Message>
        ) : step === "COLUMNS" ? (
          <Message style={{ margin: 0, textAlign: "center" }}>
            <Message.Content>{this.context("Please map all Starling columns to Lingvodoc types.")}</Message.Content>
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
    isNextStep: selectors.getNextStep(state),
    blobs: selectors.getBlobs(state),
    linking: selectors.getLinking(state),
    spreads: selectors.getSpreads(state),
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
  toggleAddColumn,
  setColumnType,
  setLanguage,
  setTranslation,
  setLicense
};

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(fieldsQuery, { options: { fetchPolicy: "network-only" } }),
  graphql(convertMutation, { name: "convert" })
)(Info);
