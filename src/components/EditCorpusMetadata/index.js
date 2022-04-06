import React from "react";
import { graphql } from "react-apollo";
import { Button, Form, Segment } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import gql from "graphql-tag";
import PropTypes from "prop-types";

import { license_options } from "../EditDictionaryMetadata";
import SelectSettlementMap from "../SelectSettlement/SelectSettlementMap";
import SelectSettlementModal from "../SelectSettlement/SelectSettlementModal";

const getMetadataAlternativesQuery = gql`
  query getMetadataAlternatives {
    select_tags_metadata
  }
`;

class EditCorpusMetadata extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.metadata || {
      kind: "Expedition",
      authors: [],
      humanSettlement: [],
      years: [],
      titleOfTheWork: "",
      genre: "",
      timeOfWriting: "",
      quantitativeCharacteristic: "",
      bibliographicDataOfTheSource: "",
      translator: "",
      bibliographicDataOfTheTranslation: "",
      license: "proprietary"
    };

    this.initialState = {
      kind: this.state.kind,
      authors: this.state.authors,
      humanSettlement: this.state.humanSettlement,
      years: this.state.years,
      titleOfTheWork: this.state.titleOfTheWork,
      genre: this.state.genre,
      timeOfWriting: this.state.timeOfWriting,
      quantitativeCharacteristic: this.state.quantitativeCharacteristic,
      bibliographicDataOfTheSource: this.state.bibliographicDataOfTheSource,
      translator: this.state.translator,
      bibliographicDataOfTheTranslation: this.state.bibliographicDataOfTheTranslation,
      license: this.state.license
    };

    this.onAddNewAlternative = this.onAddNewAlternative.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSaveValue = this.onSaveValue.bind(this);
  }

  initDropdownOptions() {
    const select_tags_metadata = this.props.data.select_tags_metadata;

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

  onAddNewAlternative(event, data) {
    if (data.options.every(option => option.value != data.value)) {
      data.options.push({ text: data.value, value: data.value });
    }
  }

  onChangeValue(kind, data) {
    const callback = () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    };
    switch (kind) {
      case "kind":
        this.setState({ kind: data.label }, callback);
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
      case "titleOfTheWork":
        this.setState({ titleOfTheWork: data.value }, callback);
        break;
      case "genre":
        this.setState({ genre: data.value }, callback);
        break;
      case "timeOfWriting":
        this.setState({ timeOfWriting: data.value }, callback);
        break;
      case "quantitativeCharacteristic":
        this.setState({ quantitativeCharacteristic: data.value }, callback);
        break;
      case "bibliographicDataOfTheSource":
        this.setState({ bibliographicDataOfTheSource: data.value }, callback);
        break;
      case "translator":
        this.setState({ translator: data.value }, callback);
        break;
      case "bibliographicDataOfTheTranslation":
        this.setState({ bibliographicDataOfTheTranslation: data.value }, callback);
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
      case "titleOfTheWork":
        toSave = { titleOfTheWork: this.state.titleOfTheWork };
        this.initialState.titleOfTheWork = toSave.titleOfTheWork;
        break;
      case "genre":
        toSave = { genre: this.state.genre };
        this.initialState.genre = toSave.genre;
        break;
      case "timeOfWriting":
        toSave = { timeOfWriting: this.state.timeOfWriting };
        this.initialState.timeOfWriting = toSave.timeOfWriting;
        break;
      case "quantitativeCharacteristic":
        toSave = { quantitativeCharacteristic: this.state.quantitativeCharacteristic };
        this.initialState.quantitativeCharacteristic = toSave.quantitativeCharacteristic;
        break;
      case "bibliographicDataOfTheSource":
        toSave = { bibliographicDataOfTheSource: this.state.bibliographicDataOfTheSource };
        this.initialState.bibliographicDataOfTheSource = toSave.bibliographicDataOfTheSource;
        break;
      case "translator":
        toSave = { translator: this.state.translator };
        this.initialState.translator = toSave.translator;
        break;
      case "bibliographicDataOfTheTranslation":
        toSave = { bibliographicDataOfTheTranslation: this.state.bibliographicDataOfTheTranslation };
        this.initialState.bibliographicDataOfTheTranslation = toSave.bibliographicDataOfTheTranslation;
        break;
      default:
        return;
    }

    if (toSave) {
      this.props.onSave(toSave);
    }
  }

  settlementSelected(settlement) {
    const callback = () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    };

    const isSettlementAdded = this.settlementsOptions.some(item => item.value === settlement);

    if (!isSettlementAdded) {
      this.settlementsOptions.push({ text: settlement, value: settlement });
      this.setState({ humanSettlement: this.state.humanSettlement.concat([settlement]) }, callback);
    }
  }

  componentWillMount() {
    if (!this.props.loading) {
      this.refetching = true;
      this.props.data.refetch().then(() => {
        this.refetching = false;
        this.initDropdownOptions();
        this.forceUpdate();
      });
    }
  }

  render() {
    const { loading, error } = this.props.data;
    if (loading || error || this.refetching) {
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
      titleOfTheWork,
      genre,
      timeOfWriting,
      quantitativeCharacteristic,
      bibliographicDataOfTheSource,
      translator,
      bibliographicDataOfTheTranslation,
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
                onClick={(event, data) => this.onChangeValue("kind", data)}
              />
              <Form.Radio
                label={getTranslation("Archive")}
                checked={kind === "Archive"}
                onClick={(event, data) => this.onChangeValue("kind", data)}
              />
            </Form.Group>
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={kind == this.initialState.kind}
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
              multiple
              selection
              search
              allowAdditions
              label={getTranslation("Authors")}
              options={this.authorsOptions}
              value={authors}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("authors", data)}
            />
            {mode != "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(authors) == JSON.stringify(this.initialState.authors)}
                onClick={() => this.onSaveValue("authors")}
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
            <SelectSettlementModal content={SelectSettlementMap} callback={this.settlementSelected.bind(this)} />
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              label={getTranslation("Human settlement")}
              options={this.settlementsOptions}
              value={humanSettlement}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("settlements", data)}
            />
            {mode !== "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(humanSettlement) == JSON.stringify(this.initialState.humanSettlement)}
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
              multiple
              selection
              search
              allowAdditions
              label={getTranslation("Years")}
              options={this.yearsOptions}
              value={years}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue("years", data)}
            />
            {mode !== "create" && (
              <Button
                content={getTranslation("Save")}
                disabled={JSON.stringify(years) == JSON.stringify(this.initialState.years)}
                onClick={() => this.onSaveValue("years")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Title of the work")}
              value={titleOfTheWork}
              onChange={(event, data) => this.onChangeValue("titleOfTheWork", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={titleOfTheWork == this.initialState.titleOfTheWork}
                onClick={() => this.onSaveValue("titleOfTheWork")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Genre")}
              value={genre}
              onChange={(event, data) => this.onChangeValue("genre", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={genre == this.initialState.genre}
                onClick={() => this.onSaveValue("genre")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Time of writing")}
              value={timeOfWriting}
              onChange={(event, data) => this.onChangeValue("timeOfWriting", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={timeOfWriting == this.initialState.timeOfWriting}
                onClick={() => this.onSaveValue("timeOfWriting")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Quantitative characteristic")}
              value={quantitativeCharacteristic}
              onChange={(event, data) => this.onChangeValue("quantitativeCharacteristic", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={quantitativeCharacteristic == this.initialState.quantitativeCharacteristic}
                onClick={() => this.onSaveValue("quantitativeCharacteristic")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Bibliographic data of the source")}
              value={bibliographicDataOfTheSource}
              onChange={(event, data) => this.onChangeValue("bibliographicDataOfTheSource", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={bibliographicDataOfTheSource == this.initialState.bibliographicDataOfTheSource}
                onClick={() => this.onSaveValue("bibliographicDataOfTheSource")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Translator")}
              value={translator}
              onChange={(event, data) => this.onChangeValue("translator", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={translator == this.initialState.translator}
                onClick={() => this.onSaveValue("translator")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation("Bibliographic data of the translation")}
              value={bibliographicDataOfTheTranslation}
              onChange={(event, data) => this.onChangeValue("bibliographicDataOfTheTranslation", data)}
            />
            {mode !== "create" && (
              <Form.Button
                floated="right"
                content={getTranslation("Save")}
                disabled={bibliographicDataOfTheTranslation == this.initialState.bibliographicDataOfTheTranslation}
                onClick={() => this.onSaveValue("bibliographicDataOfTheTranslation")}
                className="lingvo-button-violet"
              />
            )}
          </Form.Group>
        </Segment>
      </Form>
    );
  }
}

EditCorpusMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onChange: PropTypes.func,
  onSave: PropTypes.func
};

EditCorpusMetadata.defaultProps = {
  onSave: undefined,
  metadata: {}
};
export default graphql(getMetadataAlternativesQuery)(EditCorpusMetadata);
