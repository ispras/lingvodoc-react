import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Modal, Button } from 'semantic-ui-react';

class SelectSettlementModal extends React.Component {
  constructor ( props ) {
    super( props );

    this.state = {};
  }

  handleOpen = () => this.setState({ modalOpen: true });
  handleClose = () => this.setState({ modalOpen: false });

  render () {
    const { content: SelectSettlementMap, callback } = this.props;

    return (
      <Modal
        size = 'large'
        open={ this.state.modalOpen }
        trigger = { <Button type="button" onClick={ this.handleOpen }>{ getTranslation( 'Open map' ) }</Button> }
      >
        <Modal.Header>{ getTranslation( 'Select settlement' ) }</Modal.Header>
        <Modal.Content>
          <SelectSettlementMap closeModal={ this.handleClose } callback={ callback }/>
        </Modal.Content>
      </Modal>
    )
  }
};

SelectSettlementModal.propTypes = {
  content: PropTypes.func,
  callback: PropTypes.func.isRequired
};

export default SelectSettlementModal;
