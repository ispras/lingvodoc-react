import React, { useState, useContext } from "react";
import { Button, Container, Dropdown, Icon, Message, Radio, Table } from "semantic-ui-react";
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

const Roles = ({ id, addRole, deleteRole, data, mode, user }) => {
  const getTranslation = useContext(TranslationContext);

  const [selectedUser, setSelectedUser] = useState(0);

  const hasRole = (user, role) => {
    return some(role.users, u => u.id === user.id);
  };

  const onToggleRole = (user, role) => {
    const { refetch } = data;
    const mutation = hasRole(user, role) ? deleteRole : addRole;
    mutation({
      variables: { id, userId: user.id, rolesIds: [role.group.id] }
    }).then(refetch);
  };

  const onAddUser = permissions => {
    const { refetch } = data;

    addRole({
      variables: { id, userId: selectedUser, rolesIds: permissions.map(p => p.group.id) }
    }).then(() => {
      refetch().then(() => setSelectedUser(undefined));
    });
  };

  const onDeleteUser = (user, permissions) => {
    const { refetch } = data;
    deleteRole({
      variables: { id, userId: user, rolesIds: permissions.map(p => p.group.id) }
    }).then(refetch);
  };

  if (data.error) {
    return (
      <Message negative compact>
        {getTranslation("Role data loading error, please contact adiministrators.")}
      </Message>
    );
  } else if (data.loading) {
    return (
      <span>
        {getTranslation("Loading role data")}... <Icon name="spinner" loading />
      </span>
    );
  }

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

  const users = uniq(union(...permissions.map(p => p.users))).sort((user1, user2) =>
    user1.name.localeCompare(user2.name)
  );
  const userOptions = without(allUsers, ...users)
    .map(u => ({
      key: u.id,
      value: u.id,
      text: `${u.name} (${u.intl_name !== u.login ? `${u.intl_name}, ` : ""}${u.login})`
    }))
    .filter(u => u.value !== 1);

  return (
    <Container>
      <Dropdown
        key={selectedUser}
        placeholder={getTranslation("Select user")}
        search
        selection
        options={userOptions}
        selectOnBlur={false}
        value={selectedUser}
        onChange={(e, d) => setSelectedUser(d.value)}
        className="lingvo-roles-dropdown lingvo-roles-dropdown_search"
        icon={<i className="lingvo-icon lingvo-icon_arrow" />}
      />
      <Button
        className="lingvo-button-violet"
        disabled={selectedUser === undefined}
        onClick={() => onAddUser(permissions)}
      >
        {getTranslation("Add")}
      </Button>
      <Table celled className="lingvo-roles-table">
        <Table.Header>
          <Table.Row>
            <Table.HeaderCell>{getTranslation("Role")}</Table.HeaderCell>
            {users.map(u => (
              <Table.HeaderCell key={u.id}>
                {u.name}
                <Button
                  icon={<i className="lingvo-icon lingvo-icon_trash" />}
                  title={getTranslation("Remove user")}
                  onClick={() => onDeleteUser(u.id, permissions)}
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
              <Table.Cell>{getTranslation(role.group.name)}</Table.Cell>
              {users.map(u => (
                <Table.Cell key={u.id}>
                  <Radio
                    toggle
                    onChange={() => onToggleRole(u, role, permissions)}
                    checked={hasRole(u, role)}
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
};

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
