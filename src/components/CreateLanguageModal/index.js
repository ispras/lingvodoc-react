import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql, gql } from 'react-apollo';
import { Button, Modal } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { languagesQuery } from 'graphql/language';
import Translations from 'components/Translation';

class CreateLanguageModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
    };
    this.saveLanguage = this.saveLanguage.bind(this);
  }

  saveLanguage() {
    const { createLanguage, parent, actions } = this.props;
    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));
    createLanguage({
      variables: { parent_id: parent.id, translationAtoms },
      refetchQueries: [
        {
          query: languagesQuery,
        },
      ],
    }).then(() => {
      actions.closeModal();
    });
  }

  render() {
    const { visible, actions } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal dimmer open size="small">
        <Modal.Header>Create language</Modal.Header>
        <Modal.Content>
          <h4>Translations</h4>
          <Translations onChange={translations => this.setState({ translations })} />
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Save" onClick={this.saveLanguage} />
          <Button icon="minus" content="Cancel" onClick={actions.closeModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

CreateLanguageModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  parent: PropTypes.object,
  createLanguage: PropTypes.func.isRequired,
};

const mapStateToProps = state => ({ parent: state.language.parent, visible: state.language.createVisible });

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch),
});

export default compose(
  connect(mapStateToProps, mapDispatchToProps),
  graphql(
    gql`
      mutation createLanguage($parent_id: LingvodocID!, $translationAtoms: [ObjectVal]!) {
        create_language(parent_id: $parent_id, translation_atoms: $translationAtoms) {
          triumph
        }
      }
    `,
    { name: 'createLanguage' }
  )
)(CreateLanguageModal);
