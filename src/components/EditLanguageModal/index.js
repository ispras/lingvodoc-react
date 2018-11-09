import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { Button, Modal, Divider } from 'semantic-ui-react';
import { closeModal } from 'ducks/language';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import gql from 'graphql-tag';
import { graphql, withApollo } from 'react-apollo';
import TranslationGist from '../TranslationGist';
import EditLanguageMetadata from 'components/EditLanguageMetadata';
import { getTranslation } from 'api/i18n';

const getMetadataQuery = gql`
  query GetMetadata($id: LingvodocID!) {
    language(id: $id) {
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

const updateMetadataMutation = gql`
  mutation UpdateMetadata($id: LingvodocID!, $metadata: ObjectVal!) {
    update_language(id: $id, additional_metadata: $metadata) {
      triumph
    }
  }
`;

class EditModal extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      metadata: null,
      languageId: null
    };

    this.fetching = true;
    this.onUpdateMetadata = this.onUpdateMetadata.bind(this);
  }

  onUpdateMetadata(metadata) {
    this.props.updateMetadata({
      variables: {
        id: this.props.language.id,
        metadata: metadata
      }
    }).then(() => {
      this.setState({ metadata });
    });
  }

  componentWillReceiveProps(props) {
    if (props.language && props.language.id != this.state.languageId) {
      this.fetching = true;
      this.props.client.query({
        query: getMetadataQuery,
        variables: { id: props.language.id },
        fetchPolicy: 'no-cache'
      }).then(result => {
        this.fetching = false;
        this.setState({ metadata: result.data.language.additional_metadata });
      },
      () => {
        this.fetching = false;
      });
    }
  }

  render() {
    if (this.fetching) {
      return null;
    }

    const { visible, actions, language } = this.props;

    if (!visible) {
      return null;
    }

    return (
      <Modal dimmer open size="small" closeIcon closeOnDimmerClick={false} onClose={actions.closeModal}>
        <Modal.Header>{getTranslation('Language edit')}</Modal.Header>
        <Modal.Content>
          <h4>{getTranslation('Translations')}</h4>
          <TranslationGist id={language.translation_gist_id} editable />
          <Divider/>
          <EditLanguageMetadata mode='edit' metadata={this.state.metadata} onSave={metadata => this.onUpdateMetadata(metadata)} />
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content={getTranslation("Close")} onClick={actions.closeModal} />
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

export default compose(
  withApollo,
  graphql(updateMetadataMutation, { name: 'updateMetadata' } ),
  connect(mapStateToProps, mapDispatchToProps),
)(EditModal);
