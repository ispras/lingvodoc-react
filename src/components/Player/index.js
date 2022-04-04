import React from "react";
import Wavesurfer from "react-wavesurfer";
import { Button, Container, Icon } from "semantic-ui-react";
import PropTypes from "prop-types";
import { onlyUpdateForKeys } from "recompose";

import Spectrogram from "components/Wavesurfer/spectrogram";
import Timeline from "components/Wavesurfer/timeline";

class Player extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      pos: 0,
      zoom: 0
    };
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handlePosChange = this.handlePosChange.bind(this);
    this.handleZoom = this.handleZoom.bind(this);
  }

  handlePlay() {
    this.setState({
      playing: true
    });
  }

  handlePause() {
    this.setState({
      playing: false
    });
  }

  handlePosChange(e) {
    this.setState({
      pos: e.originalArgs[0]
    });
  }

  handleZoom(e) {
    this.setState({
      zoom: Number(e.target.value)
    });
  }

  render() {
    const { file } = this.props;
    const { playing, pos } = this.state;
    const options = {
      waveColor: "#999",
      progressColor: "#555",
      cursorWidth: 1,
      cursorColor: "#333",
      scrollParent: false,
      minPxPerSec: 50,
      fillParent: true,
      height: 128,
      barWidth: 1
    };
    const spectrogramOptions = {
      fftSamples: 128
    };
    const timelineOptions = {};

    return (
      <div>
        <input id="zoom-slider" type="range" min="0" max="200" value={this.state.zoom} onChange={this.handleZoom} />
        <span>{this.state.zoom}%</span>

        <Wavesurfer
          options={options}
          audioFile={file}
          playing={playing}
          pos={pos}
          onPosChange={this.handlePosChange}
          onReady={this.handleReady}
          zoom={this.state.zoom}
        >
          <Timeline options={timelineOptions} />
          <Spectrogram options={spectrogramOptions} />
        </Wavesurfer>

        <Container textAlign="center">
          <Button.Group icon>
            <Button>
              <Icon name="play" onClick={this.handlePlay} />
            </Button>
            <Button>
              <Icon name="pause" onClick={this.handlePause} />
            </Button>
          </Button.Group>
        </Container>
      </div>
    );
  }
}

Player.propTypes = {
  file: PropTypes.string
};

Player.defaultProps = {
  file: ""
};

export default onlyUpdateForKeys(["file"])(Player);
