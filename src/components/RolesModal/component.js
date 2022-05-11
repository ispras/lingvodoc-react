import React from "react";
import { Button, Container, Dropdown, Radio, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { filter, find, some, union, uniq, without } from "lodash";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";

import TranslationContext from "Layout/TranslationContext";

const queryDictionary = gql`
  query DictionaryRoles($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      translations
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
      translations
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

    this.state = {
      selectedUser: undefined
    };

    this.onToggleRole = this.onToggleRole.bind(this);
    this.onAddUser = this.onAddUser.bind(this);
    this.onDeleteUser = this.onDeleteUser.bind(this);
  }

  onToggleRole(user, role) {
    const {
      id,
      addRole,
      deleteRole,
      data: { refetch }
    } = this.props;
    const mutation = Roles.hasRole(user, role) ? deleteRole : addRole;
    mutation({
      variables: { id, userId: user.id, rolesIds: [role.group.id] }
    }).then(refetch);
  }

  onAddUser(permissions) {
    const {
      id,
      addRole,
      data: { refetch }
    } = this.props;
    const { selectedUser } = this.state;

    addRole({
      variables: { id, userId: selectedUser, rolesIds: permissions.map(p => p.group.id) }
    }).then(() => {
      refetch().then(() => this.setState({ selectedUser: undefined }));
    });
  }

  onDeleteUser(user, permissions) {
    const {
      id,
      deleteRole,
      data: { refetch }
    } = this.props;
    deleteRole({
      variables: { id, userId: user, rolesIds: permissions.map(p => p.group.id) }
    }).then(refetch);
  }

  render() {
    const { mode, data, user } = this.props;

    if (data.error) {
      return null;
    }

    const { selectedUser } = this.state;

    const currentUser = user;

    const baseGroups = data.all_basegroups ? data.all_basegroups : [];

    const allUsers = data.users ? data.users : [];
    const rolesUsers = data[mode] ? data[mode].roles.roles_users : [];

    // list of all base groups that can be applied to target
    const groups = filter(baseGroups, g => {
      switch (mode) {
        case "dictionary":
          return g.dictionary_default;
        case "perspective":
          return g.perspective_default;
        default:
          return false;
      }
    });

    const permissions = groups.map(group => ({
      group,
      users: rolesUsers
        .filter(role => role.roles_ids.indexOf(group.id) >= 0)
        .map(role => find(allUsers, u => u.id === role.user_id))
    }));

    const users = uniq(union(...permissions.map(p => p.users)));
    const userOptions = without(allUsers, ...users)
      .map(u => ({
        key: u.id,
        value: u.id,
        text: u.name
      }))
      .filter(u => u.value !== 1);

    return (
      <Container>
        <Dropdown
          key={selectedUser}
          placeholder={this.context("Select user")}
          search
          selection
          options={userOptions}
          selectOnBlur={false}
          value={selectedUser}
          onChange={(e, d) => this.setState({ selectedUser: d.value })}
          className="lingvo-roles-dropdown lingvo-roles-dropdown_search"
          icon={<i className="lingvo-icon lingvo-icon_arrow" />}
        />
        <Button
          className="lingvo-button-violet"
          disabled={selectedUser === undefined}
          onClick={() => this.onAddUser(permissions)}
        >
          {this.context("Add")}
        </Button>

        <Table celled className="lingvo-roles-table">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>{this.context("Role")}</Table.HeaderCell>
              {users.map(u => (
                <Table.HeaderCell key={u.id}>
                  {u.name}
                  <Button
                    icon={<i className="lingvo-icon lingvo-icon_trash" />}
                    title={this.context("Remove user")}
                    onClick={() => this.onDeleteUser(u.id, permissions)}
                    className="lingvo-button-roles-delete"
                    disabled={u.id === currentUser.id}
                  />
                </Table.HeaderCell>
              ))}
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {permissions.map(role => (
              <Table.Row key={role.group.id}>
                <Table.Cell>{this.context(role.group.name)}</Table.Cell>
                {users.map(u => (
                  <Table.Cell key={u.id}>
                    <Radio
                      toggle
                      onChange={() => this.onToggleRole(u, role, permissions)}
                      checked={Roles.hasRole(u, role)}
                      className="lingvo-radio-toggle"
                    />
                  </Table.Cell>
                ))}
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      </Container>
    );
  }
}

Roles.contextType = TranslationContext;

Roles.propTypes = {
  id: PropTypes.array.isRequired,
  mode: PropTypes.string.isRequired,
  addRole: PropTypes.func.isRequired,
  deleteRole: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};

export const DictionaryRoles = compose(
  onlyUpdateForKeys(["permissions"]),
  graphql(queryDictionary),
  graphql(addDictionaryRoleMutation, { name: "addRole" }),
  graphql(deleteDictionaryRoleMutation, { name: "deleteRole" })
)(Roles);

export const PerspectiveRoles = compose(
  onlyUpdateForKeys(["permissions"]),
  graphql(queryPerspective),
  graphql(addPerspectiveRoleMutation, { name: "addRole" }),
  graphql(deletePerspectiveRoleMutation, { name: "deleteRole" })
)(Roles);
