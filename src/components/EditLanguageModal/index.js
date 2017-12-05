import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { Button, Modal, Dropdown } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';

import { compositeIdToString } from '../../utils/compositeId';

import TranslationGist from '../TranslationGist';

import { languagesQuery } from '../../graphql/language';

class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const {
      visible, data, actions, edit, create,
    } = this.props;

    if (data.loading || (!edit && !create) || !visible) {
      return null;
    }

    return (
      <Modal dimmer open size="small">
        <Modal.Header>Language edit</Modal.Header>
        <Modal.Content>
          {/* List of translations */}
          <h4>Translations</h4>
          {edit && <TranslationGist id={edit.translation_gist_id} editable />}
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Close" onClick={actions.closeModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    language_tree: PropTypes.array,
  }).isRequired,
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  edit: PropTypes.object,
  create: PropTypes.object,
};

const mapStateToProps = state => state.language;

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(gql`
    query Languages {
      languages {
        id
        parent_id
        translation
        created_at
        translation_gist_id
      }
    }
  `),
  graphql(
    gql`
      mutation updateParentLanguage($id: [Int]!, $parent_id: [Int]!) {
        update_language(id: $id, parent_id: $parent_id) {
          language {
            id
            translation
            translation_gist_id
          }
        }
      }
    `,
    { name: 'updateParentLanguage' }
  )
)(EditModal);
