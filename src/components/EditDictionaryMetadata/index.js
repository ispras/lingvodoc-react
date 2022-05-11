import React, { useContext, useState } from "react";
import { Button, Form, Icon, Message, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

export const getMetadataAlternativesQuery = gql`
  query getMetadataAlternatives {
    select_tags_metadata
  }
`;

const license_name_key_list = getTranslation => [
  [getTranslation("Proprietary license"), "proprietary"],
  ["Creative Commons Attribution 4.0", "cc-by-4.0"],
  ["Creative Commons Attribution-ShareAlike 4.0", "cc-by-sa-4.0"],
  ["Creative Commons Attribution-NonCommercial-ShareAlike 4.0", "cc-by-nc-sa-4.0"]
];

export const license_options = getTranslation =>
  license_name_key_list(getTranslation).map(([name, key]) => ({ text: name, value: key }));

const initial_dictionary_metadata = {
  kind: "Expedition",
  authors: [],
  humanSettlement: [],
  years: [],
  interrogator: [],
  informant: "",
  processing: [],
  typeOfDiscourse: "",
  typeOfSpeech: "",
  speechGenre: "",
  theThemeOfTheText: "",
  license: "proprietary"
};

export function initDropdownOptions(select_tags_metadata, authors, humanSettlement, years) {
  let toAdd = authors.slice();

  const authorsOptions = select_tags_metadata.authors.map(author => {
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
    authorsOptions.push({ text: author, value: author });
  });

  toAdd = humanSettlement.slice();

  const settlementsOptions = select_tags_metadata.humanSettlement.map(settlement => {
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
    settlementsOptions.push({ text: settlement, value: settlement });
  });

  toAdd = years.slice();

  const yearsOptions = select_tags_metadata.years.map(year => {
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
    yearsOptions.push({ text: year, value: year });
  });

  return [authorsOptions, settlementsOptions, yearsOptions];
}

export function onAddNewAlternative(event, data) {
  if (data.options.every(option => option.value !== data.value)) {
    data.options.push({ text: data.value, value: data.value });
  }
}

export const EditKind = ({ kind, mode, onChange, onSave }) => {
  const [lastValue, setLastValue] = useState(kind);
  const [value, setValue] = useState(kind);

  const getTranslation = useContext(TranslationContext);

  return (
    <Form.Group widths="equal">
      <Form.Group>
        <Form.Radio
          key="kind_expedition"
          label={getTranslation("Expedition")}
          checked={value === "Expedition"}
          disabled={!onSave && !onChange}
          onClick={() => {
            setValue("Expedition");
            if (onChange) {
              onChange({ kind: "Expedition" });
            }
          }}
        />
        <Form.Radio
          key="kind_archive"
          label={getTranslation("Archive")}
          checked={value === "Archive"}
          disabled={!onSave && !onChange}
          onClick={() => {
            setValue("Archive");
            if (onChange) {
              onChange({ kind: "Archive" });
            }
          }}
        />
      </Form.Group>
      {mode !== "create" && (
        <Form.Button
          key="kind_save"
          floated="right"
          content={getTranslation("Save")}
          disabled={value === lastValue || !onSave}
          onClick={() => {
            setLastValue(value);
            onSave({ kind: value });
          }}
          className="lingvo-button-violet"
        />
      )}
    </Form.Group>
  );
};

export const EditSelect = ({ metadata_key, label, value: initialValue, valueOptions, mode, onChange, onSave }) => {
  const [lastValue, setLastValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  const getTranslation = useContext(TranslationContext);

  return (
    <>
      <Form.Dropdown
        key={metadata_key}
        label={label}
        fluid
        selection
        search
        options={valueOptions}
        value={value}
        disabled={!onSave && !onChange}
        onChange={(event, data) => {
          setValue(data.value);
          if (onChange) {
            onChange({ [metadata_key]: data.value });
          }
        }}
      />
      {mode !== "create" && (
        <Form.Button
          key={`${metadata_key}_save`}
          floated="right"
          content={getTranslation("Save")}
          disabled={value === lastValue || !onSave}
          onClick={() => {
            setLastValue(value);
            onSave({ [metadata_key]: value });
          }}
          className="lingvo-button-violet"
        />
      )}
    </>
  );
};

export const EditSelectMultiple = ({
  metadata_key,
  label,
  value: initialValue,
  valueOptions,
  mode,
  onChange,
  onSave
}) => {
  const [lastValue, setLastValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  const getTranslation = useContext(TranslationContext);

  return (
    <>
      <Form.Dropdown
        key={metadata_key}
        label={label}
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
            onChange({ [metadata_key]: data.value });
          }
        }}
      />
      {mode !== "create" && (
        <Form.Button
          key={`${metadata_key}_save`}
          floated="right"
          content={getTranslation("Save")}
          disabled={JSON.stringify(value) === JSON.stringify(lastValue) || !onSave}
          onClick={() => {
            setLastValue(value);
            onSave({ [metadata_key]: value });
          }}
          className="lingvo-button-violet"
        />
      )}
    </>
  );
};

