import React from "react";
import { Button, Container, Dropdown, Icon, Message, Radio, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { filter, find, some, union, uniq, without } from "lodash";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";

import TranslationContext from "Layout/TranslationContext";

class SelectUserModal extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    const { mode, data, user } = this.props;

    if (data.error) {
      return (
        <Message negative compact>
          {this.context("Role data loading error, please contact adiministrators.")}
        </Message>
      );
    } else if (data.loading) {
      return (
        <span>
          {this.context("Loading role data")}... <Icon name="spinner" loading />
        </span>
      );
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

SelectUserModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default SelectUserModal;
