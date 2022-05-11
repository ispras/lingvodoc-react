import React, { useCallback, useContext, useState } from "react";
import { Button, Divider, Icon, Modal } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import PropTypes from "prop-types";

import { getLanguageMetadataQuery, updateLanguageAtomMutation, updateLanguageMetadataMutation } from "backend";
import EditLanguageMetadata from "components/EditLanguageMetadata";
import { useMutation } from "hooks";
import TranslationContext from "Layout/TranslationContext";

import TranslationGist from "../TranslationGist";

const EditLanguageModal = ({ language, close }) => {
  const getTranslation = useContext(TranslationContext);

  const [metadata, setMetadata] = useState(null);

  const { loading } = useQuery(getLanguageMetadataQuery, {
    variables: { id: language.id },
    fetchPolicy: "network-only",
    onCompleted: data => setMetadata(data.language.additional_metadata)
  });

  const [updateLanguageMetadata] = useMutation(updateLanguageMetadataMutation);
  const [updateLanguageAtom] = useMutation(updateLanguageAtomMutation);

  const updateMetadata = useCallback(
    newMetadata => {
      updateLanguageMetadata({
        variables: { id: language.id, metadata: newMetadata }
      }).then(() => setMetadata(newMetadata));
    },
    [language, updateLanguageMetadata]
  );

  return (
    <Modal className="lingvo-modal2" dimmer open size="small" closeIcon onClose={close}>
      <Modal.Header>{getTranslation("Language edit")}</Modal.Header>
      <Modal.Content>
        {loading && <Icon name="spinner" loading className="lingvo-spinner" />}
        {!loading && metadata && (
          <>
            <h4>{getTranslation("Translations")}</h4>
            <TranslationGist
              objectId={language.id}
              id={language.translation_gist_id}
              editable
              updateAtomMutation={updateLanguageAtom}
            />
            <Divider />
            <EditLanguageMetadata mode="edit" metadata={metadata} onSave={updateMetadata} />
          </>
        )}
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Close")} onClick={close} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

EditLanguageModal.propTypes = {
  language: PropTypes.object.isRequired,
  close: PropTypes.func.isRequired
};

export default EditLanguageModal;
