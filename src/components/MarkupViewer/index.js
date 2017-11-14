import React from 'react';
import PropTypes from 'prop-types';
import { Container, Button, Icon } from 'semantic-ui-react';
import styled from 'styled-components';
import Wavesurfer from 'react-wavesurfer';
import Timeline from 'components/Wavesurfer/timeline';
import Spectrogram from 'components/Wavesurfer/spectrogram';
import ELAN from 'components/Wavesurfer/elan';

const Wrapper = styled('div')`
  padding-left: 80px;
`;

class MarkupViewer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: true,
      pos: 0,
    };
    this.handlePlay = this.handlePlay.bind(this);
    this.handlePause = this.handlePause.bind(this);
    this.handlePosChange = this.handlePosChange.bind(this);
  }

  handlePlay() {
    this.setState({
      playing: true,
    });
  }

  handlePause() {
    this.setState({
      playing: false,
    });
  }

  handlePosChange(e) {
    this.setState({
      pos: e.originalArgs[0],
    });
  }

  render() {
    const { file, markup } = this.props;
    const { playing, pos } = this.state;
    const options = {
      waveColor: '#999',
      progressColor: '#555',
      cursorWidth: 1,
      cursorColor: '#333',
      scrollParent: false,
      minPxPerSec: 50,
      fillParent: true,
      height: 128,
      barWidth: 1,
    };
    const spectrogramOptions = {
      fftSamples: 128,
    };

    const elanOptions = {};
    const timelineOptions = {};

    return (
      <Wrapper>
        <Wavesurfer
          options={options}
          audioFile={file}
          playing={playing}
          pos={pos}
          onPosChange={this.handlePosChange}
          onReady={this.handleReady}
        >
          <Timeline options={timelineOptions} />
          <Spectrogram options={spectrogramOptions} />
          <ELAN markup={markup} options={elanOptions} />

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
      </Wrapper>
    );
  }
}

MarkupViewer.propTypes = {
  file: PropTypes.string,
  markup: PropTypes.string,
};

MarkupViewer.defaultProps = {
  file: '',
  markup: '',
};

export default MarkupViewer;
