import React from 'react';
import { Button, Form, Segment } from 'semantic-ui-react';
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
    const select_tags_metadata = this.props.data.select_tags_metadata;

    let toAdd = this.state.authors.slice();
    this.authorsOptions = select_tags_metadata.authors.map(author => {
      let index = toAdd.indexOf(author);
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
      let index = toAdd.indexOf(settlement);
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
      let index = toAdd.indexOf(year);
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
    if (data.options.every(option => option.value != data.value))
      data.options.push({ text: data.value, value: data.value });
  }

  onChangeValue(kind, data) {
    const callback =() => {
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
        return;
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
        toSave =  { speakersAmount: this.state.speakersAmount };
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
      theThemeOfTheText } = this.state;

    return (
      <Form>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Group>
              <Form.Radio label={getTranslation("Expedition")} checked={kind == 'Expedition'} onClick={(event, data) => this.onChangeValue('kind', data)} />
              <Form.Radio label={getTranslation("Archive")} checked={kind == 'Archive'} onClick={(event, data) => this.onChangeValue('kind', data)} />
            </Form.Group>
            {mode != 'create' &&
              <Form.Button
                floated='right'
                positive
                content={getTranslation("Save")}
                disabled={kind == this.initialState.kind}
                onClick={() => this.onSaveValue('kind')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Dropdown fluid multiple selection search allowAdditions
              label={getTranslation("Authors")}
              options={this.authorsOptions}
              value={authors}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('authors', data)}
            />
            {mode != 'create' &&
              <Button positive
                content={getTranslation("Save")}
                disabled={JSON.stringify(authors) == JSON.stringify(this.initialState.authors)}
                onClick={() => this.onSaveValue('authors')}
              />
            }
            <Form.Input fluid
              label={getTranslation("Interrogator")}
              value={interrogator}
              onChange={(event, data) => this.onChangeValue('interrogator', data)}
            />
            <Form.Input fluid
              label={getTranslation("Informant")}
              value={informant}
              onChange={(event, data) => this.onChangeValue('informant', data)}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Dropdown fluid multiple selection search allowAdditions
              label={getTranslation("Human settlement")}
              options={this.settlementsOptions}
              value={humanSettlement}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('settlements', data)}
            />
            {mode != 'create' &&
              <Button positive
                content={getTranslation("Save")}
                disabled={JSON.stringify(humanSettlement) == JSON.stringify(this.initialState.humanSettlement)}
                onClick={() => this.onSaveValue('settlements')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Dropdown fluid multiple selection search allowAdditions
              label={getTranslation("Years")}
              options={this.yearsOptions}
              value={years}
              onAddItem={this.onAddNewAlternative}
              onChange={(event, data) => this.onChangeValue('years', data)}
            />
            {mode != 'create' &&
              <Button positive
                content={getTranslation("Save")}
                disabled={JSON.stringify(years) == JSON.stringify(this.initialState.years)}
                onClick={() => this.onSaveValue('years')}
              />
            }
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Input fluid
              label={getTranslation("Processing")}
              value={processing}
              onChange={(event, data) => this.onChangeValue('processing', data)}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Input fluid
              label={getTranslation("Type of discourse")}
              value={typeOfDiscourse}
              onChange={(event, data) => this.onChangeValue('typeOfDiscourse', data)}
            />
            <Form.Input fluid
              label={getTranslation("Type of speech")}
              value={typeOfSpeech}
              onChange={(event, data) => this.onChangeValue('typeOfSpeech', data)}
            />
            <Form.Input fluid
              label={getTranslation("Speech genre")}
              value={speechGenre}
              onChange={(event, data) => this.onChangeValue('speechGenre', data)}
            />
          </Form.Group>
        </Segment>
        <Segment>
          <Form.Group widths='equal'>
            <Form.Input fluid
              label={getTranslation("The theme of the text")}
              value={theThemeOfTheText}
              onChange={(event, data) => this.onChangeValue('theThemeOfTheText', data)}
            />
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
  onSave: PropTypes.func
};

export default graphql(getMetadataAlternativesQuery)(EditDictionaryMetadata);
