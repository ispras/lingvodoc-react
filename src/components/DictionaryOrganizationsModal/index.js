import React from "react";
import { connect } from "react-redux";
import { Button, Modal, Table } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { map } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, renderNothing } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { getUserRequestsQuery } from "components/Grants/graphql";
import { closeModal as closeDictionaryOrganizationsModal } from "ducks/dictionaryOrganizations";
import TranslationContext from "Layout/TranslationContext";
import { organizationsQuery } from "pages/Organizations";
import { compositeIdToString as id2str } from "utils/compositeId";

class DictionaryOrganizationsModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      requested_id_set: {}
    };

    this.linked_list = [];
    this.link_to_list = [];

    const {
      data: { organizations },
      dictionaryId
    } = this.props;
    if (!organizations) {
      return;
    }

    const dictionaryIdStr = id2str(dictionaryId);
    for (const organization of organizations) {
      (organization.additional_metadata.participant.some(id => id2str(id) === dictionaryIdStr)
        ? this.linked_list
        : this.link_to_list
      ).push(organization);
    }
  }

  render() {
    const { addDictionaryToOrganization, closeDictionaryOrganizationsModal: closeModal, dictionaryId } = this.props;

    return (
      <Modal closeIcon onClose={closeModal} dimmer open className="lingvo-modal2">
        <Modal.Header>{this.context("Organizations")}</Modal.Header>

        <Modal.Content>
          <div>
            <div className="lingvo-organizations-head-table">{this.context("Linked organizations:")}</div>

            {(this.linked_list.length > 0 && (
              <Table celled className="lingvo-organizations-table">
                <Table.Body>
                  {map(this.linked_list, organization => (
                    <Table.Row key={organization.id}>
                      <Table.Cell>{T(organization.translations)}</Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            )) || <div className="lingvo-organizations-none">&mdash;</div>}
          </div>

          <div style={{ marginTop: "1.75em" }}>
            <div className="lingvo-organizations-head-table">{this.context("Organizations available to link to:")}</div>

            {(this.link_to_list.length > 0 && (
              <Table celled className="lingvo-organizations-table">
                <Table.Body>
                  {map(this.link_to_list, organization => {
                    const id_str = `${organization.id}`;

                    const already = Object.prototype.hasOwnProperty.call(this.state.requested_id_set, id_str);

                    return (
                      <Table.Row key={organization.id}>
                        <Table.Cell>{T(organization.translations)}</Table.Cell>

                        <Table.Cell>
                          <Button
                            content={already ? this.context("Link requested") : this.context("Request link")}
                            disabled={already}
                            className="lingvo-button-green-small"
                            onClick={() => {
                              addDictionaryToOrganization({
                                variables: {
                                  dictionaryId,
                                  organizationId: organization.id
                                },
                                refetchQueries: [
                                  {
                                    query: getUserRequestsQuery
                                  }
                                ]
                              }).then(
                                () => {
                                  window.logger.suc(
                                    this.context("Request has been sent to the organization's administrator.")
                                  );

                                  this.state.requested_id_set[id_str] = null;
                                  this.setState({ requested_id_set: this.state.requested_id_set });
                                },
                                error => {
                                  if (error.message == "GraphQL error: Request already exists.") {
                                    this.state.requested_id_set[id_str] = null;
                                    this.setState({ requested_id_set: this.state.requested_id_set });
                                  }
                                }
                              );
                            }}
                          />
                        </Table.Cell>
                      </Table.Row>
                    );
                  })}
                </Table.Body>
              </Table>
            )) || <div className="lingvo-organizations-none">&mdash;</div>}
          </div>
        </Modal.Content>

        <Modal.Actions>
          <Button content={this.context("Close")} onClick={closeModal} className="lingvo-button-basic-black" />
        </Modal.Actions>
      </Modal>
    );
  }
}

DictionaryOrganizationsModal.contextType = TranslationContext;

DictionaryOrganizationsModal.propTypes = {
  closeDictionaryOrganizationsModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  data: PropTypes.object.isRequired,
  dictionaryId: PropTypes.array,
  addDictionaryToOrganization: PropTypes.func.isRequired
};

export default compose(
  connect(
    state => state.dictionaryOrganizations,
    dispatch => bindActionCreators({ closeDictionaryOrganizationsModal }, dispatch)
  ),
  branch(({ visible }) => !visible, renderNothing),
  graphql(organizationsQuery),
  graphql(
    gql`
      mutation addDictionaryToOrganization($dictionaryId: LingvodocID!, $organizationId: Int!) {
        add_dictionary_to_organization(dictionary_id: $dictionaryId, organization_id: $organizationId) {
          triumph
        }
      }
    `,
    { name: "addDictionaryToOrganization" }
  ),
  branch(({ data }) => data.loading, renderNothing)
)(DictionaryOrganizationsModal);
