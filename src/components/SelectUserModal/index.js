import React, { useContext, useState } from "react";
import { Button, Container, Dropdown, Icon, Message, Radio, Table } from "semantic-ui-react";
import { gql, useQuery } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { filter, find, some, union, uniq, without } from "lodash";
import PropTypes from "prop-types";
import { compose, onlyUpdateForKeys } from "recompose";
import { queryUsers } from "components/BanModal";

import TranslationContext from "Layout/TranslationContext";

const SelectUserModal = ({}) => {

    const { users: allUsers } = useQuery(queryUsers);
    console.log("Users: ", allUsers);

    const [ selectedUser, setSelectedUser ] = useState(null);

    /*
    if (data.error) {
      return (
        <Message negative compact>
          {useContext("Role data loading error, please contact adiministrators.")}
        </Message>
      );
    } else if (data.loading) {
      return (
        <span>
          {useContext("Loading role data")}... <Icon name="spinner" loading />
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
    */

    const userOptions = allUsers
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
          placeholder={useContext("Select user")}
          search
          selection
          options={userOptions}
          selectOnBlur={false}
          value={selectedUser}
          onChange={(e, d) => setSelectedUser(d.value)}
          className="lingvo-roles-dropdown lingvo-roles-dropdown_search"
          icon={<i className="lingvo-icon lingvo-icon_arrow" />}
        />
    </Container>
  );
}

/*
SelectUserModal.propTypes = {
  mode: PropTypes.string.isRequired,
  data: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
};
*/

export default SelectUserModal;
