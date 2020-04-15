import React from 'react';
import PropTypes from 'prop-types';
import { branch, compose, renderNothing } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, List, Modal, Select, Grid, Header } from 'semantic-ui-react';
import { closeModal as closeDictionaryOrganizationsModal } from 'ducks/dictionaryOrganizations';
import { bindActionCreators } from 'redux';
import { map } from 'lodash';
import { connect } from 'react-redux';
import { every } from 'lodash';

import { compositeIdToString as id2str } from 'utils/compositeId';
import Translations from 'components/Translation';
import { getTranslation } from 'api/i18n';
import { getUserRequestsQuery } from 'components/Grants/graphql';

export const organizationsQuery = gql`
  query organizations {
    organizations {
      id
      translation
      additional_metadata {
        participant
      }
    }
  }
`;

class DictionaryOrganizationsModal extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state = {};

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
        open>

        <Modal.Header>{getTranslation('Organizations')}</Modal.Header>

        <Modal.Content>

          <div>
            <span>
              {getTranslation(
                this.linked_list.length > 0 ?
                  'Linked organizations:' :
                  'Linked organizations: none.')}
            </span>

            {this.linked_list.length > 0 && (
              <List>
                {map(this.linked_list, organization => (
                  <List.Item
                    key={organization.id}
                    style={{marginLeft: '0.75em'}}>

                    <span>{organization.translation}</span>

                  </List.Item>
                ))}
              </List>
            )}
          </div>

          <div style={{marginTop: '1.75em'}}>
            <span>
              {getTranslation(
                this.link_to_list.length > 0 ?
                  'Organizations available to link to:' :
                  'Organizations available to link to: none.')}
            </span>

            <List>
              {map(this.link_to_list, organization => (
                <List.Item
                  key={organization.id}
                  style={{marginLeft: '0.75em'}}>

                  <span>
                    {organization.translation}
                  </span>

                  <Button
                    basic
                    content={getTranslation('Request link')}
                    positive
                    size='mini'
                    style={{marginLeft: '1em'}}
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
                      }).then(() => {
                        window.logger.suc(getTranslation(
                          'Request has been sent to the organization\'s administrator.'));
                      });
                    }}
                  />

                </List.Item>
              ))}
            </List>
          </div>

        </Modal.Content>

        <Modal.Actions>
          <Button
            content={getTranslation("Close")}
            onClick={closeDictionaryOrganizationsModal} />
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
