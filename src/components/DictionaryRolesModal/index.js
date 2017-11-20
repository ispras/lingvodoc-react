import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { Link } from 'react-router-dom';
import { gql, graphql } from 'react-apollo';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu, Modal, Button } from 'semantic-ui-react';
import { isEqual, find } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { closeDictionaryRoles as close } from 'ducks/roles';

const query = gql`
  query DictionaryRoles($dictionaryId: LingvodocID!) {
    dictionary(id: $dictionaryId) {
      id
      translation
      roles {
        roles_users
        roles_organizations
      }
    }
    all_basegroups {
      id
      created_at
      action
      name
      subject
      dictionary_default
      perspective_default
    }
    users {
      id
      name
      login
      intl_name
      email
    }
  }
`;

const RolesUsers = ({ roles }) => <List>{roles.map(role => <List.Item content={role} />)}</List>;

const Roles = graphql(query)(({ data }) => {
  if (data.loading) {
    return null;
  }

  const { dictionary: { roles }, all_basegroups: baseGroups, users } = data;
  const { roles_users: rolesUsers, roles_organizations: rolesOrganizations } = roles;

  const permissions = rolesUsers.map(role => ({
    roles: role.roles_ids.map(id => find(baseGroups, baseGroup => baseGroup.id === id)),
    user: find(users, u => u.id === role.user_id),
  }));

  console.log(permissions);

  return <h1>test</h1>;
});

const RolesModal = ({ visible, dictionaryId, actions }) => (
  <Modal open={visible} dimmer="blurring" size="small">
    <Modal.Content>
      <Roles dictionaryId={dictionaryId} />
    </Modal.Content>
    <Modal.Actions>
      <Button icon="minus" content="Close" onClick={actions.close} />
    </Modal.Actions>
  </Modal>
);

RolesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  dictionaryId: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    close: PropTypes.func.isRequired,
  }).isRequired,
};

const mapStateToProps = state => state.roles;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ close }, dispatch),
});


export default compose(
  onlyUpdateForKeys(['visible']),
  connect(mapStateToProps, mapDispatchToProps)
)(RolesModal);
