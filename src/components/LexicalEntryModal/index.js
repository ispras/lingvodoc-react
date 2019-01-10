import React from 'react';
import PropTypes from 'prop-types';
import { Modal, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { getTranslation } from 'api/i18n';
import LexicalEntryByIds from 'components/LexicalEntryByIds';
// import { LexicalEntryByIds } from 'components/PerspectiveView/index';

export const LexicalEntryLink = styled.span`
  cursor: pointer;
  color: #2185d0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

function LexicalEntryModal({
  node, actions, entitiesMode, defaultMode, onClose,
}) {
  const { id, translation, lexicalEntries } = node;

  return (
    <Modal dimmer open size="fullscreen" closeOnDimmerClick={false} closeIcon onClose={onClose}>
      <Modal.Header>{translation}</Modal.Header>
      <Modal.Content scrolling>
        <LexicalEntryByIds
          className="perspective"
          perspectiveId={id}
          entriesIds={lexicalEntries.map(e => e.id)}
          defaultMode={defaultMode}
          entitiesMode={entitiesMode}
          actions={actions}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content={getTranslation('Cancel')} onClick={onClose} />
      </Modal.Actions>
    </Modal>
  );
}

LexicalEntryModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired,
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  defaultMode: PropTypes.string.isRequired,
  onClose: PropTypes.func.isRequired,
};

LexicalEntryModal.defaultProps = {
  actions: [],
  entitiesMode: 'published',
};


export default LexicalEntryModal;
