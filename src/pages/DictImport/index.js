import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Map, fromJS } from 'immutable';

import { Button, Step } from 'semantic-ui-react';

import { setBlobs, linkingSelect, updateColumn, selectors } from 'ducks/dictImport';

import Linker from './Linker';

const BLOBS = fromJS(require('./blobs.json')).map(v => v.set('values', new Map()));

class Info extends React.Component {
  static propTypes = {
    step: PropTypes.string.isRequired,
    blobs: PropTypes.any.isRequired,
    linking: PropTypes.any.isRequired,
    spreads: PropTypes.any.isRequired,
    setBlobs: PropTypes.func.isRequired,
    linkingSelect: PropTypes.func.isRequired,
    updateColumn: PropTypes.func.isRequired,
  }

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onUpdateColumn = this.onUpdateColumn.bind(this);
    this.renderStep = this.renderStep.bind(this);
  }

  componentDidMount() {
    this.props.setBlobs(BLOBS);
  }

  onSelect(payload) {
    this.props.linkingSelect(payload);
  }

  onUpdateColumn(id) {
    return (column, value, oldValue) =>
      this.props.updateColumn(id, column, value, oldValue);
  }

  renderStep() {
    const {
      step,
      blobs,
      linking,
      spreads,
    } = this.props;

    switch (step) {
      case 'LINKING':
        return (
          <Linker
            blobs={blobs}
            state={linking}
            spreads={spreads}
            onSelect={this.onSelect}
            onUpdateColumn={this.onUpdateColumn}
          />
        );
      default:
        return null;
    }
  }

  render() {
    const { step } = this.props;

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
    step: selectors.getStep(state),
    blobs: selectors.getBlobs(state),
    linking: selectors.getLinking(state),
    spreads: selectors.getSpreads(state),
  };
}

const mapDispatchToProps = {
  setBlobs,
  linkingSelect,
  updateColumn,
};

export default connect(mapStateToProps, mapDispatchToProps)(Info);
