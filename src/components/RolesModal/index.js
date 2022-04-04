import React from "react";
import { connect } from "react-redux";
import { Button, Modal } from "semantic-ui-react";
import { getTranslation } from "api/i18n";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";
import { bindActionCreators } from "redux";

import { closeRoles as close } from "ducks/roles";

import { DictionaryRoles, PerspectiveRoles } from "./component";

function getComponent(id, mode) {
  switch (mode) {
    case "dictionary":
      return DictionaryRoles;
    case "perspective":
      return PerspectiveRoles;
    default:
      return () => <h4>{getTranslation("Not supported")}</h4>;
  }
}

const RolesModal = ({ visible, id, mode, title, actions, user }) => {
  const Component = getComponent(id, mode);

  return (
    <Modal closeIcon onClose={actions.close} open={visible} dimmer size="large" className="lingvo-modal2">
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>
        <Component id={id} mode={mode} close={actions.close} user={user} />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Close")} onClick={actions.close} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

RolesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(["dictionary", "perspective"]),
  id: PropTypes.array.isRequired,
  title: PropTypes.string,
  actions: PropTypes.shape({
    close: PropTypes.func.isRequired
  }).isRequired,
  user: PropTypes.object.isRequired
};

RolesModal.defaultProps = {
  mode: "dictionary",
  title: " "
};

const mapStateToProps = state => ({
  ...state.user,
  ...state.roles
});

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ close }, dispatch)
});

export default compose(
  onlyUpdateForKeys(["visible", "mode"]),
  connect(mapStateToProps, mapDispatchToProps)
)(RolesModal);
