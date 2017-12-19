import React from 'react';
import PropTypes from 'prop-types';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import { Segment, Checkbox, Button, Modal, Tab } from 'semantic-ui-react';
import { closeModal } from 'ducks/directedLink';
import { bindActionCreators } from 'redux';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { queryPerspective, LexicalEntryViewByIds } from 'components/PerspectiveView';
import { languageTreeSourceQuery, publishMutation, acceptMutation } from './graphql';
import buildPartialLanguageTree from 'components/GroupingTagModal/partialTree';
import Tree from 'components/GroupingTagModal/Tree';

const ModalContentWrapper = styled('div')`min-height: 60vh;`;

class DirectedLinkModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.changePublished = this.changePublished.bind(this);
    this.changeAccepted = this.changeAccepted.bind(this);
  }

  changePublished(entity, published) {
    const { publish, lexicalEntry, entitiesMode } = this.props;

    publish({
      variables: { id: entity.id, published },
      refetchQueries: [
        {
          // XXX: Expensive operation!
          query: queryPerspective,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode,
          },
        },
      ],
    });
  }

  changeAccepted(entity, accepted) {
    const { accept, lexicalEntry, entitiesMode } = this.props;

    accept({
      variables: { id: entity.id, accepted },
      refetchQueries: [
        {
          // XXX: Expensive operation!
          query: queryPerspective,
          variables: {
            id: lexicalEntry.parent_id,
            entitiesMode,
          },
        },
      ],
    });
  }

  render() {
    const {
      data, visible, lexicalEntry, fieldId, entitiesMode, mode,
    } = this.props;

    if (!visible) {
      return null;
    }

    const {
      loading,
      error,
      language_tree: allLanguages,
      dictionaries: allDictionaries,
      perspectives: allPerspectives,
    } = data;

    const entities = lexicalEntry.contains.filter(e => isEqual(e.field_id, fieldId));
    const lexicalEntries = entities.map(e => ({ id: e.link_id, parent_id: e.additional_metadata.link_perspective_id }));

    const resultsTree = buildPartialLanguageTree({
      lexicalEntries,
      allLanguages,
      allDictionaries,
      allPerspectives,
    });

    if (loading || error) {
      return null;
    }

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>Directed Link {lexicalEntry.id}</Modal.Header>
          <Modal.Content>
            <ModalContentWrapper>
              <Tree resultsTree={resultsTree} TableComponent={LexicalEntryViewByIds} />;
            </ModalContentWrapper>
          </Modal.Content>
          <Modal.Actions>
            <Button icon="minus" content="Cancel" onClick={this.props.closeModal} />
          </Modal.Actions>
        </Modal>
      </div>
    );
  }
}

DirectedLinkModal.propTypes = {
  data: PropTypes.shape({
    language_tree: PropTypes.array,
    dictionaries: PropTypes.array,
    perspectives: PropTypes.array,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  lexicalEntry: PropTypes.object,
  fieldId: PropTypes.array,
  mode: PropTypes.string.isRequired,
  entitiesMode: PropTypes.string.isRequired,
  closeModal: PropTypes.func.isRequired,
  publish: PropTypes.func.isRequired,
  accept: PropTypes.func.isRequired,
};

DirectedLinkModal.defaultProps = {
  lexicalEntry: null,
  fieldId: null,
};

export default compose(
  connect(state => state.directedLink, dispatch => bindActionCreators({ closeModal }, dispatch)),
  graphql(languageTreeSourceQuery),
  graphql(publishMutation, { name: 'publish' }),
  graphql(acceptMutation, { name: 'accept' })
)(DirectedLinkModal);
