import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import Wavesurfer from 'react-wavesurfer';

class SimplePlayer extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      playing: false,
      pos: 0,
    };
  }

  handleTogglePlay() {
    this.setState({
      playing: !this.state.playing,
    });
  }
  handlePosChange(e) {
    this.setState({
      pos: e.originalArgs[0],
    });
  }

  render() {
    console.log(this.props);

    const { audioFile } = this.props;

    return (
      <Wavesurfer
        audioFile={audioFile}
        playing={this.state.playing}
        pos={this.state.pos}
        onPosChange={this.handlePosChange}
      />
    );
  }
}

SimplePlayer.propTypes = {
  audioFile: PropTypes.string,
};

SimplePlayer.defaultProps = {
  audioFile: '',
};

const mapStateToProps = state => ({
  audioFile: state.lexicalEntry.audioFile,
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({}, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(SimplePlayer);
