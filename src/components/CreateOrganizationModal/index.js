import React, { useCallback, useState, useContext } from "react";
import { connect } from "react-redux";
import { Button, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { every } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import Translations from "components/Translation2";
import { closeModal as closeCreateOrganizationModal } from "ducks/createOrganization";
import TranslationContext from "Layout/TranslationContext";
import { organizationsQuery } from "pages/Organizations";

import "./style.scss";

const CreateOrganizationModal = ({ visible, closeCreateOrganizationModal, createOrganization }) => {
  const getTranslation = useContext(TranslationContext);

  const [translations, setTranslations] = useState([]);
  const [translationsAbout, setTranslationsAbout] = useState([]);

  const isSaveDisabled = useCallback(() => {
    return translations.length === 0 || every(translations, translation => translation.content.length === 0);
  }, [translations]);

  const saveOrganization = useCallback(() => {
    const translationAtoms = translations.map(t => ({ locale_id: t.localeId, content: t.content }));

    const translationAtomsAbout = translationsAbout.map(t => ({
      locale_id: t.localeId,
      content: t.content
    }));

    createOrganization({
      variables: { translationAtoms, translationAtomsAbout },
      refetchQueries: [
        {
          query: organizationsQuery,
          fetchPolicy: "network-only"
        }
      ]
    }).then(({ data }) => {
      closeCreateOrganizationModal();
    });
  }, [translations, translationsAbout]);

  if (!visible) {
    return null;
  }

  return (
    <Modal closeIcon onClose={closeCreateOrganizationModal} dimmer open className="lingvo-modal2">
      <Modal.Header>{getTranslation("New organization")}</Modal.Header>

      <Modal.Content>
        <h4 className="lingvo-org-translation__header">{getTranslation("Organization name")}</h4>
        <Translations onChange={translations => setTranslations(translations)} />

        <h4 className="lingvo-org-translation__header">{getTranslation("About the organization")}</h4>
        <Translations onChange={translationsAbout => setTranslationsAbout(translationsAbout)} textArea={true} />
      </Modal.Content>

      <Modal.Actions>
        <Button
          content={getTranslation("Save")}
          onClick={saveOrganization}
          disabled={isSaveDisabled()}
          className="lingvo-button-violet"
        />

        <Button
          content={getTranslation("Cancel")}
          onClick={closeCreateOrganizationModal}
          className="lingvo-button-basic-black"
        />
      </Modal.Actions>
    </Modal>
  );
};

CreateOrganizationModal.propTypes = {
  closeCreateOrganizationModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired,
  createOrganization: PropTypes.func.isRequired
};

export default compose(
  connect(
    state => state.createOrganization,
    dispatch => bindActionCreators({ closeCreateOrganizationModal }, dispatch)
  ),
  graphql(
    gql`
      mutation createOrganization($translationAtoms: [ObjectVal]!, $translationAtomsAbout: [ObjectVal]!) {
        create_organization(translation_atoms: $translationAtoms, about_translation_atoms: $translationAtomsAbout) {
          organization {
            id
          }
          triumph
        }
      }
    `,
    { name: "createOrganization" }
  )
)(CreateOrganizationModal);
