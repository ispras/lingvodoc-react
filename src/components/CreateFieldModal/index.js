import React from "react";
import { connect } from "react-redux";
import { Button, Grid, Header, Modal, Select } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { every } from "lodash";
import PropTypes from "prop-types";
import { compose } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import Translations from "components/Translation";
import { closeCreateFieldModal } from "ducks/fields";
import TranslationContext from "Layout/TranslationContext";
import { fieldsQuery } from "pages/DictImport";
import { compositeIdToString } from "utils/compositeId";

class CreateFieldModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
      dataTypeId: null
    };

    this.saveField = this.saveField.bind(this);
    this.onChangeDataType = this.onChangeDataType.bind(this);
    this.isSaveDisabled = this.isSaveDisabled.bind(this);
  }

  onChangeDataType(event, data) {
    this.setState({
      dataTypeId: data.value
    });
  }

  isSaveDisabled() {
    return (
      this.state.translations.length === 0 ||
      every(this.state.translations, translation => translation.content.length === 0) ||
      this.state.dataTypeId === null
    );
  }

  saveField() {
    const {
      data: { error, loading, all_data_types: dataTypes },
      createField,
      actions,
      callback: { callback, parallel}
    } = this.props;

    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));
    const dataType = dataTypes.find(d => compositeIdToString(d.id) === this.state.dataTypeId);

    if (!(error || loading) && dataType) {
      createField({
        variables: { data_type_id: dataType.id, translationAtoms },
        refetchQueries: [
          {
            query: fieldsQuery
          }
        ]
      }).then(({ data }) => {
        if (callback != null) {
          callback(data.create_field.field.id);
        }

        actions.closeCreateFieldModal();
      });
    }
  }

  render() {
    if (!this.props.visible) {
      return null;
    }

    const {
      data: { error, loading, all_data_types: dataTypes },
      actions
    } = this.props;
    if (error || loading) {
      return null;
    }

    const options = dataTypes
      .filter(dataType => !dataType.marked_for_deletion)
      .map(dataType => ({
        key: compositeIdToString(dataType.id),
        text: T(dataType.translations),
        value: compositeIdToString(dataType.id)
      }));

    return (
      <Modal closeIcon onClose={actions.closeCreateFieldModal} dimmer open className="lingvo-modal2">
        <Modal.Header>{this.context("Create field")}</Modal.Header>
        <Modal.Content>
          <Grid centered divided columns={2}>
            <Grid.Column>
              <Header>{this.context("Translations")}</Header>
              <Translations onChange={translations => this.setState({ translations })} />
            </Grid.Column>
            <Grid.Column>
              <Header>{this.context("Type")}</Header>
              <Select value={this.state.dataTypeId} options={options} onChange={this.onChangeDataType} />
            </Grid.Column>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={this.context("Save")}
            onClick={this.saveField}
            disabled={this.isSaveDisabled()}
            className="lingvo-button-violet"
          />
          <Button
            content={this.context("Cancel")}
            onClick={actions.closeCreateFieldModal}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

CreateFieldModal.contextType = TranslationContext;

CreateFieldModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func
  }).isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_data_types: PropTypes.array
  }),
  visible: PropTypes.bool.isRequired,
  createField: PropTypes.func.isRequired,
  parallel: PropTypes.bool
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeCreateFieldModal }, dispatch)
});

export default compose(
  connect(state => state.fields, mapDispatchToProps),
  graphql(
    gql`
      query DataTypes {
        all_data_types {
          id
          translations
          marked_for_deletion
        }
      }
    `,
    { skip: props => !props.visible }
  ),
  graphql(
    gql`
      mutation createField($data_type_id: LingvodocID!, $translationAtoms: [ObjectVal]!, $parallel: Boolean) {
        create_field(data_type_translation_gist_id: $data_type_id, translation_atoms: $translationAtoms, parallel: $parallel) {
          field {
            id
          }
          triumph
        }
      }
    `,
    { name: "createField" }
  )
)(CreateFieldModal);
