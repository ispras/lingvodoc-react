import React from 'react';
import { Button, Form, Segment, Label } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { getTranslation } from 'api/i18n';

const getMetadataAlternativesQuery = gql`
  query getMetadataAlternatives {
    select_tags_metadata
  }
`;

class EditDictionaryMetadata extends React.Component {
  constructor(props) {
    super(props);

    this.state = props.metadata || {
      kind: null,
      authors: [],
      humanSettlement: [],
      years: [],
      interrogator: '',
      informant: '',
      processing: '',
      typeOfDiscourse: '',
      typeOfSpeech: '',
      speechGenre: '',
      theThemeOfTheText: ''
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
      theThemeOfTheText: this.state.theThemeOfTheText
    };

    this.onAddNewAlternative = this.onAddNewAlternative.bind(this);
    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSaveValue = this.onSaveValue.bind(this);
  }

  initDropdownOptions() {
    const { select_tags_metadata } = this.props.data;

    let toAdd = this.state.authors.slice();
    this.authorsOptions = select_tags_metadata.authors.map((author) => {
      const index = toAdd.indexOf(author);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: author,
        value: author
      };
    });
    toAdd.forEach((author) => {
      this.authorsOptions.push({ text: author, value: author });
    });

    toAdd = this.state.humanSettlement.slice();
    this.settlementsOptions = select_tags_metadata.humanSettlement.map((settlement) => {
      const index = toAdd.indexOf(settlement);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: settlement,
        value: settlement
      };
    });
    toAdd.forEach((settlement) => {
      this.settlementsOptions.push({ text: settlement, value: settlement });
    });

    toAdd = this.state.years.slice();
    this.yearsOptions = select_tags_metadata.years.map((year) => {
      const index = toAdd.indexOf(year);
      if (index > -1) {
        toAdd.splice(index, 1);
      }

      return {
        text: year,
        value: year
      };
    });
    toAdd.forEach((year) => {
      this.yearsOptions.push({ text: year, value: year });
    });
  }
  /* eslint-disable react/sort-comp */
  // eslint-disable-next-line class-methods-use-this
  onAddNewAlternative(event, data) {
    if (data.options.every(option => option.value !== data.value)) { data.options.push({ text: data.value, value: data.value }); }
  }
  /* eslint-enable react/sort-comp */
  onChangeValue(kind, data) {
    const callback = () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    };
    switch (kind) {
      case 'kind':
        this.setState({ kind: data.label }, callback);
        break;
      case 'authors':
        this.setState({ authors: data.value }, callback);
        break;
      case 'settlements':
        this.setState({ humanSettlement: data.value }, callback);
        break;
      case 'years':
        this.setState({ years: data.value }, callback);
        break;
      case 'interrogator':
        this.setState({ interrogator: data.value }, callback);
        break;
      case 'informant':
        this.setState({ informant: data.value }, callback);
        break;
      case 'processing':
        this.setState({ processing: data.value }, callback);
        break;
      case 'typeOfDiscourse':
        this.setState({ typeOfDiscourse: data.value }, callback);
        break;
      case 'typeOfSpeech':
        this.setState({ typeOfSpeech: data.value }, callback);
        break;
      case 'speechGenre':
        this.setState({ speechGenre: data.value }, callback);
        break;
      case 'theThemeOfTheText':
        this.setState({ theThemeOfTheText: data.value }, callback);
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
      case 'kind':
        toSave = { kind: this.state.kind };
        this.initialState.kind = toSave.kind;
        break;
      case 'authors':
        toSave = { authors: this.state.authors };
        this.initialState.authors = toSave.authors;
        break;
      case 'settlements':
        toSave = { humanSettlement: this.state.humanSettlement };
        this.initialState.humanSettlement = toSave.humanSettlement;
        break;
      case 'speakers':
        toSave = { speakersAmount: this.state.speakersAmount };
        this.initialState.speakersAmount = toSave.speakersAmount;
        break;
      case 'years':
        toSave = { years: this.state.years };
        this.initialState.years = toSave.years;
        break;
      case 'interrogator':
        toSave = { interrogator: this.state.interrogator };
        this.initialState.interrogator = toSave.interrogator;
        break;
      case 'informant':
        toSave = { informant: this.state.informant };
        this.initialState.informant = toSave.informant;
        break;
      case 'processing':
        toSave = { processing: this.state.processing };
        this.initialState.processing = toSave.processing;
        break;
      case 'typeOfDiscourse':
        toSave = { typeOfDiscourse: this.state.typeOfDiscourse };
        this.initialState.typeOfDiscourse = toSave.typeOfDiscourse;
        break;
      case 'typeOfSpeech':
        toSave = { typeOfSpeech: this.state.typeOfSpeech };
        this.initialState.typeOfSpeech = toSave.typeOfSpeech;
        break;
      case 'speechGenre':
        toSave = { speechGenre: this.state.speechGenre };
        this.initialState.speechGenre = toSave.speechGenre;
        break;
      case 'theThemeOfTheText':
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
      interrogator,
      informant,
      processing,
      typeOfDiscourse,
      typeOfSpeech,
      speechGenre,
      theThemeOfTheText
    } = this.state;

    return (
      <Form>
        <Segment>
          <Form.Group widths="equal">
            <Form.Group>
              <Form.Radio label={getTranslation('Expedition')} checked={kind === 'Expedition'} onClick={(event, data) => this.onChangeValue('kind', data)} />
              <Form.Radio label={getTranslation('Archive')} checked={kind === 'Archive'} onClick={(event, data) => this.onChangeValue('kind', data)} />
            </Form.Group>
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={kind === this.initialState.kind}
                onClick={() => this.onSaveValue('kind')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Label size="large">{getTranslation('Authors')}</Label>
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              options={this.authorsOptions}
              value={authors}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('authors', data)}
            />
            {mode !== 'create' &&
              <Button
                positive
                content={getTranslation('Save')}
                disabled={JSON.stringify(authors) === JSON.stringify(this.initialState.authors)}
                onClick={() => this.onSaveValue('authors')}
              />
            }
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              label={getTranslation('Interrogator')}
              options={this.authorsOptions}
              value={interrogator}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('interrogator', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={interrogator === this.initialState.interrogator}
                onClick={() => this.onSaveValue('interrogator')}
              />
            }
            <Form.Input
              fluid
              label={getTranslation('Informant')}
              value={informant}
              onChange={(event, data) => this.onChangeValue('informant', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={informant === this.initialState.informant}
                onClick={() => this.onSaveValue('informant')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Label size="large">{getTranslation('Human settlement')}</Label>
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              options={this.settlementsOptions}
              value={humanSettlement}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('settlements', data)}
            />
            {mode !== 'create' &&
              <Button
                positive
                content={getTranslation('Save')}
                disabled={JSON.stringify(humanSettlement) === JSON.stringify(this.initialState.humanSettlement)}
                onClick={() => this.onSaveValue('settlements')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Label size="large">{getTranslation('Years')}</Label>
            <Form.Dropdown
              fluid
              multiple
              selection
              search
              allowAdditions
              options={this.yearsOptions}
              value={years}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('years', data)}
            />
            {mode !== 'create' &&
              <Button
                positive
                content={getTranslation('Save')}
                disabled={JSON.stringify(years) === JSON.stringify(this.initialState.years)}
                onClick={() => this.onSaveValue('years')}
              />
            }
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
              label={getTranslation('Processing')}
              options={this.authorsOptions}
              value={processing}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('processing', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={processing === this.initialState.processing}
                onClick={() => this.onSaveValue('processing')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation('Type of discourse')}
              value={typeOfDiscourse}
              onChange={(event, data) => this.onChangeValue('typeOfDiscourse', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={typeOfDiscourse === this.initialState.typeOfDiscourse}
                onClick={() => this.onSaveValue('typeOfDiscourse')}
              />
            }
            <Form.Input
              fluid
              label={getTranslation('Type of speech')}
              value={typeOfSpeech}
              onChange={(event, data) => this.onChangeValue('typeOfSpeech', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={typeOfSpeech === this.initialState.typeOfSpeech}
                onClick={() => this.onSaveValue('typeOfSpeech')}
              />
            }
            <Form.Input
              fluid
              label={getTranslation('Speech genre')}
              value={speechGenre}
              onChange={(event, data) => this.onChangeValue('speechGenre', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={speechGenre === this.initialState.speechGenre}
                onClick={() => this.onSaveValue('speechGenre')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths="equal">
            <Form.Input
              fluid
              label={getTranslation('The theme of the text')}
              value={theThemeOfTheText}
              onChange={(event, data) => this.onChangeValue('theThemeOfTheText', data)}
            />
            {mode !== 'create' &&
              <Form.Button
                floated="right"
                positive
                content={getTranslation('Save')}
                disabled={theThemeOfTheText === this.initialState.theThemeOfTheText}
                onClick={() => this.onSaveValue('theThemeOfTheText')}
              />
            }
          </Form.Group>
        </Segment>
      </Form>
    );
  }
}

EditDictionaryMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  metadata: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  loading: PropTypes.bool.isRequired
};

export default graphql(getMetadataAlternativesQuery)(EditDictionaryMetadata);
