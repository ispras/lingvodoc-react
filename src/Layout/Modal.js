import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Modal } from 'semantic-ui-react';

import * as Actions from 'ducks/modal';

const WrappedModal = ({ size, dimmer, open, body, close }) =>
  <Modal dimmer={dimmer} open={open} onClose={close} size={size}>
    {body && body.header}
    {body && body.content}
    {body && body.actions}
  </Modal>;

WrappedModal.propTypes = {
  size: PropTypes.string.isRequired,
  dimmer: PropTypes.string.isRequired,
  open: PropTypes.bool.isRequired,
  body: PropTypes.any,
  close: PropTypes.func.isRequired,
};

WrappedModal.defaultProps = {
  body: null,
};

export default connect(
  state => state.modal,
  { close: Actions.close }
)(WrappedModal);
