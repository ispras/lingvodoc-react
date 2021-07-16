import React from 'react';
import { compose, branch, renderNothing } from 'recompose';
import { Confirm } from 'semantic-ui-react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { closeModal } from 'ducks/confirm';

class ConfirmModal extends React.Component
{
  constructor(props)
  {
    super(props);
    this.handleConfirm = this.handleConfirm.bind(this);
  }

  handleConfirm()
  {
    this.props.callback();
    this.props.closeModal();
  }

  render()
  {
    return (
      <Confirm
        content={this.props.content}
        onCancel={this.props.closeModal}
        onConfirm={this.handleConfirm}
        open={true}
      />
    );
  }
}

export default compose(
  connect(state => state.confirm, dispatch => bindActionCreators({ closeModal }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
)(ConfirmModal);
