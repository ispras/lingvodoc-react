import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderComponent, renderNothing, withProps, pure } from 'recompose';
import { graphql } from 'react-apollo';
import Immutable, { fromJS } from 'immutable';
import { Divider, Message, Button, Step, Header, Table, List } from 'semantic-ui-react';
import gql from 'graphql-tag';

import Placeholder from 'components/Placeholder';
import { getTranslation } from 'api/i18n';
import { openModal as openCreateOrganizationModal } from 'ducks/createOrganization';
import { getUserRequestsQuery } from 'components/Grants/graphql';

export const organizationsQuery = gql`
  query organizations {
    organizations {
      id
      translation
      created_at
      about
      additional_metadata {
        admins
        participant
      }
      members {
        id
        name
      }
    }
  }
`;

export const participateOrgMutation = gql`
  mutation participateOrg($organizationId: Int!) {
    participate_org(org_id: $organizationId) {
      triumph
    }
  }
`;

export const administrateOrgMutation = gql`
  mutation administrateOrg($organizationId: Int!) {
    administrate_org(org_id: $organizationId) {
      triumph
    }
  }
`;

class Organizations extends React.Component {
  constructor(props) {
    super(props);

    this.joinOrganization = this.joinOrganization.bind(this);
    this.adminOrganization = this.adminOrganization.bind(this);

    this.isMember = this.isMember.bind(this);
    this.isAdmin = this.isAdmin.bind(this);

    this.createOrganization = this.createOrganization.bind(this);
  }

  joinOrganization(organization)
  {
    const { participateOrg } = this.props;
    participateOrg({
      variables: { organizationId: organization.id },
      refetchQueries: [
        {
          query: getUserRequestsQuery,
        },
      ],
    }).then(() => {
      window.logger.suc(getTranslation(
        'Request has been sent to the organization\'s administrator.'));
    });
  }

  adminOrganization(organization)
  {
    const { administrateOrg } = this.props;
    administrateOrg({
      variables: { organizationId: organization.id },
      refetchQueries: [
        {
          query: getUserRequestsQuery,
        },
      ],
    }).then(() => {
      window.logger.suc(getTranslation(
        'Request has been sent to the organization\'s administrator.'));
    });
  }

  createOrganization()
  {
    const { openCreateOrganizationModal } = this.props;
    openCreateOrganizationModal();
  }

  isMember(organization)
  {
    const user = this.props.user;
    return !!organization.members.find(u => user.id === u.id);
  }

  isAdmin(organization)
  {
    const user = this.props.user;
    return !!organization.additional_metadata.admins.find(id => user.id === id);
  }

  render() {
    const { data, user } = this.props;
    const { organizations } = data;

    return (
      <div>

        <div style={{ overflowY: 'auto' }}>
          <Table celled padded>
            <Table.Header>
              <Table.Row>
                <Table.HeaderCell>{getTranslation('Organization name')}</Table.HeaderCell>
                <Table.HeaderCell>{getTranslation('About')}</Table.HeaderCell>
                <Table.HeaderCell>{getTranslation('Members')}</Table.HeaderCell>
                <Table.HeaderCell />
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {organizations.map(organization => {

                const is_member = this.isMember(organization);
                const is_admin = this.isAdmin(organization);
                
                return (
                  <Table.Row key={organization.id}>
                    <Table.Cell>{organization.translation}</Table.Cell>
                    <Table.Cell>{organization.about}</Table.Cell>
                    <Table.Cell>{organization.members.map(member =>
                      <div key={member.id}>{member.name}</div>)}</Table.Cell>
                    <Table.Cell>
                      <List>
                        {is_member && (
                          <List.Item>You are a member</List.Item>)}
                        {is_admin && (
                          <List.Item>You are an administrator</List.Item>)}
                        {(!is_member || !is_admin) && (
                          <List.Item>
                            <Button.Group>
                              {!is_member && (
                                <Button positive onClick={() => this.joinOrganization(organization)}>
                                  {getTranslation('Join')}
                                </Button>
                              )}
                              {!is_admin && (
                                <Button positive onClick={() => this.adminOrganization(organization)}>
                                  {getTranslation('Administrate')}
                                </Button>
                              )}
                            </Button.Group>
                          </List.Item>
                        )}
                      </List>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        </div>

        {user.id == 1 && (
          <Button
            style={{marginTop: '1em'}}
            onClick={() => this.createOrganization()}>
            {getTranslation('Create organization...')}
          </Button>
        )}

      </div>
    );
  }
}

Organizations.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
};

export default compose(
  connect(null, dispatch =>
    bindActionCreators({ openCreateOrganizationModal }, dispatch)),
  connect(state => state.user),
  graphql(organizationsQuery),
  graphql(participateOrgMutation, { name: 'participateOrg' }),
  graphql(administrateOrgMutation, { name: 'administrateOrg' }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing),
)(Organizations);
