import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { Link } from 'react-router-dom';
import { gql, graphql } from 'react-apollo';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu, Modal, Button } from 'semantic-ui-react';
import { isEqual, find, filter, contains } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { closeRoles as close } from 'ducks/roles';
import { PerspectiveRoles, DictionaryRoles } from './component';

function getComponent(id, mode) {
  switch (mode) {
    case 'dictionary':
      return DictionaryRoles;
    case 'perspective':
      return PerspectiveRoles;
    default:
      return () => <h4>Not supported</h4>;
  }
}

const RolesModal = ({
  visible, id, mode, actions,
}) => {
  const Component = getComponent(id, mode);
  return (
    <Modal open={visible} dimmer="blurring" size="small">
      <Modal.Content>
        <Component id={id} mode={mode} />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Close" onClick={actions.close} />
      </Modal.Actions>
    </Modal>
  );
};

RolesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  mode: PropTypes.oneOf(['dictionary', 'perspective']),
  id: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    close: PropTypes.func.isRequired,
  }).isRequired,
};

RolesModal.defaultProps = {
  mode: 'dictionary',
};

const mapStateToProps = state => state.roles;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ close }, dispatch),
});

export default compose(onlyUpdateForKeys(['visible', 'mode']), connect(mapStateToProps, mapDispatchToProps))(RolesModal);
