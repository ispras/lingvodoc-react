import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, branch, renderComponent, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
/*import Immutable, { fromJS } from 'immutable';*/
import { Button, Table, List, Confirm, Container, Icon } from 'semantic-ui-react';
import gql from 'graphql-tag';

import Placeholder from 'components/Placeholder';
import { getTranslation } from 'api/i18n';
import { openModal as openCreateOrganizationModal } from 'ducks/createOrganization';
import { getUserRequestsQuery } from 'components/Grants/graphql';
import Footer from 'components/Footer';

import './style.scss';

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
      admins {
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

export const deleteOrgMutation = gql`
  mutation deleteOrg($organizationId: Int!) {
    delete_organization(organization_id: $organizationId) {
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
    this.deleteOrganization = this.deleteOrganization.bind(this);

    this.state = {
      organization_to_delete: null,
      being_deleted_id_set: new Set(),
      process_member_id_set: new Set(),
      process_admin_id_set: new Set(),
    };
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
        "Request has been sent to the organization's administrator."));
      
      const { process_member_id_set } = this.state;

      process_member_id_set.add(organization.id);
      this.setState({ process_member_id_set });
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
        "Request has been sent to the organization's administrator."));
      
      const { process_admin_id_set } = this.state;

      process_admin_id_set.add(organization.id);
      this.setState({ process_admin_id_set });
    });
  }

  createOrganization()
  {
    const { openCreateOrganizationModal } = this.props;
    openCreateOrganizationModal();
  }

  deleteOrganization()
  {
    const {
      organization_to_delete,
      being_deleted_id_set } = this.state;

    const organization_id =
      organization_to_delete.id;

    const organization_str =
      organization_to_delete.translation;

    being_deleted_id_set.add(
      organization_id);

    this.setState({
      organization_to_delete: null,
      being_deleted_id_set });

    const { deleteOrg } = this.props;

    deleteOrg({
      variables: {
        organizationId: organization_id },
      refetchQueries: [
        {
          query: organizationsQuery,
        },
      ],
    }).then(
      () =>
      {
        window.logger.suc(`${getTranslation(
          'Successfully deleted organization')} "${organization_str}".`);

        const { being_deleted_id_set } = this.state;

        being_deleted_id_set.delete(organization_id);
        this.setState({ being_deleted_id_set });
      },
      () =>
      {
        window.logger.err(`${getTranslation(
          'Failed to delete organization')} "${organization_str}"!`);

        const { being_deleted_id_set } = this.state;

        being_deleted_id_set.delete(organization_id);
        this.setState({ being_deleted_id_set });
      }
    );
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
    const { organization_to_delete } = this.state;
    const { organizations } = data;

    return (
      <div className="lingvodoc-page">
        <div className="lingvodoc-page__content">

          <div className="background-header">
            <h2 className="page-title">{getTranslation('Organizations')}</h2>
          </div>

          <Container className="lingvo-container_organizations">

            {user.id == 1 && (
              <Button onClick={() => this.createOrganization()} className="lingvo-button-violet-dashed">
                {getTranslation('Add organization')}
              </Button>
            )}
          
            <div style={{ overflowY: 'auto' }}>
              <Table celled padded className="lingvo-org-table">
                <Table.Header>
                  <Table.Row>
                    <Table.HeaderCell>
                      <div className="lingvo-org-table__content">
                        {getTranslation('Organization name')}
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="lingvo-org-table__content">
                        {getTranslation('About the organization')}
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="lingvo-org-table__content">
                        {getTranslation('Members')}
                      </div>
                    </Table.HeaderCell>
                    <Table.HeaderCell>
                      <div className="lingvo-org-table__content">
                        {getTranslation('Administrators')}
                      </div>
                    </Table.HeaderCell>
                    {user.id && <Table.HeaderCell className="lingvo-org-table__cell_buttons" />}
                    {user.id && (user.id == 1) && <Table.HeaderCell className="lingvo-org-table__cell_delete" />}
                  </Table.Row>
                </Table.Header>
                <Table.Body>
                  {organizations.map(organization => {

                    const is_member = this.isMember(organization);
                    const is_admin = this.isAdmin(organization);

                    const is_being_deleted = this.state.being_deleted_id_set.has(organization.id);

                    const is_process_member = this.state.process_member_id_set.has(organization.id);
                    const is_process_admin = this.state.process_admin_id_set.has(organization.id);
                    
                    return (
                      <Table.Row key={organization.id}>
                        <Table.Cell>
                          <div className="lingvo-org-table__content">{organization.translation}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="lingvo-org-table__content">{organization.about}</div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="lingvo-org-table__content">
                            {organization.members.map(member =>
                            <div key={member.id} className="lingvo-org-table__list-item">{member.name}</div>)}
                          </div>
                        </Table.Cell>
                        <Table.Cell>
                          <div className="lingvo-org-table__content">
                            {organization.admins.map(admin =>
                            <div key={admin.id} className="lingvo-org-table__list-item">{admin.name}</div>)}
                          </div>
                        </Table.Cell>
                        {user.id && (
                          <Table.Cell className="lingvo-org-table__cell_buttons">
                            <List>
                              {!is_member && (
                                <List.Item>
                                  <Button
                                    className="lingvo-button-link"
                                    disabled={is_being_deleted || is_process_member}
                                    onClick={() => this.joinOrganization(organization)}>
                                      {!is_process_member ? 
                                        getTranslation('Become a member') : 
                                        getTranslation('In processing')
                                      }
                                  </Button>
                                </List.Item>
                              ) || (
                                <List.Item>
                                  <span className="lingvo-org-table__role">{getTranslation('You are a member')}</span>
                                </List.Item>
                              )}

                              {!is_admin && (
                                <List.Item>
                                  <Button
                                    className="lingvo-button-link"
                                    disabled={is_being_deleted || is_process_admin}
                                    onClick={() => this.adminOrganization(organization)}>
                                      {!is_process_admin ? 
                                        getTranslation('Become an administrator') : 
                                        getTranslation('In processing')
                                      }
                                  </Button>
                                </List.Item>
                              ) || (
                                <List.Item>
                                  <span className="lingvo-org-table__role">{getTranslation('You are an administrator')}</span>
                                </List.Item>
                              )}
                            </List>
                          </Table.Cell>
                        )}
                        {user.id && (user.id == 1) && (
                          <Table.Cell className="lingvo-org-table__cell_delete">
                            {!is_being_deleted ? 
                              <Button 
                                icon={<i className="lingvo-icon lingvo-icon_trash" />}
                                title={getTranslation('Delete')} 
                                className="lingvo-button-org-delete" 
                                disabled={is_being_deleted}
                                onClick={() => this.setState({ organization_to_delete: organization })}
                              /> : 
                              <Icon name="spinner" loading title={`${getTranslation('Deleting')}...`} />
                            }
                          </Table.Cell>
                        )}
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>

              {organization_to_delete && (
                <Confirm
                  open={!!organization_to_delete}
                  cancelButton={getTranslation('No')}
                  confirmButton={getTranslation('Yes')}
                  onCancel={() => this.setState({ organization_to_delete: null })}
                  onConfirm={this.deleteOrganization}
                  content={
                    getTranslation('Delete organization') +
                    ' "' +
                    organization_to_delete.translation +
                    '"?'}
                  className="lingvo-confirm"
                />
              )}
            </div>

          </Container>

        </div>
        <Footer />
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
  graphql(deleteOrgMutation, { name: 'deleteOrg' }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing),
)(Organizations);
