import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal } from 'semantic-ui-react';
import { closeModal as closeCreateOrganizationModal } from 'ducks/createOrganization';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';

import Translations from 'components/Translation2';
import { organizationsQuery } from 'pages/Organizations';
import { getTranslation } from 'api/i18n';
import './style.scss';

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
        open 
        className="lingvo-modal2">

        <Modal.Header>{getTranslation('New organization')}</Modal.Header>

        <Modal.Content>

          <h4 className="lingvo-org-translation__header">{getTranslation('Organization name')}</h4>
          <Translations
            onChange={translations => this.setState({ translations })} />

          <h4 className="lingvo-org-translation__header">{getTranslation('About the organization')}</h4>
          <Translations
            onChange={translations_about => this.setState({ translations_about })}
            textArea={true}/>

        </Modal.Content>

        <Modal.Actions>
          <Button content={getTranslation("Save")} onClick={this.saveOrganization} disabled={this.isSaveDisabled()} className="lingvo-button-violet" />
          <Button content={getTranslation("Cancel")} onClick={closeCreateOrganizationModal} className="lingvo-button-basic-black" />
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
    { name: 'createOrganization'/*, options: { fetchPolicy: "network-only" }*/
  }
  )
)(CreateOrganizationModal);
