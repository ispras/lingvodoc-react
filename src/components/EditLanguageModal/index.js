import React from "react";
import { connect } from "react-redux";
import { Button, Divider, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import EditLanguageMetadata from "components/EditLanguageMetadata";
import { closeModal } from "ducks/language";
import TranslationContext from "Layout/TranslationContext";

import TranslationGist from "../TranslationGist";

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

const updateAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $atom_id: LingvodocID, $locale_id: Int!, $content: String!) {
    update_language_atom(id: $id, atom_id: $atom_id, locale_id: $locale_id, content: $content) {
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
    this.props
      .updateMetadata({
        variables: {
          id: this.props.language.id,
          metadata: metadata
        }
      })
      .then(() => {
        this.setState({ metadata });
      });
  }

  componentWillReceiveProps(props) {
    if (props.language && props.language.id != this.state.languageId) {
      this.fetching = true;
      this.props.client
        .query({
          query: getMetadataQuery,
          variables: { id: props.language.id },
          fetchPolicy: "no-cache"
        })
        .then(
          result => {
            this.fetching = false;
            this.setState({ metadata: result.data.language.additional_metadata });
          },
          () => {
            this.fetching = false;
          }
        );
    }
  }

  render() {
    if (this.fetching) {
      return null;
    }

    const { visible, actions, language, updateAtomMutation } = this.props;
    if (!visible) {
      return null;
    }

    return (
      <Modal
        dimmer
        open
        size="small"
        closeIcon
        closeOnDimmerClick={false}
        onClose={actions.closeModal}
        className="lingvo-modal2"
      >
        <Modal.Header>{this.context("Language edit")}</Modal.Header>
        <Modal.Content>
          <h4>{this.context("Translations")}</h4>
          <TranslationGist
            objectId={language.id}
            id={language.translation_gist_id}
            editable
            updateAtomMutation={updateAtomMutation}
          />
          <Divider />
          <EditLanguageMetadata
            mode="edit"
            metadata={this.state.metadata}
            onSave={metadata => this.onUpdateMetadata(metadata)}
          />
        </Modal.Content>
        <Modal.Actions>
          <Button content={this.context("Close")} onClick={actions.closeModal} className="lingvo-button-basic-black" />
        </Modal.Actions>
      </Modal>
    );
  }
}

EditModal.contextType = TranslationContext;

EditModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  language: PropTypes.object
};

const mapStateToProps = state => ({ language: state.language.language, visible: state.language.editVisible });

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeModal }, dispatch)
});

export default compose(
  withApollo,
  graphql(updateMetadataMutation, { name: "updateMetadata" }),
  graphql(updateAtomMutation, { name: "updateAtomMutation" }),
  connect(mapStateToProps, mapDispatchToProps)
)(EditModal);
