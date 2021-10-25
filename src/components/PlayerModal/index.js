import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Modal } from 'semantic-ui-react';
import { openPlayer, closePlayer } from 'ducks/player';
import Player from 'components/Player';
import { getTranslation } from 'api/i18n';

const PlayerModal = ({ visible, actions, play: { content } }) => (
  <Modal
    closeIcon
    onClose={actions.closePlayer}
    open={visible}
    dimmer
    size="small"
    className="lingvo-modal2">

    <Modal.Content>
      <Player file={content} />
    </Modal.Content>
    <Modal.Actions>
      <Button content={getTranslation("Close")} onClick={actions.closePlayer} className="lingvo-button-basic-black" />
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
