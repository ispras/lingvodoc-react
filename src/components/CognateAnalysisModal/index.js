import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Breadcrumb, Button, Checkbox, Dimmer, Divider, Header, Icon, Input, List, Loader, Modal, Select } from 'semantic-ui-react';
import { closeModal } from 'ducks/cognateAnalysis';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString } from 'utils/compositeId';

export const cognateAnalysisDataQuery = gql`
  query cognateAnalysisData($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
      tree {
        id
        translation
      }
    }
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
    dictionaries(published: true) {
      id
      parent_id
      perspectives {
        id
        parent_id
        translation
        columns {
          id
          field_id
          parent_id
          self_id
          position
        }
      }
      translation
    }
  }
`;

const computeCognateAnalysisMutation = gql`
  mutation computeCognateAnalysis(
    $groupFieldId: LingvodocID!,
    $perspectiveInfoList: [[LingvodocID]]!) {
      cognate_analysis(
        group_field_id: $groupFieldId,
        perspective_info_list: $perspectiveInfoList)
      {
        triumph
        dictionary_count
        group_count
        text_count
        result
      }
    }
`;

function equalIds(id_a, id_b) {
  return id_a[0] == id_b[0] && id_a[1] == id_b[1]; }

class CognateAnalysisModal extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      initialized: false,
      dictionary_count: 0,
      group_count: 0,
      text_count: 0,
      library_present: true,
      result: '',
      textFieldIdStr: '',
      textFieldIdStrList: [],
      perspectiveSelectionList: [],
      groupFieldIdStr: '',
      computing: false,
    };

    this.handleCreate = this.handleCreate.bind(this);
    this.initializeData = this.initializeData.bind(this);
    this.initializePerspectiveList = this.initializePerspectiveList.bind(this);
  }

  /* Initializes data of the cognate analysis dialog. */
  initializeData()
  {
    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    const { data: {
      all_fields: allFields,
      dictionaries,
      perspective,
      perspective: { columns } }} = this.props;

    this.fieldDict = {};
    
    for (const field of allFields)
      this.fieldDict[compositeIdToString(field.id)] = field;

    /* Additional info of fields of our perspective. */

    this.columnFields = columns
      .map(column => this.fieldDict[compositeIdToString(column.field_id)]);

    this.groupFields = this.columnFields
      .filter(field => field.data_type === 'Grouping Tag');

    /* Selecting default grouping field with 'cognate' in its name, or the first field. */

    var groupFieldIdStr = '';

    for (const field of this.groupFields)
    {
      const check_str = field.translation.toLowerCase();

      if (check_str.includes('cognate') || check_str.includes('когнат'))
      {
        groupFieldIdStr = compositeIdToString(field.id);
        break;
      }
    }

    if (!groupFieldIdStr && this.groupFields.length > 0)
      groupFieldIdStr = compositeIdToString(this.groupFields[0].id);

    /* Finding dictionary of our perspective. */

    this.dictionary = null;

    for (const dictionary of dictionaries)
      if (equalIds(dictionary.id, perspective.parent_id))
      {
        this.dictionary = dictionary;
        break;
      }

    /* If we have selected a default cognate grouping field, we initialize perspectives available for
     * analysis. */

    const set_state = { groupFieldIdStr, initialized: true };

    if (groupFieldIdStr)
    {
      const {textFieldIdStrList, perspectiveSelectionList} =
        this.initializePerspectiveList(groupFieldIdStr);

      set_state.textFieldIdStrList = textFieldIdStrList;
      set_state.perspectiveSelectionList = perspectiveSelectionList;
    }

    this.setState(set_state);
  }

  /* Initializes list of perspectives available for analysis depending on currently selected
   * grouping field. */
  initializePerspectiveList(groupFieldIdStr)
  {
    const { data: { dictionaries }} = this.props;

    this.perspective_list = [];

    const textFieldIdStrList = [];
    const perspectiveSelectionList = [];

    /* Looking through all published dictionaries for siblings of the dictionary of our perspective. */

    for (const dictionary of dictionaries)

      if (equalIds(dictionary.parent_id, this.dictionary.parent_id))

        for (var i = 0; i < dictionary.perspectives.length; i++)

          if (dictionary.perspectives[i].columns.findIndex(
            column => compositeIdToString(column.field_id) == groupFieldIdStr) != -1)
          {
            const textFields =

              dictionary.perspectives[i].columns
                .map(column => this.fieldDict[compositeIdToString(column.field_id)])
                .filter(field => field.data_type === 'Text');

            /* Checking all sibling perspective with the chosen cognate field which have at least one text
             * field. */

            if (textFields.length <= 0)
              continue;

            const textFieldsOptions =

              textFields.map((f, k) => ({
                key: k,
                value: compositeIdToString(f.id),
                text: f.translation,
              }));

            this.perspective_list.push({
              dictionary,
              perspective: dictionary.perspectives[i],
              textFields,
              textFieldsOptions})

            /* Selecting default text field with 'transcription' in its name, or the first field. */

            var textFieldIdStr = '';

            for (const field of textFields)
            {
              const check_str = field.translation.toLowerCase();

              if (check_str.includes('transcription') || check_str.includes('транскрипция'))
              {
                textFieldIdStr = compositeIdToString(field.id);
                break;
              }
            }

            textFieldIdStrList.push(textFieldIdStr);
            perspectiveSelectionList.push(true);
          }

    /* Initializing and then returning perspective selection state values. */

    this.state.textFieldIdStrList = textFieldIdStrList;
    this.state.perspectiveSelectionList = perspectiveSelectionList;

    return {
      textFieldIdStrList,
      perspectiveSelectionList };
  }

  handleCreate()
  {
    const { perspectiveId, computeCognateAnalysis } = this.props;

    const groupField = this.fieldDict[this.state.groupFieldIdStr];

    const perspectiveInfoList = this.perspective_list

      .map(({perspective}, index) => [perspective.id,
        this.fieldDict[this.state.textFieldIdStrList[index]].id])
      
      .filter((perspective_info, index) =>
        (this.state.perspectiveSelectionList[index]));

    this.setState({
      computing: true });

    computeCognateAnalysis({
      variables: {
        groupFieldId: groupField.id,
        perspectiveInfoList: perspectiveInfoList,
      },
    }).then(

      ({ data: { cognate_analysis: {
        dictionary_count, group_count, text_count, result }}}) =>
      {
        this.setState({
          dictionary_count,
          group_count,
          text_count,
          library_present: true,
          result,
          computing: false });
      },

      (error_data) =>
      {
        window.logger.err('Failed to compute cognate analysis!');

        if (error_data.message ===
          'GraphQL error: Analysis library is absent, please contact system administrator.')

          this.setState({
            library_present: false });

        this.setState({
          computing: false });
      }
    );
  }

  componentDidMount()
  {
    if (!this.props.data.loading && !this.state.initialized)
      this.initializeData();
  }

  componentDidUpdate()
  {
    if (!this.props.data.loading && !this.state.initialized)
      this.initializeData();
  }

  render()
  {
    const { data } = this.props;

    if (data.loading || !this.state.initialized)
    {
      return (
        <Dimmer active={data.loading} inverted>
          <Loader>Loading</Loader>
        </Dimmer>
      );
    }

    const { perspective: { columns, tree }, all_fields: allFields } = data;

    const groupFieldsOptions = this.groupFields.map((f, k) => ({
      key: k,
      value: compositeIdToString(f.id),
      text: f.translation,
    }));

    return (
      <div>
        <Modal dimmer open size="large">
          <Modal.Header>Cognate analysis</Modal.Header>
          <Modal.Content>
            <Header as="h2">
              <Breadcrumb
                icon="right angle"
                sections={tree.slice(2).reverse().map(e => ({
                  key: e.id, content: e.translation, link: false }))}
              />
            </Header>
            {this.groupFields.length > 0 && (
              <List>
                <List.Item>
                  Grouping field:
                </List.Item>
                <List.Item>
                  <Select
                    defaultValue={this.state.groupFieldIdStr}
                    placeholder="Grouping field selection"
                    options={groupFieldsOptions}
                    onChange={(e, { value }) => {
                      if (value != this.state.groupFieldIdStr)
                      {
                        this.setState({
                          groupFieldIdStr: value,
                          ...this.initializePerspectiveList(value) });
                      }
                    }}
                  />
                </List.Item>
              </List>
            )}
            {this.groupFields.length <= 0 && (
              <span>Perspective does not have any grouping fields,
                phonemic analysis is impossible.</span>
            )}
            <div style={{marginTop: '1.5em'}}>
            {this.perspective_list.length > 1 && map(this.perspective_list,
              ({dictionary, perspective, textFields, textFieldsOptions}, index) => (
                <List>
                  <List.Item>
                  <Breadcrumb
                    style={this.state.perspectiveSelectionList[index] ? {} : {opacity: 0.5}}
                    icon="right angle"
                    sections={[dictionary, perspective].map(e => ({
                      key: e.id, content: e.translation, link: false }))}
                  />
                  <Checkbox
                    style={{marginLeft: '0.5em', verticalAlign: 'middle'}}
                    checked={this.state.perspectiveSelectionList[index]}
                    onChange={(e, { checked }) => {
                      const perspectiveSelectionList = this.state.perspectiveSelectionList;
                      perspectiveSelectionList[index] = checked;
                      this.setState({ perspectiveSelectionList });}}
                  />
                  </List.Item>
                  {this.state.perspectiveSelectionList[index] && (
                    <List.Item>
                    <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
                      Source text field:
                    </span>
                    <Select
                      disabled={!this.state.perspectiveSelectionList[index]}
                      defaultValue={this.state.textFieldIdStrList[index]}
                      placeholder="Source text field selection"
                      options={textFieldsOptions}
                      onChange={(e, { value }) => {
                        const textFieldIdStrList = this.state.textFieldIdStrList;
                        textFieldIdStrList[index] = value;
                        this.setState({ textFieldIdStrList });}}
                    />
                    </List.Item>
                  )}
                </List>
            ))}
            {this.perspective_list.length <= 1 && (
              <span>Dictionary group doesn't have multiple dictionaries with selected
                cognate grouping field present, cognate analysis is impossible.</span>
            )}
            </div>
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
              positive
              content={this.state.computing ?
                <span>Computing... <Icon name="spinner" loading /></span> :
                "Compute"}
              onClick={this.handleCreate}
              disabled={
                this.perspective_list.length <= 1 ||
                !this.state.perspectiveSelectionList.some(enabled => enabled) ||
                this.state.computing}
            />
            <Button negative content="Close" onClick={this.props.closeModal} />
          </Modal.Actions>
          {this.state.library_present && this.state.result.length > 0 && (
            <Modal.Content>
              <h3>Analysis results
                ({this.state.dictionary_count} dictionaries, {this.state.group_count} cognate groups and {this.state.text_count} transcriptions analysed):</h3>
              <div><pre>{this.state.result}</pre></div>
            </Modal.Content>
          )}
        </Modal>
      </div>
    );
  }
}

CognateAnalysisModal.propTypes = {
  perspectiveId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  closeModal: PropTypes.func.isRequired,
  computeCognateAnalysis: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.cognateAnalysis, dispatch => bindActionCreators({ closeModal }, dispatch)),
  branch(({ visible }) => !visible, renderNothing),
  graphql(cognateAnalysisDataQuery),
  graphql(computeCognateAnalysisMutation, { name: 'computeCognateAnalysis' }),
  withApollo
)(CognateAnalysisModal);