export const EditInput = ({ metadata_key, label, value: initialValue, mode, onChange, onSave }) => {
  const [lastValue, setLastValue] = useState(initialValue);
  const [value, setValue] = useState(initialValue);

  const getTranslation = useContext(TranslationContext);

  return (
    <>
      <Form.Input
        key={metadata_key}
        label={label}
        fluid
        value={value != null ? value : ""}
        disabled={!onSave && !onChange}
        onChange={(event, data) => {
          setValue(data.value);
          if (onChange) {
            onChange({ [metadata_key]: data.value });
          }
        }}
      />
      {mode !== "create" && (
        <Form.Button
          key={`${metadata_key}_save`}
          floated="right"
          content={getTranslation("Save")}
          disabled={value === lastValue || !onSave}
          onClick={() => {
            setLastValue(value);
            onSave({ [metadata_key]: value });
          }}
          className="lingvo-button-violet"
        />
      )}
    </>
  );
};

class EditDictionaryMetadata extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { loading, error } = this.props.data;

    if (loading) {
      return (
        <Segment>
          {this.context("Loading metadata")}... <Icon loading name="spinner" />
        </Segment>
      );
    } else if (error) {
      return <Message negative>{this.context("Metadata loading error, please contact adiministrators.")}</Message>;
    }

    const { metadata: rawMetadata } = this.props;

    const metadata = rawMetadata ? { ...initial_dictionary_metadata, ...rawMetadata } : initial_dictionary_metadata;

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
      interrogator,
      informant,
      processing,
      typeOfDiscourse,
      typeOfSpeech,
      speechGenre,
      theThemeOfTheText,
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
              label={this.context("Authors")}
              value={authors}
              valueOptions={this.authorsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
            <EditSelectMultiple
              key="interrogator"
              metadata_key="interrogator"
              label={this.context("Interrogator")}
              value={interrogator}
              valueOptions={this.authorsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
            <EditInput
              key="informant"
              metadata_key="informant"
              label={this.context("Informant")}
              value={informant}
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
                label={this.context("License")}
                value={license}
                valueOptions={license_options(this.context)}
                mode={mode}
                onChange={onChange}
                onSave={onSave}
              />
            </Form.Group>
          </Segment>
        )}

        <Segment>
          <Form.Group widths="equal">
            <EditSelectMultiple
              key="humanSettlement"
              metadata_key="humanSettlement"
              label={this.context("Human settlement")}
              value={humanSettlement}
              valueOptions={this.settlementsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditSelectMultiple
              key="years"
              metadata_key="years"
              label={this.context("Years")}
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
            <EditSelectMultiple
              key="processing"
              metadata_key="processing"
              label={this.context("Processing")}
              value={processing}
              valueOptions={this.authorsOptions}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="typeOfDiscourse"
              metadata_key="typeOfDiscourse"
              label={this.context("Type of discourse")}
              value={typeOfDiscourse}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
            <EditInput
              key="typeOfSpeech"
              metadata_key="typeOfSpeech"
              label={this.context("Type of speech")}
              value={typeOfSpeech}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
            <EditInput
              key="speechGenre"
              metadata_key="speechGenre"
              label={this.context("Speech genre")}
              value={speechGenre}
              mode={mode}
              onChange={onChange}
              onSave={onSave}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <EditInput
              key="theThemeOfTheText"
              metadata_key="theThemeOfTheText"
              label={this.context("The theme of the text")}
              value={theThemeOfTheText}
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

EditDictionaryMetadata.contextType = TranslationContext;

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
