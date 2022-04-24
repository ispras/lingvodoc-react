import React, { useState } from "react";
import { Button, Form, Icon, Message, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";

import { getTranslation } from "api/i18n";

import {
  EditInput,
  EditKind,
  EditSelectMultiple,
  getMetadataAlternativesQuery,
  initDropdownOptions,
  license_options,
  onAddNewAlternative
} from "../EditDictionaryMetadata";
import SelectSettlementMap from "../SelectSettlement/SelectSettlementMap";
import SelectSettlementModal from "../SelectSettlement/SelectSettlementModal";

const initial_corpus_metadata = {
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

const EditSettlement = ({ label, value: initialValue, valueOptions, mode, onChange, onSave }) => {
  const [lastValue, setLastValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  return (
    <Form.Group widths="equal">
      <SelectSettlementModal
        content={SelectSettlementMap}
        callback={settlement => {
          if (!valueOptions.some(item => item.value === settlement)) {
            valueOptions.push({ text: settlement, value: settlement });

            const new_value = value.concat([settlement]);

            setValue(new_value);

            if (onChange) {
              onChange({ humanSettlement: new_value });
            }
          }
        }}
      />

      <Form.Dropdown
        key="humanSettlement"
        label={getTranslation("Human settlement")}
        fluid
        multiple
        selection
        search
        allowAdditions
        options={valueOptions}
        value={value}
        disabled={!onSave && !onChange}
        onAddItem={onAddNewAlternative}
        onChange={(event, data) => {
          setValue(data.value);
          if (onChange) {
            onChange({ humanSettlement: data.value });
          }
        }}
      />

      {mode !== "create" && (
        <Form.Button
          key="humanSettlement_save"
          floated="right"
          content={getTranslation("Save")}
          disabled={JSON.stringify(value) === JSON.stringify(lastValue) || !onSave}
          onClick={() => {
            setLastValue(value);
            onSave({ humanSettlement: value });
          }}
          className="lingvo-button-violet"
        />
      )}
    </Form.Group>
  );
};

class EditCorpusMetadata extends React.Component {
  constructor(props) {
    super(props);
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

  render() {
    const { loading, error } = this.props.data;

    if (loading) {
      return (
        <Segment>
          {getTranslation("Loading metadata")}... <Icon loading name="spinner" />
        </Segment>
      );
    } else if (error) {
      return <Message negative>{getTranslation("Metadata loading error, please contact adiministrators.")}</Message>;
    }

    const { metadata: rawMetadata } = this.props;

    const metadata = rawMetadata ? { ...initial_corpus_metadata, ...rawMetadata } : initial_corpus_metadata;

    if (!this.authorsOptions) {
      const { select_tags_metadata } = this.props.data;
      const { authors, humanSettlement, years } = metadata;

      [this.authorsOptions, this.settlementsOptions, this.yearsOptions] = initDropdownOptions(
        select_tags_metadata,
        authors,
        humanSettlement,
        years
      );
    }

    const { mode, onChange, onSave } = this.props;

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
    } = metadata;

    return (
      <Form>
        <Segment>
          <EditKind kind={kind} mode={mode} onChange={onChange} onSave={onSave} />
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditSelectMultiple
              key="authors"
              metadata_key="authors"
              label={getTranslation("Authors")}
              value={authors}
              valueOptions={this.authorsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>

        {mode === "create" && (
          <Segment>
            <Form.Group widths="equal">
              <EditSelect
                key="license"
                metadata_key="license"
                label={getTranslation("License")}
                value={license}
                valueOptions={license_options}
                mode={mode}
                onChange={onChange}
                onSave={onSave}
              />
            </Form.Group>
          </Segment>
        )}

        <Segment>
          <EditSettlement
            key="humanSettlement"
            value={humanSettlement}
            valueOptions={this.settlementsOptions}
            mode={mode}
            onChange={onChange}
            onSave={onSave}
          />
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditSelectMultiple
              key="years"
              metadata_key="years"
              label={getTranslation("Years")}
              value={years}
              valueOptions={this.yearsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="titleOfTheWork"
              metadata_key="titleOfTheWork"
              label={getTranslation("Title of the work")}
              value={titleOfTheWork}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="genre"
              metadata_key="genre"
              label={getTranslation("Genre")}
              value={genre}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="timeOfWriting"
              metadata_key="timeOfWriting"
              label={getTranslation("Time of writing")}
              value={timeOfWriting}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="quantitativeCharacteristic"
              metadata_key="quantitativeCharacteristic"
              label={getTranslation("Quantitative characteristic")}
              value={quantitativeCharacteristic}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="bibliographicDataOfTheSource"
              metadata_key="bibliographicDataOfTheSource"
              label={getTranslation("Bibliographic data of the source")}
              value={bibliographicDataOfTheSource}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="translator"
              metadata_key="translator"
              label={getTranslation("Translator")}
              value={translator}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="bibliographicDataOfTheTranslation"
              metadata_key="bibliographicDataOfTheTranslation"
              label={getTranslation("Bibliographic data of the translation")}
              value={bibliographicDataOfTheTranslation}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
      </Form>
    );
  }
}

EditCorpusMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  data: PropTypes.object,
  metadata: PropTypes.object,
  onChange: PropTypes.func,
  onSave: PropTypes.func
};

EditCorpusMetadata.defaultProps = {
  onSave: undefined,
  metadata: {}
};
export default graphql(getMetadataAlternativesQuery, { options: { fetchPolicy: "cache-and-network" } })(
  EditCorpusMetadata
);
