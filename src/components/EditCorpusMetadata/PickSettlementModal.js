import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Modal, Button } from 'semantic-ui-react';

class PickSettlementModal extends React.Component {
  constructor ( props ) {
    super( props );
  }

  render () {
    const { trigger, content: PickSettlementMap, callback } = this.props;

    return (
      <Modal trigger = { trigger } size = 'large'>
          <Modal.Header>PickSettlementMap</Modal.Header>
          <Modal.Content>
            <PickSettlementMap callback={ callback }/>
          </Modal.Content>
      </Modal>
    )
  }
};

export default PickSettlementModal;
