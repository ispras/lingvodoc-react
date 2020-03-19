import React from 'react';
import PropTypes from 'prop-types';
import { compose, onlyUpdateForKeys } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Container, Dropdown, Table, Radio } from 'semantic-ui-react';
import { some, find, filter, union, uniq, without } from 'lodash';
import { getTranslation } from 'api/i18n';

const queryDictionary = gql`
  query DictionaryRoles($id: LingvodocID!) {
    dictionary(id: $id) {
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

const queryPerspective = gql`
  query PerspectiveRoles($id: LingvodocID!) {
    perspective(id: $id) {
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

const addDictionaryRoleMutation = gql`
  mutation addRole($id: LingvodocID!, $userId: Int!, $rolesIds: [Int]!) {
    add_dictionary_roles(id: $id, user_id: $userId, roles_users: $rolesIds) {
      triumph
    }
  }
`;

const deleteDictionaryRoleMutation = gql`
  mutation deleteRole($id: LingvodocID!, $userId: Int!, $rolesIds: [Int]!) {
    delete_dictionary_roles(id: $id, user_id: $userId, roles_users: $rolesIds) {
      triumph
    }
  }
`;

const addPerspectiveRoleMutation = gql`
  mutation addRole($id: LingvodocID!, $userId: Int!, $rolesIds: [Int]!) {
    add_perspective_roles(id: $id, user_id: $userId, roles_users: $rolesIds) {
      triumph
    }
  }
`;

const deletePerspectiveRoleMutation = gql`
  mutation deleteRole($id: LingvodocID!, $userId: Int!, $rolesIds: [Int]!) {
    delete_perspective_roles(id: $id, user_id: $userId, roles_users: $rolesIds) {
      triumph
    }
  }
`;

class Roles extends React.Component {

  static hasRole(user, role) {
    return some(role.users, u => u.id === user.id);
  }

  constructor(props) {
    super(props);

    this.onToggleRole = this.onToggleRole.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
  }

  componentWillReceiveProps(props) {
    const { data, close } = props;

    if (data.error) {
      close();
    }
  }

  onToggleRole(user, role) {
    const {
      id, addRole, deleteRole, data: { refetch },
    } = this.props;
    const mutation = Roles.hasRole(user, role) ? deleteRole : addRole;
    mutation({
      variables: { id, userId: user.id, rolesIds: [role.group.id] },
    }).then(refetch);
  }

  onAddUser(event, data, permissions) {
    const { id, addRole, data: { refetch } } = this.props;

    const userId = data.value;
    const rolesIds = permissions.map(p => p.group.id);
    addRole({
      variables: { id, userId, rolesIds },
    }).then(refetch);
  }

  render() {
    const { mode, data } = this.props;

    if (data.loading || data.error) {
      return null;
    }

    const { all_basegroups: baseGroups, users: allUsers } = data;
    const { roles: { roles_users: rolesUsers } } = data[mode];

    // list of all base groups that can be applied to target
    const groups = filter(baseGroups, (g) => {
      switch (mode) {
        case 'dictionary':
          return g.dictionary_default;
        case 'perspective':
          return g.perspective_default;
        default:
          return false;
      }
    });

    const permissions = groups.map(group => ({
      group,
      users: rolesUsers
        .filter(role => role.roles_ids.indexOf(group.id) >= 0)
        .map(role => find(allUsers, u => u.id === role.user_id)),
    }));

    const users = uniq(union(...permissions.map(p => p.users)));
    const userOptions = without(allUsers, ...users)
      .map(user => ({
        key: user.id,
        value: user.id,
        text: user.name,
        icon: 'user',
      }))
      .filter(u => u.value !== 1);

    return (
      <Container>
        <Table celled>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{getTranslation('Role')}</Table.HeaderCell>
              {users.map(user => <Table.HeaderCell key={user.id}>{user.name}</Table.HeaderCell>)}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {permissions.map(role => (
              <Table.Row key={role.group.id}>
                <Table.Cell>{role.group.name}</Table.Cell>
                {users.map(user => (
                  <Table.Cell key={user.id}>
                    <Radio
                      toggle
                      onChange={() => this.onToggleRole(user, role, permissions)}
                      checked={Roles.hasRole(user, role)}
                    />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>

        <Dropdown
          placeholder={getTranslation("Select user")}
          search
          selection
          options={userOptions}
          onChange={(e, d) => this.onAddUser(e, d, permissions)}
        />
      </Container>
    );
  }
}

Roles.propTypes = {
  id: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  addRole: PropTypes.func.isRequired,
  deleteRole: PropTypes.func.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_basegroups: PropTypes.array,
    users: PropTypes.array,
  }).isRequired,
  close: PropTypes.func.isRequired
};

export const DictionaryRoles = compose(
  onlyUpdateForKeys(['permissions']),
  graphql(queryDictionary),
  graphql(addDictionaryRoleMutation, { name: 'addRole' }),
  graphql(deleteDictionaryRoleMutation, { name: 'deleteRole' })
)(Roles);

export const PerspectiveRoles = compose(
  onlyUpdateForKeys(['permissions']),
  graphql(queryPerspective),
  graphql(addPerspectiveRoleMutation, { name: 'addRole' }),
  graphql(deletePerspectiveRoleMutation, { name: 'deleteRole' })
)(Roles);
