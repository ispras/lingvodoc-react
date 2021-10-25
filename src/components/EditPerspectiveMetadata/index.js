import React from 'react';
import { Button, Form, Input, Segment, Label } from 'semantic-ui-react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';

class EditPerspectiveMetadata extends React.Component {

  constructor(props) {
    super(props);

    this.state = props.metadata || {
      transcription_rules: '',
    };

    this.initialState = {
      transcription_rules: this.state.transcription_rules,
    };

    this.onSaveValue = this.onSaveValue.bind(this);
  }

  onSaveValue(kind) {
    if (!this.props.onSave) {
      return;
    }

    let toSave = null;
    switch (kind) {
      case 'transcription_rules':
        toSave = { transcription_rules: this.state.transcription_rules };
        this.initialState.transcription_rules = toSave.transcription_rules;
        this.forceUpdate();
        break;
      default:
        return;
    }

    if (toSave) {
      this.props.onSave(toSave);
    }
  }

  render() {
    return (
      <Input
        labelPosition='left'
        fluid
        type="text"
        action
        value={this.state.transcription_rules || ''}
        onChange={(event, data) => {
          this.setState({ transcription_rules: data.value });
        }}>

        <Label>{getTranslation('Transcription rules')}</Label>

        <input />

        <Button
          content={getTranslation('Save')}
          disabled={
            this.state.transcription_rules == this.initialState.transcription_rules}
          onClick={() => this.onSaveValue('transcription_rules')}
          className="lingvo-button-violet lingvo-button-violet_bradius-right"
        />

      </Input>
    );
  }

}

EditPerspectiveMetadata.propTypes = {
  metadata: PropTypes.object,
  onSave: PropTypes.func
};

export default EditPerspectiveMetadata;
