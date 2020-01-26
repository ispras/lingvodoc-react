import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Breadcrumb, Button, Checkbox, Dimmer, Divider, Dropdown, Header, Icon, Input, List, Loader, Message, Modal, Select } from 'semantic-ui-react';
import Plot from 'react-plotly.js';

import { closeModal } from 'ducks/cognateAnalysis';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString as id2str } from 'utils/compositeId';
import { checkLanguageId, languageIdList } from 'pages/Home/components/LangsNav';
import { getTranslation } from 'api/i18n';

const cognateAnalysisDataQuery = gql`
  query cognateAnalysisData($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translation
      english_status: status(locale_id: 2)
      columns {
        id
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

const cognateAnalysisMultiDataQuery = gql`
  query cognateAnalysisMultiData(
    $perspectiveId: LingvodocID!,
    $languageIdList: [LingvodocID]!) {
    perspective(id: $perspectiveId) {
      id
      translation
      english_status: status(locale_id: 2)
      columns {
        id
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
    languages(id_list: $languageIdList) {
      id
      translation
      dictionaries(deleted: false, published: true) {
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
      tree {
        id
        translation
      }
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
      dictionaries(deleted: false, published: true) {
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
    $sourcePerspectiveId: LingvodocID!,
    $baseLanguageId: LingvodocID!,
    $groupFieldId: LingvodocID!,
    $perspectiveInfoList: [[LingvodocID]]!,
    $multiList: [ObjectVal],
    $mode: String,
    $figureFlag: Boolean,
    $matchTranslationsFlag: Boolean,
    $debugFlag: Boolean,
    $intermediateFlag: Boolean) {
      cognate_analysis(
        source_perspective_id: $sourcePerspectiveId,
        base_language_id: $baseLanguageId,
        group_field_id: $groupFieldId,
        perspective_info_list: $perspectiveInfoList,
        multi_list: $multiList,
        mode: $mode,
        figure_flag: $figureFlag,
        match_translations_flag: $matchTranslationsFlag,
        debug_flag: $debugFlag,
        intermediate_flag: $intermediateFlag)
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
        intermediate_url_list
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

      result: null,
      xlsx_url: '',
      figure_url: '',

      minimum_spanning_tree: [],
      embedding_2d: [],
      embedding_3d: [],
      perspective_name_list: [],

      intermediate_url_list: null,

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

      matchTranslationsFlag: true,

      debugFlag: false,
      intermediateFlag: false,

      computing: false,

      /* Related to multi-language cognate analysis. */

      language_list: [],
      language_id_set: new Set(),

      transcriptionFieldIdStrMap: {},
      translationFieldIdStrMap: {},
      perspectiveSelectionMap: {},
    };

    this.initialize_single = this.initialize_single.bind(this);
    this.initialize_multi = this.initialize_multi.bind(this);
    this.initPerspectiveData = this.initPerspectiveData.bind(this);
    this.initPerspectiveList = this.initPerspectiveList.bind(this);

    this.handleCreate = this.handleCreate.bind(this);
  }

  componentDidMount()
  {
    const multi =
      this.props.mode == 'multi_reconstruction' ||
      this.props.mode == 'multi_suggestions';

    (multi ?
      this.initialize_multi :
      this.initialize_single)();
  }

  initialize_common(
    allFields,
    columns,
    tree,
    english_status)
  {
    /* Compiling dictionary of perspective field info so that later we would be able to retrieve this info
     * efficiently. */

    this.fieldDict = {};
    
    for (const field of allFields)
      this.fieldDict[id2str(field.id)] = field;

    /* Grouping fields of our perspective. */

    this.groupFields = columns
      .map(column => this.fieldDict[id2str(column.field_id)])
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

    /* Remembering source perspective status. */

    this.englishStatus = english_status;
  }

  initialize_state()
  {
    /* If we have selected a default cognate grouping field, we initialize perspectives available for
     * analysis. */

    if (this.state.groupFieldIdStr)
    {
      const {
        transcriptionFieldIdStrList,
        translationFieldIdStrList,
        perspectiveSelectionList } =

        this.initPerspectiveList(this.state.groupFieldIdStr);

      this.state.transcriptionFieldIdStrList = transcriptionFieldIdStrList;
      this.state.translationFieldIdStrList = translationFieldIdStrList;
      this.state.perspectiveSelectionList = perspectiveSelectionList;
    }
  }

  async initialize_single()
  {
    const { client, perspectiveId, mode } = this.props;

    const { data: {
      all_fields: allFields,
      perspective: {
        columns, tree, english_status } }} =
        
      await client.query({
        query: cognateAnalysisDataQuery,
        variables: { perspectiveId },
      });

    this.initialize_common(
      allFields, columns, tree, english_status);

    this.available_list = [];
    this.perspective_list = [];

    /* If we are selecting perspectives for cognate suggestions, and the source perspective is not
     * published, we won't be able to proceed and therefore we need not bother with initialization. */

    if (
      mode == 'suggestions' &&
      english_status != 'Published' &&
      english_status != 'Limited access')
    {
      this.setState({ initialized: true });
      return;
    }

    /* Recursively getting data of perspectives available for analysis. */

    await this.initPerspectiveData(this.baseLanguageId, []);

    this.initialize_state();
    this.setState({ initialized: true });
  }

  /*
   * Initializes data for multi-language cognate analysis.
   */
  async initialize_multi()
  {
    const { client, perspectiveId, mode } = this.props;

    const { data: {
      all_fields: allFields,
      perspective: {
        columns, tree, english_status },
      languages }} =
        
      await client.query({
        query: cognateAnalysisMultiDataQuery,
        variables: { perspectiveId, languageIdList },
      });

    this.initialize_common(
      allFields, columns, tree, english_status);

    /* If we are selecting perspectives for cognate suggestions, and the source perspective is not
     * published, we won't be able to proceed and therefore we need not bother with initialization. */

    if (
      mode == 'multi_suggestions' &&
      english_status != 'Published' &&
      english_status != 'Limited access')
    {
      this.setState({ initialized: true });
      return;
    }

    /* Preparing language info. */

    this.language_dict = {}

    for (const language of languages)
      this.language_dict[id2str(language.id)] = language;

    this.language_list = languages;

    /* Getting info of perspectives of our base language. */

    this.available_list = [];
    await this.initPerspectiveData(this.baseLanguageId, []);

    this.initialize_state();

    const base_language = this.language_dict[id2str(this.baseLanguageId)];

    base_language.loading = false;
    base_language.treePath = this.treePath;
    base_language.available_list = this.available_list;
    base_language.perspective_list = this.perspective_list;

    /* Preparing info of perspective and transcription/translation field selections. */

    for (const [index, {perspective}] of this.perspective_list.entries())
    {
      const p_key = id2str(perspective.id);

      this.state.transcriptionFieldIdStrMap[p_key] = this.state.transcriptionFieldIdStrList[index];
      this.state.translationFieldIdStrMap[p_key] = this.state.translationFieldIdStrList[index];
      this.state.perspectiveSelectionMap[p_key] = this.state.perspectiveSelectionList[index];
    }

    this.state.language_id_set.add(id2str(this.baseLanguageId));

    this.setState({
      initialized: true,
      language_list: [base_language]});
  }

  /*
   * Initializes data of perspectives of a selected language.
   */
  async initialize_language(language)
  {
    this.available_list = [];
    await this.initPerspectiveData(language.id, []);

    this.initialize_state();

    language.available_list = this.available_list;
    language.perspective_list = this.perspective_list;

    /* Preparing info of perspective and transcription/translation field selections. */

    for (const [index, {perspective}] of this.perspective_list.entries())
    {
      const p_key = id2str(perspective.id);

      if (!this.state.transcriptionFieldIdStrMap.hasOwnProperty(p_key))
        this.state.transcriptionFieldIdStrMap[p_key] = this.state.transcriptionFieldIdStrList[index];

      if (!this.state.translationFieldIdStrMap.hasOwnProperty(p_key))
        this.state.translationFieldIdStrMap[p_key] = this.state.translationFieldIdStrList[index];

      if (!this.state.perspectiveSelectionMap.hasOwnProperty(p_key))
        this.state.perspectiveSelectionMap[p_key] = this.state.perspectiveSelectionList[index];
    }

    language.loading = false;

    this.setState({
      language_list: this.state.language_list });
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

    /* First we look through sublanguages, just as on the main page. */

    for (const language of languages)

      await this.initPerspectiveData(
        language.id, treePathList.concat([language]));

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

  select_group_field(value)
  {
    if (value == this.state.groupFieldIdStr)
      return;

    /* Selecting grouping field for many languages. */

    if (
      this.props.mode == 'multi_reconstruction' ||
      this.props.mode == 'multi_suggestions')
    {
      this.state.groupFieldIdStr = value;

      for (const language of this.state.language_list)
      {
        this.available_list = language.available_list;
        this.initialize_state();

        language.perspective_list = this.perspective_list;
      }

      this.setState({
        groupFieldIdStr: value });
    }

    /* Selecting grouping field for a single language. */

    else
    {
      this.setState({
        groupFieldIdStr: value,
        ...this.initPerspectiveList(value) });
    }
  }

  handleResult({
    data: {
      cognate_analysis: {
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
        perspective_name_list,
        intermediate_url_list }}})
  {
    /* Data of the 2d cognate distance plots. */

    var plotly_data = [];

    if (result.length > 0 && minimum_spanning_tree)
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

    if (result.length > 0 && minimum_spanning_tree)
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
      intermediate_url_list,
      plotly_data,
      plotly_3d_data,
      x_range,
      y_range,
      z_range,
      x_span,
      y_span,
      z_span,
      computing: false });
  }

  handleError(error_data)
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

  handleCreate()
  {
    const {
      perspectiveId,
      computeCognateAnalysis } = this.props;

    const groupField = this.fieldDict[this.state.groupFieldIdStr];

    /* Gathering info of perspectives we are to analyze. */

    var perspectiveInfoList = [];
    var multiList = [];
    
    if (
      this.props.mode == 'multi_reconstruction' ||
      this.props.mode == 'multi_suggestions')
    {
      for (const language of this.state.language_list)
      {
        var p_count =  0;

        for (const { perspective } of language.perspective_list)
        {
          const p_key = id2str(perspective.id);

          if (this.state.perspectiveSelectionMap[p_key])
          {
            perspectiveInfoList.push([perspective.id,
              this.fieldDict[this.state.transcriptionFieldIdStrMap[p_key]].id,
              this.fieldDict[this.state.translationFieldIdStrMap[p_key]].id]);

            p_count++;
          }
        }

        multiList.push([language.id, p_count]);
      }
    }
    
    else
    {
      perspectiveInfoList = this.perspective_list

        .map(({perspective}, index) => [perspective.id,
          this.fieldDict[this.state.transcriptionFieldIdStrList[index]].id,
          this.fieldDict[this.state.translationFieldIdStrList[index]].id])
        
        .filter((perspective_info, index) =>
          (this.state.perspectiveSelectionList[index]));
    }

    /* If we are to perform acoustic analysis, we will try to launch it in the background. */

    if (this.props.mode == 'acoustic')

      computeCognateAnalysis({
        variables: {
          sourcePerspectiveId: perspectiveId,
          baseLanguageId: this.baseLanguageId,
          groupFieldId: groupField.id,
          perspectiveInfoList: perspectiveInfoList,
          mode: 'acoustic',
          figureFlag: true,
          matchTranslationsFlag: this.state.matchTranslationsFlag,
          debugFlag: this.state.debugFlag,
          intermediateFlag: this.state.intermediateFlag,
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

      const backend_mode =
        this.props.mode == 'multi_reconstruction' ? 'multi' :
        this.props.mode == 'multi_suggestions' ? 'suggestions' :
        this.props.mode;

      computeCognateAnalysis({
        variables: {
          sourcePerspectiveId: perspectiveId,
          baseLanguageId: this.baseLanguageId,
          groupFieldId: groupField.id,
          perspectiveInfoList: perspectiveInfoList,
          multiList: multiList,
          mode: backend_mode,
          figureFlag: this.props.mode == '',
          matchTranslationsFlag: this.state.matchTranslationsFlag,
          debugFlag: this.state.debugFlag,
          intermediateFlag: this.state.intermediateFlag },
        },
      ).then(

        (data) => this.handleResult(data),
        (error_data) => this.handleError(error_data)

      );
    }
  }

  /*
   * Grouping field selection rendering.
   */
  grouping_field_render()
  {
    const groupFieldsOptions = this.groupFields.map((f, k) => ({
      key: k,
      value: id2str(f.id),
      text: f.translation,
    }));

    if (this.groupFields.length > 0)

      return (
        <List>
          <List.Item>
            <span style={{marginRight: '0.5em'}}>
              Grouping field:
            </span>
            <Select
              defaultValue={this.state.groupFieldIdStr}
              placeholder="Grouping field selection"
              options={groupFieldsOptions}
              onChange={(e, { value }) => this.select_group_field(value)}
            />
          </List.Item>
        </List>
      )

    else
      
      return (
        <span>Perspective does not have any grouping fields,
          cognate analysis is impossible.</span>
      )
  }

  /*
   * Additional options for administrator.
   */
  admin_section_render()
  {
    return (
      <List>
        <List.Item>
          <Checkbox
            label='Debug flag'
            style={{marginTop: '1em', verticalAlign: 'middle'}}
            checked={this.state.debugFlag}
            onChange={(e, { checked }) => {
              this.setState({ debugFlag: checked });}}
          />
        </List.Item>
        <List.Item>
          <Checkbox
            label='Save intermediate data'
            style={{marginTop: '1em', verticalAlign: 'middle'}}
            checked={this.state.intermediateFlag}
            onChange={(e, { checked }) => {
              this.setState({ intermediateFlag: checked });}}
          />
        </List.Item>
      </List>
    )
  }

  /*
   * Perspective selection for a single language, e.g. for simple cognate analysis.
   */
  single_language_render()
  {
    /* If we are selecting perspectives for cognate suggestions, we check the source perspective state. */

    if (
      this.props.mode == 'suggestions' &&
      this.englishStatus != 'Published' &&
      this.englishStatus != 'Limited access')

      return (
        <Modal.Content>
          <Message negative>
            <Message.Header>
              Perspective is not published.
            </Message.Header>
            <p>
              Cognate suggestions are available only for perspectives in the "Published" or "Limited access" state.
            </p>
          </Message>
        </Modal.Content>
      );

    return (
      <Modal.Content>

        <Header as="h2">
          <Breadcrumb
            icon="right angle"
            sections={this.treePath.map(e => ({
              key: e.id, content: e.translation, link: false }))}
          />
        </Header>

        {this.grouping_field_render()}

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

        {this.props.mode == 'suggestions' && (
          <Checkbox
            label={getTranslation('Match translations')}
            style={{marginTop: '1em', verticalAlign: 'middle'}}
            checked={this.state.matchTranslationsFlag}
            onChange={(e, { checked }) => {
              this.setState({ matchTranslationsFlag: checked });}}
          />
        )}

        {this.props.user.id == 1 && this.admin_section_render()}

      </Modal.Content>
    );
  }

  /*
   * Perspective selection for multiple languages, e.g. for multi-language cognate analysis.
   */
  multi_language_render()
  {
    /* If we are selecting perspectives for cognate suggestions, we check the source perspective state. */

    if (
      this.props.mode == 'multi_suggestions' &&
      this.englishStatus != 'Published' &&
      this.englishStatus != 'Limited access')

      return (
        <Modal.Content>
          <Message negative>
            <Message.Header>
              Perspective is not published.
            </Message.Header>
            <p>
              Cognate multi-language suggestions are available only for perspectives in the "Published" or "Limited access" state.
            </p>
          </Message>
        </Modal.Content>
      );

    return (
      <Modal.Content>

        {this.grouping_field_render()}

        <List>
          {map(this.state.language_list, (language_info, l_index) => (
            <List.Item key={'language' + l_index}>
              <Header as="h3">
                <Breadcrumb
                  icon="right angle"
                  sections={language_info.treePath.map(e => ({
                    key: e.id, content: e.translation, link: false }))}
                />
                <span>
                  <Icon
                    name='delete'
                    style={{paddingLeft: '0.5em', paddingRight: '0.5em'}}
                    onClick={() =>
                    {
                      this.state.language_list.splice(l_index, 1);
                      this.state.language_id_set.delete(id2str(language_info.id));

                      this.setState({
                        language_list: this.state.language_list,
                        language_id_set: this.state.language_id_set
                      });
                    }}
                  />
                </span>
              </Header>

              {language_info.loading ?

                <List>
                <List.Item>
                <span>Loading perspective data... <Icon name="spinner" loading /></span>
                </List.Item>
                </List> :

                map(language_info.perspective_list,
                  ({treePathList, perspective, textFieldsOptions}, p_index) => {

                    const p_key = id2str(perspective.id);
                    
                    return (
                      <List key={'perspective' + p_key}>
                        <List.Item>
                        <Breadcrumb
                          style={this.state.perspectiveSelectionMap[p_key] ? {} : {opacity: 0.5}}
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
                          checked={this.state.perspectiveSelectionMap[p_key]}
                          onChange={(e, { checked }) => {
                            const perspectiveSelectionMap = this.state.perspectiveSelectionMap;
                            perspectiveSelectionMap[p_key] = checked;
                            this.setState({ perspectiveSelectionMap });}}
                        />
                        </List.Item>
                        {this.state.perspectiveSelectionMap[p_key] && (
                          <List.Item>
                          <List>
                          <List.Item>
                            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
                              Source transcription field:
                            </span>
                            <Select
                              disabled={!this.state.perspectiveSelectionMap[p_key]}
                              defaultValue={this.state.transcriptionFieldIdStrMap[p_key]}
                              placeholder="Source transcription field selection"
                              options={textFieldsOptions}
                              onChange={(e, { value }) => {
                                const transcriptionFieldIdStrMap = this.state.transcriptionFieldIdStrMap;
                                transcriptionFieldIdStrMap[p_key] = value;
                                this.setState({ transcriptionFieldIdStrMap });}}
                            />
                          </List.Item>
                          <List.Item>
                            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
                              Source translation field:
                            </span>
                            <Select
                              disabled={!this.state.perspectiveSelectionMap[p_key]}
                              defaultValue={this.state.translationFieldIdStrMap[p_key]}
                              placeholder="Source translation field selection"
                              options={textFieldsOptions}
                              onChange={(e, { value }) => {
                                const translationFieldIdStrMap = this.state.translationFieldIdStrMap;
                                translationFieldIdStrMap[p_key] = value;
                                this.setState({ translationFieldIdStrMap });}}
                            />
                          </List.Item>
                          </List>
                          </List.Item>
                        )}
                      </List>
                    )
                  })
              }
            </List.Item>
          ))}

          <List.Item>
            <Dropdown
              fluid
              placeholder='Add language'
              search
              selection
              options={

                this.language_list

                  .filter(language =>
                    !this.state.language_id_set.has(id2str(language.id)))

                  .map(language => ({
                    key: language.id,
                    value: id2str(language.id),
                    text: language.translation}))

              }
              value={''}
              onChange={(event, data) =>
              {
                const language = this.language_dict[data.value];

                language.treePath = language.tree.slice().reverse();
                language.perspective_list = [];

                language.loading = true;
                this.initialize_language(language);

                this.state.language_list.push(language);
                this.state.language_id_set.add(data.value);

                this.setState({
                  language_list: this.state.language_list,
                  language_id_set: this.state.language_id_set,
                });
              }}
            />
          </List.Item>
        </List>

        {!this.state.library_present && (
          <List>
            <div style={{color: 'red'}}>
              Analysis library is absent, please contact system administrator.
            </div>
          </List>
        )}

        {this.props.mode == 'multi_suggestions' && (
          <Checkbox
            label={getTranslation('Match translations')}
            style={{marginTop: '1em', verticalAlign: 'middle'}}
            checked={this.state.matchTranslationsFlag}
            onChange={(e, { checked }) => {
              this.setState({ matchTranslationsFlag: checked });}}
          />
        )}

        {this.props.user.id == 1 && this.admin_section_render()}

      </Modal.Content>
    )
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

    const { mode } = this.props;

    const multi =
      mode == 'multi_reconstruction' ||
      mode == 'multi_suggestions';

    return (
      <div>
        <Modal dimmer open size="fullscreen">

          <Modal.Header>{
            mode == 'acoustic' ?
              getTranslation('Cognate acoustic analysis') :
            mode == 'multi_reconstruction' ?
              getTranslation('Cognate multi-language reconstruction') :
            mode == 'multi_suggestions' ?
              getTranslation('Cognate multi-language suggestions') :
            mode == 'reconstruction' ?
              getTranslation('Cognate reconstruction') :
            mode == 'suggestions' ?
              getTranslation('Cognate suggestions') :
              getTranslation('Cognate analysis')}
          </Modal.Header>

          {multi ?
            this.multi_language_render() :
            this.single_language_render()}

          <Modal.Actions>
            <Button
              positive
              content={this.state.computing ?
                <span>Computing... <Icon name="spinner" loading /></span> :
                "Compute"}
              onClick={this.handleCreate}
              disabled={
                (!multi && (
                  this.perspective_list.length <= 1 ||
                  !this.state.perspectiveSelectionList.some(enabled => enabled))) ||
                (multi &&
                  this.state.language_list.length <= 0) ||
                this.state.computing}
            />
            <Button negative content="Close" onClick={this.props.closeModal} />
          </Modal.Actions>

          {this.state.library_present && this.state.result !== null && (
            <Modal.Content scrolling style={{maxHeight: '95vh'}}>

              <h3>Analysis results
                ({this.state.dictionary_count} dictionaries, {this.state.group_count} cognate groups and {this.state.transcription_count} transcriptions analysed):</h3>

              <List>
                <List.Item>
                  {this.state.not_enough_count} cognate groups were excluded from the analysis due to not having lexical entries in at least two selected dictionaries.
                </List.Item>

                {this.state.result.length > 0 && mode != 'suggestions' && (
                  <List.Item>
                    <a href={this.state.xlsx_url}>XLSX-exported analysis results</a>
                  </List.Item>
                )}

                {this.state.result.length > 0 && this.state.intermediate_url_list && (
                  <List.Item>
                    <div style={{marginTop: '0.75em'}}>
                      <span>Intermediate data:</span>
                      <List>
                        {map(this.state.intermediate_url_list, (intermediate_url) => (
                          <List.Item key={intermediate_url}>
                            <a href={intermediate_url}>{intermediate_url}</a>
                          </List.Item>
                        ))}
                      </List>
                    </div>
                  </List.Item>
                )}
              </List>

              {this.state.result.length <= 0 && (
                <List>
                  <List.Item>
                    No data for cognate analysis.
                  </List.Item>
                </List>
              )}

              {this.state.plotly_data.length > 0 && (
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
              )}
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
