import React from 'react';
import PropTypes from 'prop-types';
import Wavesurfer from 'react-wavesurfer';

// FIXME:
// Find a better way to import wavesurfer plugins and dependencies
require('wavesurfer.js');
require('wavesurfer.spectrogram.js');
require('chroma.min.js');


class Spectrogram extends React.Component {
  constructor(props) {
    super(props);
    this.spectrogram = null;
  }

  componentDidMount() {
    if (this.props.isReady) this.init();
    this.props.wavesurfer.on('ready', this._init.bind(this));
  }

  _init() {
    this.spectrogram = Object.create(WaveSurfer.Spectrogram);

    this.spectrogram.init({
      ...this.props.options,
      container: this.spectrogramElement,
      wavesurfer: this.props.wavesurfer,
    });
  }

  render() {
    return (
      <div
        ref={(c) => {
          this.spectrogramElement = c;
        }}
      />
    );
  }
}

Spectrogram.propTypes = {
  isReady: PropTypes.bool,
  options: PropTypes.object,
  wavesurfer: PropTypes.object,
};

Spectrogram.defaultProps = {};

export default Spectrogram;
