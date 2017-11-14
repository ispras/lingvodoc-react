import React from 'react';
import PropTypes from 'prop-types';

// FIXME:
// Find a better way to import wavesurfer plugins and dependencies
require('wavesurfer.myelan.js');

class ELAN extends React.Component {
  constructor(props) {
    super(props);
    this.elan = null;
  }

  componentDidMount() {
    if (this.props.isReady) this.init();
    this.props.wavesurfer.on('ready', () => {
      this.elan = Object.create(WaveSurfer.ELAN);
      this.elan.init({
        ...this.props.options,
        container: this.elanElement,
        wavesurfer: this.props.wavesurfer,
        xml: this.props.markup,
      });
    });
  }

  render() {
    return (
      <div
        ref={(c) => {
          this.elanElement = c;
        }}
      />
    );
  }
}

ELAN.propTypes = {
  isReady: PropTypes.bool,
  options: PropTypes.object,
  wavesurfer: PropTypes.object,
  markup: PropTypes.string,
};

ELAN.defaultProps = {};

export default ELAN;
