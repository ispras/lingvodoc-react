import React, { useContext } from "react";
import { Button, Modal } from "semantic-ui-react";
import PropTypes from "prop-types";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import LexicalEntryByIds from "components/LexicalEntryByIds";
import TranslationContext from "Layout/TranslationContext";

export const LexicalEntryLink = styled.span`
  cursor: pointer;
  color: #2185d0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

function LexicalEntryModal({ node, actions, entitiesMode, defaultMode, onClose, onlyViewMode }) {
  const getTranslation = useContext(TranslationContext);

  const { id, translations, lexicalEntries, parent_id: perspectiveParentId } = node;

  return (
    <Modal
      dimmer
      open
      size="fullscreen"
      closeOnDimmerClick={false}
      closeIcon
      onClose={onClose}
      className="lingvo-modal2"
    >
      <Modal.Header>{T(translations)}</Modal.Header>
      <Modal.Content scrolling>
        <LexicalEntryByIds
          className="perspective"
          perspectiveId={id}
          perspectiveParentId={perspectiveParentId}
          entriesIds={lexicalEntries.map(e => e.id)}
          defaultMode={defaultMode}
          entitiesMode={entitiesMode}
          onlyViewMode={onlyViewMode}
          actions={actions}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button content={getTranslation("Cancel")} onClick={onClose} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
}

LexicalEntryModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translations: PropTypes.object.isRequired,
    lexicalEntries: PropTypes.array.isRequired
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  defaultMode: PropTypes.string.isRequired,
  onlyViewMode: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired
};

LexicalEntryModal.defaultProps = {
  actions: [],
  entitiesMode: "published"
};

export default LexicalEntryModal;
