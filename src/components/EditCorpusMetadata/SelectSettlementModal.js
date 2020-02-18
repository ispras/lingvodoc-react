import React from 'react';
import PropTypes from 'prop-types';
import { getTranslation } from 'api/i18n';
import { Modal, Button } from 'semantic-ui-react';

class SelectSettlementModal extends React.Component {
  constructor ( props ) {
    super( props );
  }

  render () {
    const { trigger, content: SelectSettlementMap, callback } = this.props;

    return (
      <Modal trigger = { trigger } size = 'large'>
          <Modal.Header>SelectSettlementMap</Modal.Header>
          <Modal.Content>
            <SelectSettlementMap callback={ callback }/>
          </Modal.Content>
      </Modal>
    )
  }
};

export default SelectSettlementModal;
