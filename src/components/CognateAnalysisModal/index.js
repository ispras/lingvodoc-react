import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Breadcrumb, Button, Checkbox, Dimmer, Divider, Header, Icon, Input, List, Loader, Modal, Select } from 'semantic-ui-react';
import Plot from 'react-plotly.js';

import { closeModal } from 'ducks/cognateAnalysis';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString as id2str } from 'utils/compositeId';
import { checkLanguageId } from 'pages/Home/components/LangsNav';

const cognateAnalysisDataQuery = gql`
  query cognateAnalysisData($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translation
      columns {
        field_id
      }
      tree {
        id
        translation
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

/* 
 * NOTE: We would be ok with only 'field_id' in 'columns', but changing it to fields which are not the
 * same as fields in 'column' subquery in 'queryPerspective1' query from PerspectiveView causes that query
 * to invalidate on fetching through this query data containing already loaded perspective data, and that
 * either causes errors or requires unnecessary refetching.
 */
const languageQuery = gql`
  query language($languageId: LingvodocID!) {
    language(id: $languageId) {
      id
      dictionaries(deleted: false, published_and_limited_only: true) {
        id
        translation
        status
        perspectives {
          id
          translation
          status
          columns {
            id
            field_id
            parent_id
            self_id
            position
          }
        }
      }
      languages(deleted: false) {
        id
        translation
      }
    }
  }
