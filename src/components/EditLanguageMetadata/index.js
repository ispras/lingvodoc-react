import React from 'react';
import { Button, Form, Segment, Label } from 'semantic-ui-react';
import PropTypes from 'prop-types';

const speakersAmountOptions = [
  { text: "Vulnerable", value: "Vulnerable" },
  { text: "Definitely endangered", value: "Definitely endangered" },
  { text: "Critically endangered", value: "Critically endangered" },
  { text: "Extinct", value: "Extinct" },
  { text: "Severely endangered", value: "Severely endangered" },
  { text: "Safe", value: "Safe" }
];

class EditLanguageMetadata extends React.Component {

  constructor(props) {
    super(props);

    this.state = props.metadata || { speakersAmount: '' };

    this.initialState = { speakersAmount: this.state.speakersAmount };

    this.onChangeValue = this.onChangeValue.bind(this);
    this.onSaveValue = this.onSaveValue.bind(this);
  }

  onChangeValue(event, data) {
    this.setState({ speakersAmount: data.value }, () => {
      if (this.props.onChange) {
        this.props.onChange(this.state);
      }
    });
  }

  onSaveValue() {
    this.initialState.speakersAmount = this.state.speakersAmount;
    if (this.props.onSave) {
      this.props.onSave(this.state);
    }
    this.forceUpdate();
  }

  render() {
    const { mode } = this.props;
    const { speakersAmount } = this.state;

    return (
      <Form>
        <h4>Metadata</h4>
        <Segment>
          <Form.Group widths='equal'>
            <Label size='large'>Number of native speakers</Label>
            <Form.Dropdown fluid selection options={speakersAmountOptions} value={speakersAmount} onChange={this.onChangeValue} />
            {mode != 'create' &&
              <Button positive
                content="Save"
                disabled={JSON.stringify(speakersAmount) == JSON.stringify(this.initialState.speakersAmount)}
                onClick={this.onSaveValue}
              />
            }
          </Form.Group>
        </Segment>
      </Form>
    );
  }

}

EditLanguageMetadata.propTypes = {
  mode: PropTypes.string.isRequired,
  metadata: PropTypes.object,
  onChange: PropTypes.func,
  onSave: PropTypes.func
};

export default EditLanguageMetadata;
