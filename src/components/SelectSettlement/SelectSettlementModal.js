import React from "react";
import { Button, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";

import TranslationContext from "Layout/TranslationContext";

class SelectSettlementModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {};
  }

  handleOpen = () => this.setState({ modalOpen: true });
  handleClose = () => this.setState({ modalOpen: false });

  render() {
    const { content: SelectSettlementMap, callback } = this.props;

    return (
      <Modal
        size="large"
        open={this.state.modalOpen}
        trigger={
          <Button type="button" onClick={this.handleOpen}>
            {this.context("Open map")}
          </Button>
        }
      >
        <Modal.Header>{this.context("Select settlement")}</Modal.Header>
        <Modal.Content>
          <SelectSettlementMap closeModal={this.handleClose} callback={callback} />
        </Modal.Content>
      </Modal>
    );
  }
}

SelectSettlementModal.contextType = TranslationContext;

SelectSettlementModal.propTypes = {
  content: PropTypes.func,
  callback: PropTypes.func.isRequired
};

export default SelectSettlementModal;
