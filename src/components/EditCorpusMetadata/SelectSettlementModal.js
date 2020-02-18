import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Modal, Button } from 'semantic-ui-react';

class SelectSettlementModal extends React.Component {
  constructor ( props ) {
    super( props );

    this.state = {};
  }

  handleOpen = () => {
    console.log( 'asd' );
    this.setState({ modalOpen: true })
  }

  handleClose = () => this.setState({ modalOpen: false })

  render () {
    const { trigger, content: SelectSettlementMap, callback } = this.props;

    return (
      <Modal trigger = { trigger } size = 'large' open={ this.state.modalOpen }>
          <Modal.Header>SelectSettlementMap</Modal.Header>
          <Modal.Content>
            <SelectSettlementMap closeModal={ this.handleClose } callback={ callback }/>
          </Modal.Content>
      </Modal>
    )
  }
};

export default SelectSettlementModal;
