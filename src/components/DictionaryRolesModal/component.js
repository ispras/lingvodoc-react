import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure, onlyUpdateForKeys } from 'recompose';
import { Link } from 'react-router-dom';
import { gql, graphql } from 'react-apollo';
import { Container, Dimmer, Tab, Header, List, Dropdown, Icon, Menu, Modal, Button, Table, Radio } from 'semantic-ui-react';
import { isEqual, find, filter, intersection } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import { closeRoles as close } from 'ducks/roles';

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

const RolesUsers = ({ permissions }) => {
  const users = intersection(...permissions.map(p => p.users));

  return (
    <Table celled>
      <Table.Header>
        <Table.Row>
          <Table.HeaderCell>Role</Table.HeaderCell>
          {users.map(user => <Table.HeaderCell>{user.name}</Table.HeaderCell>)}
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {permissions.map(role => (
          <Table.Row>
            <Table.Cell>{role.group.name}</Table.Cell>
            {users.map(user => <Table.Cell><Radio onChange={() => console.log(122)} toggle /></Table.Cell>)}
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

const Roles = ({ mode, data }) => {
  if (data.loading) {
    return null;
  }

  const roles = data[mode].roles;
  const { all_basegroups: baseGroups, users } = data;
  const { roles_users: rolesUsers, roles_organizations: rolesOrganizations } = roles;

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
      .map(role => find(users, u => u.id === role.user_id)),
  }));

  return <RolesUsers permissions={permissions} />;
};

export const DictionaryRoles = compose(onlyUpdateForKeys(['permissions']), graphql(queryDictionary))(Roles);
export const PerspectiveRoles = compose(onlyUpdateForKeys(['permissions']), graphql(queryPerspective))(Roles);
