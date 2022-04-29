import React from "react";
import PropTypes from "prop-types";

// FIXME:
// Find a better way to import wavesurfer plugins and dependencies
require("wavesurfer.myelan.js");

class ELAN extends React.Component {
  constructor(props) {
    super(props);
    this.elan = null;
  }

  componentDidMount() {
    if (this.props.isReady) {
      this.init();
    }

    // eslint-disable-next-line no-undef
    this.elan = Object.create(WaveSurfer.ELAN);
    if (this.props.wavesurfer) {
      this.props.wavesurfer.on("ready", () => {
        this.elan.init({
          ...this.props.options,
          container: this.elanElement,
          wavesurfer: this.props.wavesurfer,
          xml: this.props.markup
        });
      });
    } else {
      this.elan.init({
        ...this.props.options,
        container: this.elanElement,
        xml: this.props.markup
      });
    }
  }

  componentDidUpdate(prevProps) {
    if (this.elan && prevProps.zoom !== this.props.zoom) {
      const { zoom } = this.props;
      this.elan.setPxPerSec(zoom);
      if (this.props.wavesurfer) {
        this.props.wavesurfer.zoom(zoom);
        this.elan.drawerSetup();
        this.elan.render();
      }
    }
  }

  render() {
    return (
      <div
        ref={c => {
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
  zoom: PropTypes.number
};

export default ELAN;
