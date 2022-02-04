import React from 'react';
import PropTypes from 'prop-types';
import { branch, compose, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal, Select, Grid, Header, Table } from 'semantic-ui-react';
import { closeModal as closeDictionaryOrganizationsModal } from 'ducks/dictionaryOrganizations';
import { bindActionCreators } from 'redux';
import { map } from 'lodash';
import { connect } from 'react-redux';

import { compositeIdToString as id2str } from 'utils/compositeId';
import Translations from 'components/Translation';
import { getTranslation } from 'api/i18n';
import { getUserRequestsQuery } from 'components/Grants/graphql';
import { organizationsQuery } from 'pages/Organizations';

class DictionaryOrganizationsModal extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {
      requested_id_set: {},
    };

    this.linked_list = [];
    this.link_to_list = [];

    const {
      data: { organizations },
      dictionaryId } = this.props;

    const dictionaryIdStr = id2str(dictionaryId);

    for (const organization of organizations)
    {
      (organization.additional_metadata.participant.some(
        id => id2str(id) == dictionaryIdStr) ?

        this.linked_list :
        this.link_to_list)

        .push(organization);
    }
  }

  render()
  {
    const {
      addDictionaryToOrganization,
      closeDictionaryOrganizationsModal,
      data,
      dictionaryId } = this.props;

    return (
      <Modal
        closeIcon
        onClose={closeDictionaryOrganizationsModal}
        dimmer
        open
        className="lingvo-modal2">

        <Modal.Header>{getTranslation('Organizations')}</Modal.Header>

        <Modal.Content>

          <div>
           
            <div className="lingvo-organizations-head-table">
                {getTranslation('Linked organizations:')}
            </div>

            {this.linked_list.length > 0 && (
              <Table celled className="lingvo-organizations-table">
                <Table.Body>
                  {map(this.linked_list, organization => (
                    <Table.Row key={organization.id}>
                      <Table.Cell>
                        {organization.translation}
                      </Table.Cell>
                    </Table.Row>
                  ))}
                </Table.Body>
              </Table>
            ) || (
              <div className="lingvo-organizations-none">
                {getTranslation('none.')}
              </div>
            )}
          </div>
          
          <div style={{marginTop: '1.75em'}}>
            
            <div className="lingvo-organizations-head-table">
              {getTranslation('Organizations available to link to:')}
            </div>

            {this.link_to_list.length > 0 && (
              <Table celled className="lingvo-organizations-table">
              <Table.Body>
                {map(this.link_to_list, organization => {

                  const id_str = `${organization.id}`;

                  const already = this.state.requested_id_set.hasOwnProperty(id_str);

                  return (
                    <Table.Row key={organization.id}>
                      <Table.Cell>
                        {organization.translation}
                      </Table.Cell>

                      <Table.Cell>
                        <Button
                          content={already ?
                            getTranslation('Link requested') :
                            getTranslation('Request link')}
                          disabled={already}
                          className="lingvo-button-green-small"
                          onClick={() =>
                          {
                            addDictionaryToOrganization({
                              variables: {
                                dictionaryId,
                                organizationId: organization.id },
                              refetchQueries: [
                                {
                                  query: getUserRequestsQuery,
                                },
                              ],
                            })
                            .then(
                              () =>
                              {
                                window.logger.suc(getTranslation(
                                  "Request has been sent to the organization's administrator."));

                                this.state.requested_id_set[id_str] = null;
                                this.setState({ requested_id_set: this.state.requested_id_set });
                              },
                              error =>
                              {
                                if (error.message == 'GraphQL error: Request already exists.')
                                {
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
            ) || (
              <div className="lingvo-organizations-none">
                {getTranslation('none.')}
              </div>
            )}

          </div>

        </Modal.Content>

        <Modal.Actions>
          <Button content={getTranslation("Close")} onClick={closeDictionaryOrganizationsModal} className="lingvo-button-basic-black" />
        </Modal.Actions>

      </Modal>
    );
  }
}

DictionaryOrganizationsModal.propTypes = {
  closeDictionaryOrganizationsModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
};

export default compose(
  connect(
    state => state.dictionaryOrganizations,
    dispatch => bindActionCreators({ closeDictionaryOrganizationsModal }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  graphql(organizationsQuery),
  graphql(
    gql`
      mutation addDictionaryToOrganization(
        $dictionaryId: LingvodocID!,
        $organizationId: Int!)
      {
        add_dictionary_to_organization(
          dictionary_id: $dictionaryId,
          organization_id: $organizationId)
        {
          triumph
        }
      }
    `,
    { name: 'addDictionaryToOrganization' }
  ),
  branch(({ data }) => data.loading, renderNothing),
)(DictionaryOrganizationsModal);
