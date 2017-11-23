import React from 'react';
import { connect } from 'react-redux';
import { pure } from 'recompose';
import { Map, fromJS } from 'immutable';

import { Button, Step } from 'semantic-ui-react';

import { setBlobs, linkingSelect, updateColumn } from 'ducks/dictImport';

import Linker from './Linker';

const blobs = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));

class Info extends React.Component {
  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.renderStep = this.renderStep.bind(this);
  }

  componentDidMount() {
    this.props.setBlobs(blobs);
  }

  onSelect(payload) {
    this.props.linkingSelect(payload);
  }

  onUpdateColumn(id) {
    return (column, value, oldValue) =>
      this.props.updateColumn(id, column, value, oldValue);
  }

  renderStep() {
    const { state } = this.props;
    const step = state.get('step');

    switch (step) {
      case 'LINKING':
        return (
          <Linker
            blobs={state.get('blobs')}
            state={state.get('linking')}
            spreads={state.get('spreads')}
            onSelect={this.onSelect}
            onUpdateColumn={this.onUpdateColumn}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { state } = this.props;
    const step = state.get('step');

    return (
      <div>
        <Step.Group widths={3}>
          <Step active={step === 'LINKING'}>
            <Step.Content>
              <Step.Title>Linking</Step.Title>
              <Step.Description>Link columns from files with each other</Step.Description>
            </Step.Content>
          </Step>

          <Step active={step === 'COLUMNS'}>
            <Step.Content>
              <Step.Title>Columns Mapping</Step.Title>
              <Step.Description>Map linked columns to LingvoDoc types</Step.Description>
            </Step.Content>
          </Step>

          <Step active={step === 'LANGUAGES'}>
            <Step.Content>
              <Step.Title>Language Selection</Step.Title>
              <Step.Description>Map dictionaries to LingvoDoc languages</Step.Description>
            </Step.Content>
          </Step>
        </Step.Group>

        <div style={{ minHeight: '400px' }}>
          {this.renderStep()}
        </div>

        <Button fluid inverted color="blue">Next Step</Button>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    state: state.dictImport,
  };
}

const mapDispatchToProps = {
  setBlobs,
  linkingSelect,
  updateColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Info);
