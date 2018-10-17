import React from 'react';
import PropTypes from 'prop-types';
import { Modal } from 'semantic-ui-react';
import styled from 'styled-components';
import { LexicalEntryViewByIds } from 'components/PerspectiveView/index';
import { connect } from 'react-redux';

const LexicalEntryLink = styled.span`
  cursor: pointer;
  color: #2185D0;

  &:hover {
    color: #1678c2;
    text-decoration: underline;
  }
`;

class LexicalEntryModal extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const { node, actions, entitiesMode, mode } = this.props;
    const { id, translation, lexicalEntries } = node;
    const trigger = <LexicalEntryLink>{translation}: {lexicalEntries.length} result(s)</LexicalEntryLink>;

    return (
      <Modal closeIcon size="fullscreen" trigger={trigger}>
        <Modal.Header>{translation}</Modal.Header>
        <Modal.Content scrolling>
          <LexicalEntryViewByIds
            className="perspective"
            perspectiveId={id}
            entriesIds={lexicalEntries.map(e => e.id)}
            mode={mode}
            entitiesMode={entitiesMode}
            actions={actions}
          />
        </Modal.Content>
      </Modal>
    );
  }

}

LexicalEntryModal.propTypes = {
  node: PropTypes.shape({
    id: PropTypes.array.isRequired,
    translation: PropTypes.string.isRequired,
    lexicalEntries: PropTypes.array.isRequired,
  }).isRequired,
  actions: PropTypes.array,
  entitiesMode: PropTypes.string
};

LexicalEntryModal.defaultProps = {
  actions: [],
  entitiesMode: 'published',
};

export default connect(state => state.link)(LexicalEntryModal);
