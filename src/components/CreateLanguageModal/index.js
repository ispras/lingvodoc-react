import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal, Divider } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { languagesQuery } from 'graphql/language';
import Translations from 'components/Translation';
import EditLanguageMetadata from 'components/EditLanguageMetadata';
import { getTranslation } from 'api/i18n';

class CreateLanguageModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      translations: [],
      metadata: null
    };

    this.saveLanguage = this.saveLanguage.bind(this);
  }

  saveLanguage() {
    const { createLanguage, parent, actions } = this.props;
    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));

    createLanguage({
      variables: { parent_id: parent.id, translationAtoms, metadata: this.state.metadata },
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
      <Modal dimmer open size="small" closeIcon closeOnDimmerClick={false} onClose={actions.closeModal} className="lingvo-modal2">
        <Modal.Header>{getTranslation('Create language')}</Modal.Header>
        <Modal.Content>
          <h4>{getTranslation('Translations')}</h4>
          <Translations onChange={translations => this.setState({ translations })} />
          <Divider/>
          <EditLanguageMetadata mode='create' onChange={metadata => this.setState({ metadata })} />
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content={getTranslation("Save")} onClick={this.saveLanguage} />
          <Button icon="minus" content={getTranslation("Cancel")} onClick={actions.closeModal} />
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
      mutation createLanguage($parent_id: LingvodocID!, $translationAtoms: [ObjectVal]!, $metadata: ObjectVal) {
        create_language(parent_id: $parent_id, translation_atoms: $translationAtoms, additional_metadata: $metadata) {
          triumph
        }
      }
    `,
    { name: 'createLanguage' }
  )
)(CreateLanguageModal);
