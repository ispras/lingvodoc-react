import React from "react";
import Wavesurfer from "react-wavesurfer";
import PropTypes from "prop-types";

// FIXME:
// Find a better way to import wavesurfer plugins and dependencies
require("wavesurfer.spectrogram.js");

class Spectrogram extends React.Component {
  constructor(props) {
    super(props);
    this.spectrogram = null;
  }

  componentDidMount() {
    if (this.props.isReady) {this.init();}
    this.props.wavesurfer.on("ready", this._init.bind(this));
  }

  _init() {
    this.spectrogram = Object.create(WaveSurfer.Spectrogram);

    this.spectrogram.init({
      ...this.props.options,
      container: this.spectrogramElement,
      wavesurfer: this.props.wavesurfer
    });
  }

  render() {
    return (
      <div
        ref={c => {
          this.spectrogramElement = c;
        }}
      />
    );
  }
}

Spectrogram.propTypes = {
  isReady: PropTypes.bool,
  options: PropTypes.object,
  wavesurfer: PropTypes.object
};

Spectrogram.defaultProps = {};

export default Spectrogram;
