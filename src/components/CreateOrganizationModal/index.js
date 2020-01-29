import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal, Select, Grid, Header } from 'semantic-ui-react';
import { closeModal as closeCreateOrganizationModal } from 'ducks/createOrganization';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import Translations from 'components/Translation';
import { organizationsQuery } from 'pages/Organizations';
import { getTranslation } from 'api/i18n';

class CreateOrganizationModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
      translations_about: [],
    };

    this.saveOrganization = this.saveOrganization.bind(this);
    this.isSaveDisabled = this.isSaveDisabled.bind(this);
  }

  isSaveDisabled() {
    return (
      this.state.translations.length === 0 ||
      every(this.state.translations, translation => translation.content.length === 0)
    );
  }

  saveOrganization()
  {
    const {
      createOrganization,
      closeCreateOrganizationModal } = this.props;

    const translationAtoms = this.state.translations.map(
      t => ({ locale_id: t.localeId, content: t.content }));

    const translationAtomsAbout = this.state.translations_about.map(
      t => ({ locale_id: t.localeId, content: t.content }));

    createOrganization({
      variables: { translationAtoms, translationAtomsAbout },
      refetchQueries: [
        {
          query: organizationsQuery,
        },
      ],
    })
      
    .then(
      ({ data }) => {
        closeCreateOrganizationModal();
      });
  }

  render()
  {
    const {
      visible,
      closeCreateOrganizationModal } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal
        closeIcon
        onClose={closeCreateOrganizationModal}
        dimmer
        open>

        <Modal.Header>{getTranslation('Create organization')}</Modal.Header>

        <Modal.Content>

          <Header>{getTranslation('Organization name')}</Header>
          <Translations
            onChange={translations => this.setState({ translations })} />

          <Header>{getTranslation('About')}</Header>
          <Translations
            onChange={translations_about => this.setState({ translations_about })}
            textArea={true}/>

        </Modal.Content>

        <Modal.Actions>
          <Button icon="plus" content={getTranslation("Save")} onClick={this.saveOrganization} disabled={this.isSaveDisabled()} />
          <Button icon="minus" content={getTranslation("Cancel")} onClick={closeCreateOrganizationModal} />
        </Modal.Actions>

      </Modal>
    );
  }
}

CreateOrganizationModal.propTypes = {
  closeCreateOrganizationModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  createOrganization: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.createOrganization, dispatch =>
    bindActionCreators({ closeCreateOrganizationModal }, dispatch)),
  graphql(
    gql`
      mutation createOrganization(
        $translationAtoms: [ObjectVal]!,
        $translationAtomsAbout: [ObjectVal]!)
      {
        create_organization(
          translation_atoms: $translationAtoms,
          about_translation_atoms: $translationAtomsAbout)
        {
          organization { id }
          triumph
        }
      }
    `,
    { name: 'createOrganization' }
  )
)(CreateOrganizationModal);
