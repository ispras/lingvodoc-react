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
import { compositeIdToString } from 'utils/compositeId';

import { perspectiveColumnsFieldsQuery } from 'components/PhonologyModal/graphql';

const computePhonemicAnalysisMutation = gql`
  mutation computePhonemicAnalysis(
    $perspectiveId: LingvodocID!,
    $textFieldId: LingvodocID!) {
      phonemic_analysis(
        perspective_id: $perspectiveId,
        text_field_id: $textFieldId)
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
      textFieldIdStr: '',
    };

    this.handleCreate = this.handleCreate.bind(this);

    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    const { data: {
      all_fields: allFields,
      perspective: { columns } }} = this.props;

    this.fieldDict = {};
    
    for (const field of allFields)
      this.fieldDict[compositeIdToString(field.id)] = field;

    /* Additional info of fields of our perspective. */

    this.columnFields = columns
      .map(column => this.fieldDict[compositeIdToString(column.field_id)]);

    this.textFields = this.columnFields
      .filter(field => field.data_type === 'Text');

    /* Selecting field with 'transcription' in its name, or the first field. */

    for (const field of this.textFields)
    {
      if (field.translation.toLowerCase().includes('transcription'))
      {
        this.state.textFieldIdStr = compositeIdToString(field.id);
        break;
      }
    }

    if (!this.state.textFieldIdStr && this.textFields.length > 0)
      this.state.textFieldIdStr = compositeIdToString(this.textFields[0].id);
  }

  handleCreate()
  {
    const { perspectiveId, computePhonemicAnalysis } = this.props;
    const textField = this.fieldDict[this.state.textFieldIdStr];

    computePhonemicAnalysis({
      variables: {
        perspectiveId,
        textFieldId: textField.id,
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
        window.logger.err('Failed to compute phomenic analysis!');

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
      value: compositeIdToString(f.id),
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
                  Source text field:
                </List.Item>
                <List.Item>
                  <Select
                    defaultValue={this.state.textFieldIdStr}
                    placeholder="Source text field selection"
                    options={textFieldsOptions}
                    onChange={(e, { value }) => this.setState({ textFieldIdStr: value })}
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
            <Modal.Content>
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
