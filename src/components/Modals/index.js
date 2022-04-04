import React from "react";
import { connect } from "react-redux";
import { compose, pure } from "recompose";

import { closeModal } from "ducks/modals";

/**
 * Container for modal dialogs.
 * Clients should pass 'onClose' parameter to the corresponding <Modal> component in order to handle closing of the dialog automatically.
 */
class Modals extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { modals } = this.props;
    let index = 0;
    return (
      <div>
        {modals.map(({ modal: ModalDialog, parameters }) => (
          <ModalDialog key={index++} onClose={() => this.props.dispatch(closeModal())} {...parameters} />
        ))}
      </div>
    );
  }
}

export default compose(
  connect(state => state.modals),
  pure
)(Modals);
