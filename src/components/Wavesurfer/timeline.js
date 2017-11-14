import React from 'react';
import PropTypes from 'prop-types';

// FIXME:
// Find a better way to import wavesurfer plugins and dependencies
require('wavesurfer.timeline.js');

class Timeline extends React.Component {
  constructor(props) {
    super(props);
    this.timeline = null;
  }

  componentDidMount() {
    if (this.props.isReady) this.init();
    this.props.wavesurfer.on('ready', () => {
      this.timeline = Object.create(WaveSurfer.Timeline);

      this.timeline.init({
        ...this.props.options,
        container: this.timelineElement,
        wavesurfer: this.props.wavesurfer,
      });
    });
  }
  render() {
    return (
      <div
        ref={(c) => {
          this.timelineElement = c;
        }}
      />
    );
  }
}

Timeline.propTypes = {
  isReady: PropTypes.bool,
  options: PropTypes.object,
  wavesurfer: PropTypes.object,
};

Timeline.defaultProps = {};

export default Timeline;