`;

const computeCognateAnalysisMutation = gql`
  mutation computeCognateAnalysis(
    $groupFieldId: LingvodocID!,
    $baseLanguageId: LingvodocID!,
    $perspectiveInfoList: [[LingvodocID]]!,
    $mode: String,
    $debugFlag: Boolean) {
      cognate_analysis(
        base_language_id: $baseLanguageId,
        group_field_id: $groupFieldId,
        perspective_info_list: $perspectiveInfoList,
        mode: $mode,
        figure_flag: true,
        debug_flag: $debugFlag)
      {
        triumph
        dictionary_count
        group_count
        not_enough_count
        transcription_count
        translation_count
        result
        xlsx_url
        figure_url
        minimum_spanning_tree
        embedding_2d
        embedding_3d
        perspective_name_list
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
      not_enough_count: 0,
      transcription_count: 0,
      translation_count: 0,

      library_present: true,

      result: '',
      xlsx_url: '',
      figure_url: '',

      minimum_spanning_tree: [],
      embedding_2d: [],
      embedding_3d: [],
      perspective_name_list: [],

      plotly_data: [],
      plotly_3d_data: [],

      x_range: null,
      y_range: null,
      z_range: null,

      x_span: null,
      y_span: null,
      z_span: null,

      transcriptionFieldIdStrList: [],
      translationFieldIdStrList: [],
      perspectiveSelectionList: [],
      groupFieldIdStr: '',

      debugFlag: false,

      computing: false,
    };

    this.initialize = this.initialize.bind(this);
    this.initPerspectiveData = this.initPerspectiveData.bind(this);
    this.initPerspectiveList = this.initPerspectiveList.bind(this);

    this.handleCreate = this.handleCreate.bind(this);
  }

  componentDidMount()
  {
    this.initialize();
  }

  async initialize()
  {
    const { client, perspectiveId } = this.props;

    const { data: {
      all_fields: allFields,
      perspective: { columns, tree } }} =
        
      await client.query({
        query: cognateAnalysisDataQuery,
        variables: { perspectiveId },
      });

    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    this.fieldDict = {};
    
    for (const field of allFields)
      this.fieldDict[id2str(field.id)] = field;

    /* Additional info of fields of our perspective. */

    this.columnFields = columns
      .map(column => this.fieldDict[id2str(column.field_id)]);

    this.groupFields = this.columnFields
      .filter(field => field.data_type === 'Grouping Tag');

    /* Selecting default grouping field with 'cognate' in its name, or the first field. */

    var groupFieldIdStr = '';

    for (const field of this.groupFields)
    {
      if (field.english_translation.toLowerCase().includes('cognate'))
      {
        groupFieldIdStr = id2str(field.id);
        break;
      }
    }

    if (!groupFieldIdStr && this.groupFields.length > 0)
      groupFieldIdStr = id2str(this.groupFields[0].id);

    this.state.groupFieldIdStr = groupFieldIdStr;

    /* Finding the root language of the language group we are to perform cognate analysis in. */

    for (var i = 0; i < tree.length; i++)
    {
      if (checkLanguageId(tree[i].id))
      {
        this.treePath = tree.slice(i, tree.length).reverse();
        this.baseLanguageId = tree[i].id;
        break;
      }
    }

    /* Recursively getting data of perspectives available for analysis. */

    this.available_list = [];
    await this.initPerspectiveData(this.baseLanguageId, []);

    /* If we have selected a default cognate grouping field, we initialize perspectives available for
     * analysis. */

    const set_state = { groupFieldIdStr, initialized: true };

    if (groupFieldIdStr)
    {
      const {
        transcriptionFieldIdStrList,
        translationFieldIdStrList,
        perspectiveSelectionList } =

        this.initPerspectiveList(groupFieldIdStr);

      set_state.transcriptionFieldIdStrList = transcriptionFieldIdStrList;
      set_state.translationFieldIdStrList = translationFieldIdStrList;
      set_state.perspectiveSelectionList = perspectiveSelectionList;
    }

    this.setState(set_state);
  }

  /* Recursively initializes data of perspectives available for the cognate analysis dialog. */
  async initPerspectiveData(languageId, treePathList)
  {
    const { client } = this.props;

    const { data: {
      language: { dictionaries, languages } }} =

      await client.query({
        query: languageQuery,
        variables: { languageId },
      });

    /* We need perspectives containing at least one grouping and one text field. */

    for (const dictionary of dictionaries)
      for (const perspective of dictionary.perspectives)
      {
        var group_flag = false;
        var text_flag = false;

        for (const column of perspective.columns)
        {
          const field = this.fieldDict[id2str(column.field_id)];

          if (field.data_type === 'Grouping Tag')
            group_flag = true;

          if (field.data_type === 'Text')
            text_flag = true;
        }

        if (group_flag && text_flag)

          this.available_list.push([
            treePathList.concat([dictionary, perspective]),
            perspective]);
      }

    /* Also looking through sublanguages. */

    for (const language of languages)

      await this.initPerspectiveData(
        language.id, treePathList.concat([language]));
  }

  /* Initializes list of perspectives available for analysis depending on currently selected
   * grouping field. */
  initPerspectiveList(groupFieldIdStr)
  {
    this.perspective_list = [];

    const transcriptionFieldIdStrList = [];
    const translationFieldIdStrList = [];

    const perspectiveSelectionList = [];

    /* Looking through all published dictionaries for siblings of the dictionary of our perspective. */

    for (const [treePathList, perspective] of this.available_list)
    {
      const textFields =

        perspective.columns
          .map(column => this.fieldDict[id2str(column.field_id)])
          .filter(field => field.data_type === 'Text');

      const textFieldsOptions =

        textFields.map((f, k) => ({
          key: k,
          value: id2str(f.id),
          text: f.translation,
        }));

      this.perspective_list.push({
        treePathList,
        perspective,
        textFieldsOptions})

      /* Selecting text fields with 'transcription' and 'translation' in their names, if we have them. */

      var transcriptionFieldIdStr = '';
      var translationFieldIdStr = '';

      for (const field of textFields)
      {
        const check_str = field.english_translation.toLowerCase();

        if (!transcriptionFieldIdStr &&
          check_str.includes('transcription'))

          transcriptionFieldIdStr = id2str(field.id);

        if (!translationFieldIdStr &&
          (check_str.includes('translation') || check_str.includes('meaning')))

          translationFieldIdStr = id2str(field.id);
      }

      /* If we haven't found thus named fields, we try to select the first one. */

      if (textFields.length > 0)
      {
        if (!transcriptionFieldIdStr)
          transcriptionFieldIdStr = id2str(textFields[0].id);

        if (!translationFieldIdStr)
          translationFieldIdStr = id2str(textFields[0].id);
      }

      transcriptionFieldIdStrList.push(transcriptionFieldIdStr);
      translationFieldIdStrList.push(translationFieldIdStr);

      perspectiveSelectionList.push(true);
    }

    /* Initializing and then returning perspective selection state values. */

    this.state.transcriptionFieldIdStrList = transcriptionFieldIdStrList;
    this.state.translationFieldIdStrList = translationFieldIdStrList;

    this.state.perspectiveSelectionList = perspectiveSelectionList;

    return {
      transcriptionFieldIdStrList,
      translationFieldIdStrList,
      perspectiveSelectionList };
  }

  handleCreate()
  {
    const {
      perspectiveId,
      computeCognateAnalysis } = this.props;

    const groupField = this.fieldDict[this.state.groupFieldIdStr];

    const perspectiveInfoList = this.perspective_list

      .map(({perspective}, index) => [perspective.id,
        this.fieldDict[this.state.transcriptionFieldIdStrList[index]].id,
        this.fieldDict[this.state.translationFieldIdStrList[index]].id])
      
      .filter((perspective_info, index) =>
        (this.state.perspectiveSelectionList[index]));

    /* If we are to perform acoustic analysis, we will try to launch it in the background. */

    if (this.props.mode == 'acoustic')

      computeCognateAnalysis({
        variables: {
          baseLanguageId: this.baseLanguageId,
          groupFieldId: groupField.id,
          perspectiveInfoList: perspectiveInfoList,
          mode: this.props.mode,
          debugFlag: this.state.debugFlag,
        },
      }).then(
        () => {
          window.logger.suc('Cognate acoustic analysis is launched. Please check out tasks for details.');
          this.props.closeModal();
        },
        () => {
          window.logger.err('Failed launch cognate acoustic analysis!');
        }
      );

    /* Otherwise we will launch it as usual and then will wait for results to display them. */

    else
    {
      this.setState({
        computing: true });

      computeCognateAnalysis({
        variables: {
          baseLanguageId: this.baseLanguageId,
          groupFieldId: groupField.id,
          perspectiveInfoList: perspectiveInfoList,
          mode: this.props.mode,
          debugFlag: this.state.debugFlag,
        },
      }).then(

        ({ data: { cognate_analysis: {
          dictionary_count,
          group_count,
          not_enough_count,
          transcription_count,
          translation_count,
          result,
          xlsx_url,
          figure_url,
          minimum_spanning_tree,
          embedding_2d,
          embedding_3d,
          perspective_name_list }}}) =>
        {
          /* Data of the 2d cognate distance plots. */

          var plotly_data = [];

          if (result.length > 0)
          {
            for (const arc of minimum_spanning_tree)

              plotly_data.push({
                x: [embedding_2d[arc[0]][0], embedding_2d[arc[1]][0]],
                y: [embedding_2d[arc[0]][1], embedding_2d[arc[1]][1]],
                mode: 'lines',
                showlegend: false,
                line: {color: '#666', width: 1}});

            for (var i = 0; i < embedding_2d.length; i++)

              plotly_data.push({
                x: [embedding_2d[i][0]],
                y: [embedding_2d[i][1]],
                type: 'scatter',
                mode: 'markers+text',
                name: (i + 1) + ') ' + perspective_name_list[i],
                text: [(i + 1).toString()],
                textfont: {size: 14},
                textposition: 'center right',
                marker: {size: 8}});
          }

          /* Data of the 3d cognate distance plots. */

          var plotly_3d_data = [];

          var x_span = null;
          var y_span = null;
          var z_span = null;

          var x_range = null;
          var y_range = null;
          var z_range = null;

          if (result.length > 0)
          {
            for (const arc of minimum_spanning_tree)

              plotly_3d_data.push({
                x: [embedding_3d[arc[0]][0], embedding_3d[arc[1]][0]],
                y: [embedding_3d[arc[0]][1], embedding_3d[arc[1]][1]],
                z: [embedding_3d[arc[0]][2], embedding_3d[arc[1]][2]],
                type: 'scatter3d',
                mode: 'lines',
                showlegend: false,
                line: {color: '#666', width: 1}});

            for (var i = 0; i < embedding_3d.length; i++)

              plotly_3d_data.push({
                x: [embedding_3d[i][0]],
                y: [embedding_3d[i][1]],
                z: [embedding_3d[i][2]],
                type: 'scatter3d',
                mode: 'markers+text',
                name: (i + 1) + ') ' + perspective_name_list[i],
                text: [(i + 1).toString()],
                textfont: {size: 14},
                textposition: 'center right',
                marker: {size: 3}});

            /* Computing 3d axes ranges. */

            const x_max = Math.max(...embedding_3d.map(point => point[0]));
            const x_min = Math.min(...embedding_3d.map(point => point[0]));

            const y_max = Math.max(...embedding_3d.map(point => point[1]));
            const y_min = Math.min(...embedding_3d.map(point => point[1]));

            const z_max = Math.max(...embedding_3d.map(point => point[2]));
            const z_min = Math.min(...embedding_3d.map(point => point[2]));

            const range =
              
              1.1 * Math.max(
                x_span = x_max - x_min,
                y_span = y_max - y_min,
                z_span = z_max - z_min);

            const x_center = (x_max + x_min) / 2;
            x_range = [x_center - range / 2, x_center + range / 2]

            const y_center = (y_max + y_min) / 2;
            y_range = [y_center - range / 2, y_center + range / 2]

            const z_center = (z_max + z_min) / 2;
            z_range = [z_center - range / 2, z_center + range / 2]
          }

          /* Updating state with computed analysis info. */

          this.setState({
            dictionary_count,
            group_count,
            not_enough_count,
            transcription_count,
            translation_count,
            library_present: true,
            result,
            xlsx_url,
            figure_url,
            minimum_spanning_tree,
            embedding_2d,
            embedding_3d,
            perspective_name_list,
            plotly_data,
            plotly_3d_data,
            x_range,
            y_range,
            z_range,
            x_span,
            y_span,
            z_span,
            computing: false });
        },

        (error_data) =>
        {
          window.logger.err('Failed to compute cognate analysis!');
          console.log(error_data);

          if (error_data.message ===
            'GraphQL error: Analysis library is absent, please contact system administrator.')

            this.setState({
              library_present: false });

          this.setState({
            computing: false });
        }
      );
    }
  }

  render()
  {
    if (!this.state.initialized)
    {
      return (
        <Dimmer active={true} inverted>
          <Loader>Loading</Loader>
        </Dimmer>
      );
    }

    const groupFieldsOptions = this.groupFields.map((f, k) => ({
      key: k,
      value: id2str(f.id),
      text: f.translation,
    }));

    const { user } = this.props;

    return (
      <div>
        <Modal dimmer open size="fullscreen">
          <Modal.Header>{this.props.mode == 'acoustic' ?
            'Cognate acoustic analysis' :
            'Cognate analysis'}</Modal.Header>
          <Modal.Content>
            <Header as="h2">
              <Breadcrumb
                icon="right angle"
                sections={this.treePath.map(e => ({
                  key: e.id, content: e.translation, link: false }))}
              />
            </Header>
            {this.groupFields.length > 0 && (
              <List>
                <List.Item>
                  <span style={{marginRight: '0.5em'}}>
                    Grouping field:
                  </span>
                  <Select
                    defaultValue={this.state.groupFieldIdStr}
                    placeholder="Grouping field selection"
                    options={groupFieldsOptions}
                    onChange={(e, { value }) => {
                      if (value != this.state.groupFieldIdStr)
                      {
                        this.setState({
                          groupFieldIdStr: value,
                          ...this.initPerspectiveList(value) });
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
              ({treePathList, perspective, textFieldsOptions}, index) => (
                <List key={'perspective' + index}>
                  <List.Item>
                  <Breadcrumb
                    style={this.state.perspectiveSelectionList[index] ? {} : {opacity: 0.5}}
                    icon="right angle"
                    sections={treePathList.map(e => ({
                      key: e.id,
                      content: e.hasOwnProperty('status') ?
                        e.translation + ' (' + e.status + ')' :
                        e.translation,
                      link: false }))}
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
                    <List>
                    <List.Item>
                      <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
                        Source transcription field:
                      </span>
                      <Select
                        disabled={!this.state.perspectiveSelectionList[index]}
                        defaultValue={this.state.transcriptionFieldIdStrList[index]}
                        placeholder="Source transcription field selection"
                        options={textFieldsOptions}
                        onChange={(e, { value }) => {
                          const transcriptionFieldIdStrList = this.state.transcriptionFieldIdStrList;
                          transcriptionFieldIdStrList[index] = value;
                          this.setState({ transcriptionFieldIdStrList });}}
                      />
                    </List.Item>
                    <List.Item>
                      <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
                        Source translation field:
                      </span>
                      <Select
                        disabled={!this.state.perspectiveSelectionList[index]}
                        defaultValue={this.state.translationFieldIdStrList[index]}
                        placeholder="Source translation field selection"
                        options={textFieldsOptions}
                        onChange={(e, { value }) => {
                          const translationFieldIdStrList = this.state.translationFieldIdStrList;
                          translationFieldIdStrList[index] = value;
                          this.setState({ translationFieldIdStrList });}}
                      />
                    </List.Item>
                    </List>
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
            {this.props.user.id == 1 && (
              <Checkbox
                label='Debug flag'
                style={{marginTop: '1em', verticalAlign: 'middle'}}
                checked={this.state.debugFlag}
                onChange={(e, { checked }) => {
                  this.setState({ debugFlag: checked });}}
              />
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
                ({this.state.dictionary_count} dictionaries, {this.state.group_count} cognate groups and {this.state.transcription_count} transcriptions analysed):</h3>
              <List>
                <List.Item>
                  {this.state.not_enough_count} additional cognate groups were excluded from the analysis due to not having lexical entries in at least two dictionaries.
                </List.Item>
                <List.Item>
                  <a href={this.state.xlsx_url}>XLSX-exported analysis results</a>
                </List.Item>
              </List>
              <List>
                <List.Item>
                  Etymological distance tree:
                </List.Item>
                <List.Item>
                  <Plot
                    data={this.state.plotly_data}
                    layout={{
                      width: 1200,
                      height: 800,
                      xaxis: {
                        color: "#DDD",
                        gridcolor: "#DDD",
                        tickfont: {color: "#444"}},
                      yaxis: {
                        color: "#DDD",
                        gridcolor: "#DDD",
                        tickfont: {color: "#444"},
                        scaleanchor: "x"},
                      legend: {
                        x: -0.05,
                        y: -0.05,
                        yanchor: "top",
                        font: {size: 14},
                        itemsizing: "constant"},
                      title: 'Minimum spanning tree (2d relative distance embedding)'}}
                  />
                </List.Item>
                <List.Item>
                  <Plot
                    data={this.state.plotly_3d_data}
                    layout={{
                      width: 1200,
                      height: 1200,
                      scene: {
                        xaxis: {
                          color: "#DDD",
                          gridcolor: "#DDD",
                          tickfont: {color: "#444"},
                          range: this.state.x_range},
                        yaxis: {
                          color: "#DDD",
                          gridcolor: "#DDD",
                          tickfont: {color: "#444"},
                          range: this.state.y_range},
                        zaxis: {
                          color: "#DDD",
                          gridcolor: "#DDD",
                          tickfont: {color: "#444"},
                          range: this.state.z_range},
                        camera: {
                          eye: {
                            x: 0,
                            y: -this.state.z_span / Math.max(this.state.y_span, this.state.z_span) * 1.5,
                            z: this.state.y_span / Math.max(this.state.y_span, this.state.z_span) * 1.5}}},
                      legend: {
                        x: -0.05,
                        y: -0.05,
                        yanchor: "top",
                        font: {size: 14},
                        itemsizing: "constant"},
                      title: 'Minimum spanning tree (3d relative distance embedding)'}}
                  />
                </List.Item>
              </List>
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
  closeModal: PropTypes.func.isRequired,
  computeCognateAnalysis: PropTypes.func.isRequired,
};

export default compose(
  connect(state => state.cognateAnalysis, dispatch => bindActionCreators({ closeModal }, dispatch)),
  connect(state => state.user),
  branch(({ visible }) => !visible, renderNothing),
  graphql(computeCognateAnalysisMutation, { name: 'computeCognateAnalysis' }),
  withApollo
)(CognateAnalysisModal);
