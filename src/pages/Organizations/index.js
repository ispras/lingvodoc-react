import React, { useCallback, useState, useContext } from "react";
import { connect } from "react-redux";
import { Button, Confirm, Container, Icon, List, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { branch, compose, renderComponent, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Footer from "components/Footer";
import { getUserRequestsQuery } from "components/Grants/graphql";
import Placeholder from "components/Placeholder";
import { openModal as openCreateOrganizationModal } from "ducks/createOrganization";
import TranslationContext from "Layout/TranslationContext";

import "./style.scss";

export const organizationsQuery = gql`
  query organizations {
    organizations {
      id
      translations
      created_at
      about_translations
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

const Organizations = ({ data, user, participateOrg, administrateOrg, deleteOrg, openCreateOrganizationModal }) => {
  const getTranslation = useContext(TranslationContext);

  const [organizationToDelete, setOrganizationToDelete] = useState(null);
  const [beingDeletedIdSet, setBeingDeletedIdSet] = useState(new Set());
  const [processMemberIdSet, setProcessMemberIdSet] = useState(new Set());
  const [processAdminIdSet, setProcessAdminIdSet] = useState(new Set());

  const joinOrganization = useCallback(
    organization => {
      participateOrg({
        variables: { organizationId: organization.id },
        refetchQueries: [
          {
            query: getUserRequestsQuery,
            fetchPolicy: "network-only"
          }
        ]
      }).then(() => {
        window.logger.suc(getTranslation("Request has been sent to the organization's administrator."));

        processMemberIdSet.add(organization.id);
        setProcessMemberIdSet(processMemberIdSet);
      });
    },
    [processMemberIdSet]
  );

  const adminOrganization = useCallback(
    organization => {
      administrateOrg({
        variables: { organizationId: organization.id },
        refetchQueries: [
          {
            query: getUserRequestsQuery,
            fetchPolicy: "network-only"
          }
        ]
      }).then(() => {
        window.logger.suc(getTranslation("Request has been sent to the organization's administrator."));

        processAdminIdSet.add(organization.id);
        setProcessAdminIdSet(processAdminIdSet);
      });
    },
    [processAdminIdSet]
  );

  const createOrganization = () => {
    openCreateOrganizationModal();
  };

  const deleteOrganization = useCallback(() => {
    const organization_id = organizationToDelete.id;

    const organization_str = T(organizationToDelete.translations);

    beingDeletedIdSet.add(organization_id);

    setOrganizationToDelete(null);
    setBeingDeletedIdSet(beingDeletedIdSet);

    deleteOrg({
      variables: {
        organizationId: organization_id
      },
      refetchQueries: [
        {
          query: organizationsQuery,
          fetchPolicy: "network-only"
        }
      ]
    }).then(
      () => {
        window.logger.suc(`${getTranslation("Successfully deleted organization")} "${organization_str}".`);

        beingDeletedIdSet.delete(organization_id);
        setBeingDeletedIdSet(beingDeletedIdSet);
      },
      () => {
        window.logger.err(`${getTranslation("Failed to delete organization")} "${organization_str}"!`);

        beingDeletedIdSet.delete(organization_id);
        setBeingDeletedIdSet(beingDeletedIdSet);
      }
    );
  }, [organizationToDelete, beingDeletedIdSet]);

  const isMember = organization => {
    return !!organization.members.find(u => user.id === u.id);
  };

  const isAdmin = organization => {
    return !!organization.additional_metadata.admins.find(id => user.id === id);
  };

  const { organizations } = data;

  return (
    <div className="lingvodoc-page">
      <div className="lingvodoc-page__content">
        <div className="background-header">
          <h2 className="page-title">{getTranslation("Organizations")}</h2>
        </div>

        <Container className="lingvo-container_organizations">
          {user.id == 1 && (
            <Button onClick={() => createOrganization()} className="lingvo-button-violet-dashed">
              {getTranslation("Add organization")}
            </Button>
          )}

          <div style={{ overflowY: "auto" }}>
            <Table celled padded className="lingvo-org-table">
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>
                    <div className="lingvo-org-table__content">{getTranslation("Organization name")}</div>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <div className="lingvo-org-table__content">{getTranslation("About the organization")}</div>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <div className="lingvo-org-table__content">{getTranslation("Members")}</div>
                  </Table.HeaderCell>
                  <Table.HeaderCell>
                    <div className="lingvo-org-table__content">{getTranslation("Administrators")}</div>
                  </Table.HeaderCell>
                  {user.id && <Table.HeaderCell className="lingvo-org-table__cell_buttons" />}
                  {user.id && user.id == 1 && <Table.HeaderCell className="lingvo-org-table__cell_delete" />}
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {organizations.map(organization => {
                  const is_member = isMember(organization);
                  const is_admin = isAdmin(organization);

                  const is_being_deleted = beingDeletedIdSet.has(organization.id);

                  const is_process_member = processMemberIdSet.has(organization.id);
                  const is_process_admin = processAdminIdSet.has(organization.id);

                  return (
                    <Table.Row key={organization.id}>
                      <Table.Cell>
                        <div className="lingvo-org-table__content">{T(organization.translations)}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="lingvo-org-table__content">{T(organization.about_translations, "")}</div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="lingvo-org-table__content">
                          {organization.members.map(member => (
                            <div key={member.id} className="lingvo-org-table__list-item">
                              {member.name}
                            </div>
                          ))}
                        </div>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="lingvo-org-table__content">
                          {organization.admins.map(admin => (
                            <div key={admin.id} className="lingvo-org-table__list-item">
                              {admin.name}
                            </div>
                          ))}
                        </div>
                      </Table.Cell>
                      {user.id && (
                        <Table.Cell className="lingvo-org-table__cell_buttons">
                          <List>
                            {(!is_member && (
                              <List.Item>
                                <Button
                                  className="lingvo-button-link"
                                  disabled={is_being_deleted || is_process_member}
                                  onClick={() => joinOrganization(organization)}
                                >
                                  {!is_process_member
                                    ? getTranslation("Become a member")
                                    : getTranslation("In processing")}
                                </Button>
                              </List.Item>
                            )) || (
                              <List.Item>
                                <span className="lingvo-org-table__role">{getTranslation("You are a member")}</span>
                              </List.Item>
                            )}

                            {(!is_admin && (
                              <List.Item>
                                <Button
                                  className="lingvo-button-link"
                                  disabled={is_being_deleted || is_process_admin}
                                  onClick={() => adminOrganization(organization)}
                                >
                                  {!is_process_admin
                                    ? getTranslation("Become an administrator")
                                    : getTranslation("In processing")}
                                </Button>
                              </List.Item>
                            )) || (
                              <List.Item>
                                <span className="lingvo-org-table__role">
                                  {getTranslation("You are an administrator")}
                                </span>
                              </List.Item>
                            )}
                          </List>
                        </Table.Cell>
                      )}
                      {user.id && user.id == 1 && (
                        <Table.Cell className="lingvo-org-table__cell_delete">
                          {!is_being_deleted ? (
                            <Button
                              icon={<i className="lingvo-icon lingvo-icon_trash" />}
                              title={getTranslation("Delete")}
                              className="lingvo-button-org-delete"
                              disabled={is_being_deleted}
                              onClick={() => setOrganizationToDelete(organization)}
                            />
                          ) : (
                            <Icon name="spinner" loading title={`${getTranslation("Deleting")}...`} />
                          )}
                        </Table.Cell>
                      )}
                    </Table.Row>
                  );
                })}
              </Table.Body>
            </Table>

            {organizationToDelete && (
              <Confirm
                open={!!organizationToDelete}
                cancelButton={getTranslation("No")}
                confirmButton={getTranslation("Yes")}
                onCancel={() => setOrganizationToDelete(null)}
                onConfirm={deleteOrganization}
                content={`${getTranslation("Delete organization")} "${T(organizationToDelete.translations)}"?`}
                className="lingvo-confirm"
              />
            )}
          </div>
        </Container>
      </div>
      <Footer />
    </div>
  );
};

Organizations.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired
};

export default compose(
  connect(null, dispatch => bindActionCreators({ openCreateOrganizationModal }, dispatch)),
  connect(state => state.user),
  graphql(organizationsQuery),
  graphql(participateOrgMutation, { name: "participateOrg" }),
  graphql(administrateOrgMutation, { name: "administrateOrg" }),
  graphql(deleteOrgMutation, { name: "deleteOrg" }),
  branch(({ data: { loading } }) => loading, renderComponent(Placeholder)),
  branch(({ data: { error } }) => !!error, renderNothing)
)(Organizations);
