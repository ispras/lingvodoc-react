import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, onlyUpdateForKeys } from 'recompose';
import { Modal, Button } from 'semantic-ui-react';
import { closeRoles as close } from 'ducks/roles';
import { PerspectiveRoles, DictionaryRoles } from './component';
import { getTranslation } from 'api/i18n';

function getComponent(id, mode) {
  switch (mode) {
    case 'dictionary':
      return DictionaryRoles;
    case 'perspective':
      return PerspectiveRoles;
    default:
      return () => <h4>{getTranslation('Not supported')}</h4>;
  }
}

const RolesModal = ({
  visible, id, mode, title, actions,
}) => {
  const Component = getComponent(id, mode);
  return (
    <Modal
      closeIcon
      onClose={actions.close}
      open={visible}
      dimmer="blurring"
      size="large"
      className="lingvo-modal2"
    >
      <Modal.Header>
        {title}
      </Modal.Header>
      <Modal.Content>
        <Component id={id} mode={mode} close={actions.close} />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation('Close')} onClick={actions.close} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

RolesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['dictionary', 'perspective']),
  id: PropTypes.array.isRequired,
  title: PropTypes.string,
  actions: PropTypes.shape({
    close: PropTypes.func.isRequired,
  }).isRequired,
};

RolesModal.defaultProps = {
  mode: 'dictionary',
  title: ' '
};

const mapStateToProps = state => state.roles;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ close }, dispatch),
});

export default compose(
  onlyUpdateForKeys(['visible', 'mode']),
  connect(mapStateToProps, mapDispatchToProps)
)(RolesModal);
