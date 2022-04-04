import React from "react";
import { connect } from "react-redux";
import { Confirm } from "semantic-ui-react";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { closeModal } from "ducks/confirm";

class ConfirmModal extends React.Component {
  constructor(props) {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm() {
    this.props.callback();
    this.props.closeModal();
  }

  render() {
    return (
      <Confirm
        content={this.props.content}
        onCancel={this.props.closeModal}
        onConfirm={this.handleConfirm}
        open={true}
        className="lingvo-confirm"
      />
    );
  }
}

export default compose(
  connect(
    state => state.confirm,
    dispatch => bindActionCreators({ closeModal }, dispatch)
  ),
  branch(({ visible }) => !visible, renderNothing)
)(ConfirmModal);
