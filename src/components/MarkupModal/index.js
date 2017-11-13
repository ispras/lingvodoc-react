import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { Button, Modal, Header } from 'semantic-ui-react';
import { openViewer, closeViewer } from 'ducks/markup';
import Player from 'components/Player';

const MarkupModal = (props) => {
  const { visible, data, actions } = props;
  const { audio: { content: audio }, markup: { content: markup } } = data;

  return (
    <Modal open={visible} dimmer size="small">
      <Modal.Content>
        <Player file={audio} />

        <Header>{markup}</Header>
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Close" onClick={actions.closeViewer} />
      </Modal.Actions>
    </Modal>
  );
};

MarkupModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  data: PropTypes.shape({
    audio: PropTypes.object.isRequired,
    markup: PropTypes.object.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    openViewer: PropTypes.func.isRequired,
    closeViewer: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => state.markup;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ openViewer, closeViewer }, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(MarkupModal);
