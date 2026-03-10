import React, { useContext } from "react";
import { connect } from "react-redux";
import { Confirm } from "semantic-ui-react";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { closeModal } from "ducks/confirm";
import TranslationContext from "Layout/TranslationContext";

const ConfirmModal = ({ callback, closeModal, content, buttonConfirm, buttonCancel }) => {
  const getTranslation = useContext(TranslationContext);

  const handleConfirm = () => {
    callback();
    closeModal();
  };

  return (
    <Confirm
      content={content}
      onCancel={closeModal}
      onConfirm={handleConfirm}
      open={true}
      className="lingvo-confirm"
      confirmButton={buttonConfirm || "OK"}
      cancelButton={buttonCancel || getTranslation("Cancel")}
    />
  );
};

export default compose(
  connect(
    state => state.confirm,
    dispatch => bindActionCreators({ closeModal }, dispatch)
  ),
  branch(({ visible }) => !visible, renderNothing)
)(ConfirmModal);
