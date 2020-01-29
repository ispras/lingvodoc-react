import React from 'react';
import PropTypes from 'prop-types';
import { compose } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Modal, Select, Grid, Header } from 'semantic-ui-react';
import { closeCreateFieldModal } from 'ducks/fields';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { every } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import Translations from 'components/Translation';
import { fieldsQuery } from 'pages/DictImport';
import { getTranslation } from 'api/i18n';

class CreateFieldModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      translations: [],
      dataTypeId: null,
    };

    this.saveField = this.saveField.bind(this);
    this.onChangeDataType = this.onChangeDataType.bind(this);
    this.isSaveDisabled = this.isSaveDisabled.bind(this);
  }

  onChangeDataType(event, data) {
    this.setState({
      dataTypeId: data.value,
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
      callback } = this.props;

    const translationAtoms = this.state.translations.map(t => ({ locale_id: t.localeId, content: t.content }));
    const dataType = dataTypes.find(d => compositeIdToString(d.id) === this.state.dataTypeId);

    if (!(error || loading) && dataType) {
      createField({
        variables: { data_type_id: dataType.id, translationAtoms },
        refetchQueries: [
          {
            query: fieldsQuery,
          },
        ],
      }).then(
        ({ data }) => {

          if (callback != null)
            callback(data.create_field.field.id);

          actions.closeCreateFieldModal();
        });
    }
  }

  render() {
    const { data: { error, loading, all_data_types: dataTypes }, visible, actions } = this.props;

    if (error || loading || !visible) {
      return null;
    }

    const options = dataTypes.filter(dataType => !dataType.marked_for_deletion).map(dataType => ({
      key: compositeIdToString(dataType.id),
      text: dataType.translation,
      value: compositeIdToString(dataType.id),
    }));

    return (
      <Modal
        closeIcon
        onClose={actions.closeCreateFieldModal}
        dimmer
        open>

        <Modal.Header>{getTranslation('Create field')}</Modal.Header>
        <Modal.Content>
          <Grid centered divided columns={2}>
            <Grid.Column>
              <Header>{getTranslation('Translations')}</Header>
              <Translations onChange={translations => this.setState({ translations })} />
            </Grid.Column>
            <Grid.Column>
              <Header>{getTranslation('Type')}</Header>
              <Select value={this.state.dataTypeId} options={options} onChange={this.onChangeDataType} />
            </Grid.Column>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="plus" content={getTranslation("Save")} onClick={this.saveField} disabled={this.isSaveDisabled()} />
          <Button icon="minus" content={getTranslation("Cancel")} onClick={actions.closeCreateFieldModal} />
        </Modal.Actions>

      </Modal>
    );
  }
}

CreateFieldModal.propTypes = {
  actions: PropTypes.shape({
    closeModal: PropTypes.func,
  }).isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    all_data_types: PropTypes.array,
  }).isRequired,
  visible: PropTypes.bool.isRequired,
  createField: PropTypes.func.isRequired,
};

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ closeCreateFieldModal }, dispatch),
});

export default compose(
  connect(state => state.fields, mapDispatchToProps),
  graphql(gql`
    query DataTypes {
      all_data_types {
        id
        translation
        marked_for_deletion
      }
    }
  `),
  graphql(
    gql`
      mutation createField($data_type_id: LingvodocID!, $translationAtoms: [ObjectVal]!) {
        create_field(data_type_translation_gist_id: $data_type_id, translation_atoms: $translationAtoms) {
          field { id }
          triumph
        }
      }
    `,
    { name: 'createField' }
  )
)(CreateFieldModal);
