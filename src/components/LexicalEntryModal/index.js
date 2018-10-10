import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { compose, branch, renderNothing } from 'recompose';
import { connect } from 'react-redux';
import { Modal, Button } from 'semantic-ui-react';
import styled from 'styled-components';
import { LexicalEntryViewByIds } from 'components/PerspectiveView/index';
import { closeLexicalEntry } from 'ducks/lexicalEntry';

export const LexicalEntryLink = styled.span`
  cursor: pointer;
  color: #2185d0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

function LexicalEntryModal({
  node, actions, entitiesMode, closeLexicalEntry: close,
}) {
  const { id, translation, lexicalEntries } = node;

  return (
    <Modal closeIcon size="fullscreen" open>
      <Modal.Header>{translation}</Modal.Header>
      <Modal.Content scrolling>
        <LexicalEntryViewByIds
          className="perspective"
          perspectiveId={id}
          entriesIds={lexicalEntries.map(e => e.id)}
          mode="view"
          entitiesMode={entitiesMode}
          actions={actions}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Cancel" onClick={close} />
      </Modal.Actions>
    </Modal>
  );
}

LexicalEntryModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired,
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string,
  closeLexicalEntry: PropTypes.func.isRequired,
};

LexicalEntryModal.defaultProps = {
  actions: [],
  entitiesMode: 'published',
};

const mapStateToProps = state => state.lexicalEntry;

const mapDispatchToProps = dispatch => bindActionCreators({ closeLexicalEntry }, dispatch);

export default compose(
  connect(
    mapStateToProps,
    mapDispatchToProps
  ),
  branch(({ visible }) => !visible, renderNothing)
)(LexicalEntryModal);
