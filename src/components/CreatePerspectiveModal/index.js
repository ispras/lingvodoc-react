import React from "react";
import { connect } from "react-redux";
import { Button, Grid, Header, Modal, Select } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { fromJS, List, Map } from "immutable";
import { every } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Translations from "components/Translation";
import { closeModal as closeCreatePerspectiveModal } from "ducks/createPerspective";
import TranslationContext from "Layout/TranslationContext";
import Fields from "pages/CreateDictionary/Fields";
import { queryAvailablePerspectives as queryPerspectivePathAvailable } from "pages/Perspective/PerspectivePath";

const queryAvailablePerspectives = gql`
  query availablePerspectives($dictionary_id: LingvodocID!) {
    dictionary(id: $dictionary_id) {
      id
      category
      perspectives {
        id
        translations
      }
    }
  }
`;

class CreatePerspectiveModal extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      translations: [],
      fields: []
    };

    this.savePerspective = this.savePerspective.bind(this);
    this.isSaveDisabled = this.isSaveDisabled.bind(this);
  }

  isSaveDisabled() {
    return (
      this.state.translations.length === 0 ||
      every(this.state.translations, translation => translation.content.length === 0)
    );
  }

  savePerspective() {
    const {
      createPerspective,
      closeCreatePerspectiveModal,
      dictionaryId,
      data: {
        dictionary: { perspectives }
      }
    } = this.props;

    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));

    const fields = this.state.fields.map(field_info =>
      field_info.link_id != null ? { ...field_info, link_id: perspectives[field_info.link_id].id } : field_info
    );

    createPerspective({
      variables: {
        parentId: dictionaryId,
        translationAtoms,
        fields
      },
      refetchQueries: [
        {
          query: queryPerspectivePathAvailable,
          variables: { dictionary_id: dictionaryId }
        }
      ]
    }).then(({ data }) => {
      closeCreatePerspectiveModal();

      window.logger.suc(this.context("Successfully created perspective."));
    });
  }

  render() {
    const { closeCreatePerspectiveModal, visible, data } = this.props;

    if (!visible || data.loading || data.error) {
      return null;
    }

    const { category, perspectives } = data.dictionary;

    const perspective_info_list = perspectives.map((perspective, index) => ({
      index,
      id: perspective.id,
      name: T(perspective.translations)
    }));

    return (
      <Modal closeIcon onClose={closeCreatePerspectiveModal} dimmer open className="lingvo-modal2">
        <Modal.Header>{this.context("Create perspective")}</Modal.Header>

        <Modal.Content>
          <Header>{this.context("Perspective names")}</Header>
          <Translations onChange={translations => this.setState({ translations })} />

          <Header>{this.context("Perspective fields")}</Header>
          <Fields
            mode={category == 0 ? "dictionary" : "corpus"}
            perspectives={perspective_info_list}
            onChange={f =>
              this.setState({
                ...this.state,
                fields: f
              })
            }
          />
        </Modal.Content>

        <Modal.Actions>
          <Button
            content={this.context("Save")}
            onClick={this.savePerspective}
            disabled={this.isSaveDisabled()}
            className="lingvo-button-violet"
          />
          <Button
            content={this.context("Cancel")}
            onClick={closeCreatePerspectiveModal}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

CreatePerspectiveModal.contextType = TranslationContext;

CreatePerspectiveModal.propTypes = {
  closeCreatePerspectiveModal: PropTypes.func.isRequired,
  visible: PropTypes.bool.isRequired
};

export default compose(
  connect(
    state => state.createPerspective,
    dispatch => bindActionCreators({ closeCreatePerspectiveModal }, dispatch)
  ),

  graphql(queryAvailablePerspectives, {
    name: "data",
    options: props => ({ variables: { dictionary_id: props.dictionaryId } }),
    skip: ({ dictionaryId }) => !dictionaryId
  }),

  graphql(
    gql`
      mutation createPerspective($parentId: LingvodocID!, $translationAtoms: [ObjectVal]!, $fields: [ObjectVal]) {
        create_perspective(parent_id: $parentId, translation_atoms: $translationAtoms, fields: $fields) {
          triumph
        }
      }
    `,
    { name: "createPerspective" }
  )
)(CreatePerspectiveModal);
