import React, { useCallback, useContext, useState } from "react";
import { Button, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";

import { createLanguageMutation, languagesQuery } from "backend";
import EditLanguageMetadata from "components/EditLanguageMetadata";
import Translations from "components/Translation2";
import { useMutation } from "hooks";
import TranslationContext from "Layout/TranslationContext";

const CreateLanguageModal = ({ parent, close }) => {
  const getTranslation = useContext(TranslationContext);

  const [translations, setTranslations] = useState([]);
  const [metadata, setMetadata] = useState(null);

  const [createLanguage] = useMutation(createLanguageMutation, { onCompleted: () => close(true) });

  const saveLanguage = useCallback(() => {
    createLanguage({
      variables: {
        parent_id: parent.id,
        translationAtoms: translations.map(t => ({ locale_id: t.localeId, content: t.content })),
        metadata
      },
      refetchQueries: [{ query: languagesQuery }],
      awaitRefetchQueries: true
    });
  }, [createLanguage, metadata, parent, translations]);

  return (
    <Modal className="lingvo-modal2" dimmer open size="small" closeIcon onClose={() => close()}>
      <Modal.Header>{getTranslation("Create language")}</Modal.Header>
      <Modal.Content>
        <h4 className="lingvo-language__header">
          {getTranslation("Translations")}
        </h4>
        <Translations 
          onChange={newTranslations => setTranslations(newTranslations)} 
          textAddButton="Add"
        />
        
        <EditLanguageMetadata mode="create" onChange={newMetadata => setMetadata(newMetadata)} />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Save")} onClick={saveLanguage} className="lingvo-button-violet" />
        <Button content={getTranslation("Cancel")} onClick={() => close()} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

CreateLanguageModal.propTypes = {
  parent: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default CreateLanguageModal;
