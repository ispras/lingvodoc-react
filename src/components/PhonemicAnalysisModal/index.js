import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Breadcrumb, Button, Checkbox, Divider, Icon, Input, List, Modal, Select } from 'semantic-ui-react';
import { closeModal } from 'ducks/phonemicAnalysis';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString as id2str } from 'utils/compositeId';

export const perspectiveColumnsFieldsQuery = gql`
  query perspectiveColumnsFields($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
    }
    all_fields {
      id
      translation
      english_translation: translation(locale_id: 2)
      data_type
    }
  }
`;

const computePhonemicAnalysisMutation = gql`
  mutation computePhonemicAnalysis(
    $perspectiveId: LingvodocID!,
    $transcriptionFieldId: LingvodocID!,
    $translationFieldId: LingvodocID!) {
      phonemic_analysis(
        perspective_id: $perspectiveId,
        transcription_field_id: $transcriptionFieldId,
        translation_field_id: $translationFieldId)
      {
        triumph
        entity_count
        result
      }
    }
`;

class PhonemicAnalysisModal extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      entity_count: 0,
      library_present: true,
      result: '',
      transcriptionFieldIdStr: '',
      translationFieldIdStr: '',
    };

    this.handleCreate = this.handleCreate.bind(this);

    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    const { data: {
      all_fields: allFields,
      perspective: { columns } }} = this.props;

    this.fieldDict = {};
    
    for (const field of allFields)
      this.fieldDict[id2str(field.id)] = field;

    /* Additional info of fields of our perspective. */

    this.columnFields = columns
      .map(column => this.fieldDict[id2str(column.field_id)]);

    this.textFields = this.columnFields
      .filter(field => field.data_type === 'Text');

    /* Selecting text fields with 'transcription' and 'translation' in their names, if we have them. */

    for (const field of this.textFields)
    {
      const check_str = field.english_translation.toLowerCase();

      if (!this.state.transcriptionFieldIdStr &&
        check_str.includes('transcription'))

        this.state.transcriptionFieldIdStr = id2str(field.id);

      if (!this.state.translationFieldIdStr &&
        (check_str.includes('translation') || check_str.includes('meaning')))

        this.state.translationFieldIdStr = id2str(field.id);
    }

    /* If we haven't found thus named fields, we try to select the first one. */

    if (this.textFields.length > 0)
    {
      if (!this.state.transcriptionFieldIdStr)
        this.state.transcriptionFieldIdStr = id2str(this.textFields[0].id);

      if (!this.state.translationFieldIdStr)
        this.state.translationFieldIdStr = id2str(this.textFields[0].id);
    }
  }

  handleCreate()
  {
    const { perspectiveId, computePhonemicAnalysis } = this.props;

    const transcriptionField = this.fieldDict[this.state.transcriptionFieldIdStr];
    const translationField = this.fieldDict[this.state.translationFieldIdStr];

    computePhonemicAnalysis({
      variables: {
        perspectiveId,
        transcriptionFieldId: transcriptionField.id,
        translationFieldId: translationField.id,
      },
    }).then(

      ({ data: { phonemic_analysis: { entity_count, result }}}) =>
      {
        this.setState({
          entity_count,
          library_present: true,
          result });
      },

      (error_data) =>
      {
        window.logger.err('Failed to compute phonemic analysis!');

        if (error_data.message ===
          'GraphQL error: Analysis library is absent, please contact system administrator.')

          this.setState({
            library_present: false });
      }
    );
  }

  render()
  {
    const { data } = this.props;
    const { perspective: { columns }, all_fields: allFields } = data;

    const textFieldsOptions = this.textFields.map((f, k) => ({
      key: k,
      value: id2str(f.id),
      text: f.translation,
    }));

    return (
      <div>
        <Modal dimmer open size="large">
          <Modal.Header>Phonemic analysis</Modal.Header>
          <Modal.Content>
            {this.textFields.length > 0 && (
              <List>
                <List.Item>
                  <span style={{marginRight: '0.5em'}}>
                    Source transcription field:
                  </span>
                  <Select
                    defaultValue={this.state.transcriptionFieldIdStr}
                    placeholder="Source transcription field selection"
                    options={textFieldsOptions}
                    onChange={(e, { value }) => this.setState({ transcriptionFieldIdStr: value })}
                  />
                </List.Item>
                <List.Item>
                  <span style={{marginRight: '0.5em'}}>
                    Source translation field:
                  </span>
                  <Select
                    defaultValue={this.state.translationFieldIdStr}
                    placeholder="Source translation field selection"
                    options={textFieldsOptions}
                    onChange={(e, { value }) => this.setState({ translationFieldIdStr: value })}
                  />
                </List.Item>
              </List>
            )}
            {this.textFields.length <= 0 && (
              <span>Perspective does not have any text fields,
                phonemic analysis is impossible.</span>
            )}
            {!this.state.library_present && (
              <List>
                <div style={{color: 'red'}}>
                  Analysis library is absent, please contact system administrator.
                </div>
              </List>
            )}
          </Modal.Content>
          <Modal.Actions>
            <Button
              positive content="Compute" onClick={this.handleCreate}
              disabled={this.textFields.length <= 0}
            />
            <Button negative content="Close" onClick={this.props.closeModal} />
          </Modal.Actions>
          {this.state.library_present && this.state.result.length > 0 && (
            <Modal.Content scrolling style={{maxHeight: '95vh'}}>
              <h3>Analysis results ({this.state.entity_count} text entities analysed):</h3>
              <div><pre>{this.state.result}</pre></div>
            </Modal.Content>
          )}
        </Modal>
      </div>
    );
  }
}

PhonemicAnalysisModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  computePhonemicAnalysis: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.phonemicAnalysis, dispatch => bindActionCreators({ closeModal }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  graphql(perspectiveColumnsFieldsQuery),
  graphql(computePhonemicAnalysisMutation, { name: 'computePhonemicAnalysis' }),
  branch(({ data }) => data.loading, renderNothing),
  withApollo
)(PhonemicAnalysisModal);
