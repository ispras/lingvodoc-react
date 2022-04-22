import React from "react";
import { Button, Form, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";

import { getTranslation } from "api/i18n";

const getMetadataAlternativesQuery = gql`
  query getMetadataAlternatives {
    select_tags_metadata
  }
`;

const license_name_key_list = [
  [getTranslation("Proprietary license"), "proprietary"],
  ["Creative Commons Attribution 4.0", "cc-by-4.0"],
  ["Creative Commons Attribution-ShareAlike 4.0", "cc-by-sa-4.0"],
  ["Creative Commons Attribution-NonCommercial-ShareAlike 4.0", "cc-by-nc-sa-4.0"]
];

export const license_options = license_name_key_list.map(([name, key]) => ({ text: name, value: key }));

class EditDictionaryMetadata extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.metadata || {
      kind: "Expedition",
      authors: [],
      humanSettlement: [],
      years: [],
      interrogator: "",
      informant: "",
      processing: "",
      typeOfDiscourse: "",
      typeOfSpeech: "",
      speechGenre: "",
      theThemeOfTheText: "",
      license: "proprietary"
    };

    this.initialState = {
      kind: this.state.kind,
      authors: this.state.authors,
      humanSettlement: this.state.humanSettlement,
      years: this.state.years,
      interrogator: this.state.interrogator,
      informant: this.state.informant,
      processing: this.state.processing,
      typeOfDiscourse: this.state.typeOfDiscourse,
      typeOfSpeech: this.state.typeOfSpeech,
      speechGenre: this.state.speechGenre,
      theThemeOfTheText: this.state.theThemeOfTheText,
      license: this.state.license
    };

    this.onAddNewAlternative = this.onAddNewAlternative.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSaveValue = this.onSaveValue.bind(this);
  }

  initDropdownOptions() {
    const { select_tags_metadata } = this.props.data;

    let toAdd = this.state.authors.slice();
    this.authorsOptions = select_tags_metadata.authors.map(author => {
      const index = toAdd.indexOf(author);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: author,
        value: author
      };
    });
    toAdd.forEach(author => {
      this.authorsOptions.push({ text: author, value: author });
    });

    toAdd = this.state.humanSettlement.slice();
    this.settlementsOptions = select_tags_metadata.humanSettlement.map(settlement => {
      const index = toAdd.indexOf(settlement);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: settlement,
        value: settlement
      };
    });
    toAdd.forEach(settlement => {
      this.settlementsOptions.push({ text: settlement, value: settlement });
    });

    toAdd = this.state.years.slice();
    this.yearsOptions = select_tags_metadata.years.map(year => {
      const index = toAdd.indexOf(year);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: year,
        value: year
      };
    });
    toAdd.forEach(year => {
      this.yearsOptions.push({ text: year, value: year });
    });
  }
  /* eslint-disable react/sort-comp */
  // eslint-disable-next-line class-methods-use-this
  onAddNewAlternative(event, data) {
    if (data.options.every(option => option.value !== data.value)) {
      data.options.push({ text: data.value, value: data.value });
    }
  }
  /* eslint-enable react/sort-comp */
  onChangeValue(kind, data) {
    const callback = () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    };
    switch (kind) {
      case "kind":
        this.setState({ kind: data }, callback);
        break;
      case "authors":
        this.setState({ authors: data.value }, callback);
        break;
      case "settlements":
        this.setState({ humanSettlement: data.value }, callback);
        break;
      case "years":
        this.setState({ years: data.value }, callback);
        break;
      case "interrogator":
        this.setState({ interrogator: data.value }, callback);
        break;
      case "informant":
        this.setState({ informant: data.value }, callback);
        break;
      case "processing":
        this.setState({ processing: data.value }, callback);
        break;
      case "typeOfDiscourse":
        this.setState({ typeOfDiscourse: data.value }, callback);
        break;
      case "typeOfSpeech":
        this.setState({ typeOfSpeech: data.value }, callback);
        break;
      case "speechGenre":
        this.setState({ speechGenre: data.value }, callback);
        break;
      case "theThemeOfTheText":
        this.setState({ theThemeOfTheText: data.value }, callback);
        break;
      case "license":
        this.setState({ license: data.value }, callback);
        break;
      default:
    }
  }

  onSaveValue(kind) {
    if (!this.props.onSave) {
      return;
    }

    let toSave = null;
    switch (kind) {
      case "kind":
        toSave = { kind: this.state.kind };
        this.initialState.kind = toSave.kind;
        break;
      case "authors":
        toSave = { authors: this.state.authors };
        this.initialState.authors = toSave.authors;
        break;
      case "settlements":
        toSave = { humanSettlement: this.state.humanSettlement };
        this.initialState.humanSettlement = toSave.humanSettlement;
        break;
      case "speakers":
        toSave = { speakersAmount: this.state.speakersAmount };
        this.initialState.speakersAmount = toSave.speakersAmount;
        break;
      case "years":
        toSave = { years: this.state.years };
        this.initialState.years = toSave.years;
        break;
      case "interrogator":
        toSave = { interrogator: this.state.interrogator };
        this.initialState.interrogator = toSave.interrogator;
        break;
      case "informant":
        toSave = { informant: this.state.informant };
        this.initialState.informant = toSave.informant;
        break;
      case "processing":
        toSave = { processing: this.state.processing };
        this.initialState.processing = toSave.processing;
        break;
      case "typeOfDiscourse":
        toSave = { typeOfDiscourse: this.state.typeOfDiscourse };
        this.initialState.typeOfDiscourse = toSave.typeOfDiscourse;
        break;
      case "typeOfSpeech":
        toSave = { typeOfSpeech: this.state.typeOfSpeech };
        this.initialState.typeOfSpeech = toSave.typeOfSpeech;
        break;
      case "speechGenre":
        toSave = { speechGenre: this.state.speechGenre };
        this.initialState.speechGenre = toSave.speechGenre;
        break;
      case "theThemeOfTheText":
        toSave = { theThemeOfTheText: this.state.theThemeOfTheText };
        this.initialState.theThemeOfTheText = toSave.theThemeOfTheText;
        break;
      default:
        return;
    }

    if (toSave) {
      this.props.onSave(toSave);
    }
  }

  render() {
    const { loading, error } = this.props.data;
    if (loading || error) {
      return null;
    }

    if (!this.authorsOptions) {
      this.initDropdownOptions();
    }

    const { mode } = this.props;
    const {
      kind,
      authors,
      humanSettlement,
      years,
      interrogator,
      informant,
      processing,
      typeOfDiscourse,
      typeOfSpeech,
      speechGenre,
      theThemeOfTheText,
      license
    } = this.state;

    return (
      <Form>
        <Segment>
          <Form.Group widths="equal">
            <Form.Group>
              <Form.Radio
                label={getTranslation("Expedition")}
                checked={kind === "Expedition"}
                onClick={() => this.onChangeValue("kind", "Expedition")}
              />
              <Form.Radio
                label={getTranslation("Archive")}
                checked={kind === "Archive"}
                onClick={() => this.onChangeValue("kind", "Archive")}
              />
            </Form.Group>
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={kind === this.initialState.kind}
                onClick={() => this.onSaveValue("kind")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Dropdown
              fluid
              label={getTranslation("Authors")}
              multiple
              selection
              search
              allowAdditions
              options={this.authorsOptions}
              defaultValue={authors}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("authors", data)}
            />
            {mode !== "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(authors) === JSON.stringify(this.initialState.authors)}
                onClick={() => this.onSaveValue("authors")}
                className="lingvo-button-violet"
              />
            )}
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              label={getTranslation("Interrogator")}
              options={this.authorsOptions}
              defaultValue={interrogator}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("interrogator", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={interrogator === this.initialState.interrogator}
                onClick={() => this.onSaveValue("interrogator")}
                className="lingvo-button-violet"
              />
            )}
            <Form.Input
              fluid
              label={getTranslation("Informant")}
              defaultValue={informant}
              onChange={(event, data) => this.onChangeValue("informant", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={informant === this.initialState.informant}
                onClick={() => this.onSaveValue("informant")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>

        {mode === "create" && (
          <Segment>
            <Form.Group widths="equal">
              <Form.Dropdown
                fluid
                label={getTranslation("License")}
                selection
                search
                options={license_options}
                defaultValue={license}
                onChange={(event, data) => this.onChangeValue("license", data)}
              />
            </Form.Group>
          </Segment>
        )}

        <Segment>
          <Form.Group widths="equal">
            <Form.Dropdown
              fluid
              label={getTranslation("Human settlement")}
              multiple
              selection
              search
              allowAdditions
              options={this.settlementsOptions}
              defaultValue={humanSettlement}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("settlements", data)}
            />
            {mode !== "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(humanSettlement) === JSON.stringify(this.initialState.humanSettlement)}
                onClick={() => this.onSaveValue("settlements")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Dropdown
              fluid
              label={getTranslation("Years")}
              multiple
              selection
              search
              allowAdditions
              options={this.yearsOptions}
              defaultValue={years}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("years", data)}
            />
            {mode !== "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(years) === JSON.stringify(this.initialState.years)}
                onClick={() => this.onSaveValue("years")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              label={getTranslation("Processing")}
              options={this.authorsOptions}
              defaultValue={processing}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("processing", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={processing === this.initialState.processing}
                onClick={() => this.onSaveValue("processing")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Type of discourse")}
              defaultValue={typeOfDiscourse}
              onChange={(event, data) => this.onChangeValue("typeOfDiscourse", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={typeOfDiscourse === this.initialState.typeOfDiscourse}
                onClick={() => this.onSaveValue("typeOfDiscourse")}
                className="lingvo-button-violet"
              />
            )}
            <Form.Input
              fluid
              label={getTranslation("Type of speech")}
              defaultValue={typeOfSpeech}
              onChange={(event, data) => this.onChangeValue("typeOfSpeech", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={typeOfSpeech === this.initialState.typeOfSpeech}
                onClick={() => this.onSaveValue("typeOfSpeech")}
                className="lingvo-button-violet"
              />
            )}
            <Form.Input
              fluid
              label={getTranslation("Speech genre")}
              defaultValue={speechGenre}
              onChange={(event, data) => this.onChangeValue("speechGenre", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={speechGenre === this.initialState.speechGenre}
                onClick={() => this.onSaveValue("speechGenre")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("The theme of the text")}
              defaultValue={theThemeOfTheText}
              onBlur={event => this.onChangeValue("theThemeOfTheText", event.currentTarget)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={theThemeOfTheText === this.initialState.theThemeOfTheText}
                onClick={() => this.onSaveValue("theThemeOfTheText")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
      </Form>
    );
  }
}

EditDictionaryMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onChange: PropTypes.func,
  onSave: PropTypes.func,
  data: PropTypes.object.isRequired,
  loading: PropTypes.bool
};

EditDictionaryMetadata.defaultProps = {
  metadata: {},
  onSave: null,
  loading: false
};

export default graphql(getMetadataAlternativesQuery, { options: { fetchPolicy: "cache-and-network" } })(
  EditDictionaryMetadata
);
