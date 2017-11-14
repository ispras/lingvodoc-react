import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';
import { openPlayer, closePlayer } from 'ducks/player';
import Player from 'components/Player';

const PlayerModal = ({ visible, actions, play: { content } }) => (
  <Modal open={visible} dimmer size="small">
    <Modal.Content>
      <Player file={content} />
    </Modal.Content>
    <Modal.Actions>
      <Button icon="minus" content="Close" onClick={actions.closePlayer} />
    </Modal.Actions>
  </Modal>
);

PlayerModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  play: PropTypes.object.isRequired,
  actions: PropTypes.object.isRequired,
};

const mapStateToProps = state => state.player;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openPlayer, closePlayer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(PlayerModal);
