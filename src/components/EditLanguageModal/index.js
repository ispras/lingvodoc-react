import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Button, Modal } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import TranslationGist from '../TranslationGist';

class EditModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { visible, actions, language } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal dimmer open size="small">
        <Modal.Header>Language edit</Modal.Header>
        <Modal.Content>
          {/* List of translations */}
          <h4>Translations</h4>
          <TranslationGist id={language.translation_gist_id} editable />
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Close" onClick={actions.closeModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

EditModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  language: PropTypes.object,
};

const mapStateToProps = state => ({ language: state.language.language, visible: state.language.editVisible });

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(connect(mapStateToProps, mapDispatchToProps))(EditModal);
