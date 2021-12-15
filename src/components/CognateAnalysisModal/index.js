import React from 'react';
import PropTypes from 'prop-types';
import { compose, branch, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import {
  Breadcrumb, Button, Checkbox, Dimmer, Divider, Dropdown, Header, Icon, Input, List, Loader, Message,
  Modal, Pagination, Segment, Select } from 'semantic-ui-react';
import Plot from 'react-plotly.js';

import { closeModal } from 'ducks/cognateAnalysis';
import { bindActionCreators } from 'redux';
import { isEqual, map } from 'lodash';
import { connect } from 'react-redux';
import { compositeIdToString as id2str } from 'utils/compositeId';
import { checkLanguageId, languageIdList } from 'components/Home/components/LangsNav';
import { getTranslation } from 'api/i18n';
import { connectMutation } from 'components/GroupingTagModal/graphql';

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
    $languageIdList: [LingvodocID]!) {
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
    $matchTranslationsValue: Int,
    $onlyOrphansFlag: Boolean,
    $debugFlag: Boolean,
    $intermediateFlag: Boolean) {
      cognate_analysis(
        source_perspective_id: $sourcePerspectiveId,
        base_language_id: $baseLanguageId,
        group_field_id: $groupFieldId,
        perspective_info_list: $perspectiveInfoList,
        multi_list: $multiList,
        mode: $mode,
        match_translations_value: $matchTranslationsValue,
        only_orphans_flag: $onlyOrphansFlag,
        figure_flag: $figureFlag,
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
        suggestion_list
        suggestion_field_id
        intermediate_url_list
      }
    }
`;

const SUGGESTIONS_PER_PAGE = 50;

function equalIds(id_a, id_b) {
  return id_a[0] == id_b[0] && id_a[1] == id_b[1]; }

class SLPerspectiveSelection extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      perspectiveSelectionList: props.perspectiveSelectionList,
      transcriptionFieldIdStrList: props.transcriptionFieldIdStrList,
      translationFieldIdStrList: props.translationFieldIdStrList,
    };

    this.onChangeSelect = this.onChangeSelect.bind(this);
  }

  onChangeSelect(checked)
  {
    const {
      index,
      perspectiveSelectionList,
      perspectiveSelectionCountMap,
      onChangeSelectAll } =

      this.props;

    const p_select_count = perspectiveSelectionCountMap[''];
    const p_max_count = perspectiveSelectionCountMap['_max'];

    let p_select_count_new = p_select_count;

    const current = perspectiveSelectionList[index];

    if (current && !checked)
      p_select_count_new--;

    else if (!current && checked)
      p_select_count_new++;

    const all_before =
      p_select_count <= 0 ? 0 :
      p_select_count >= p_max_count ? 1 :
      2;

    const all_after =
      p_select_count_new <= 0 ? 0 :
      p_select_count_new >= p_max_count ? 1 :
      2;

    perspectiveSelectionList[index] = checked;
    perspectiveSelectionCountMap[''] = p_select_count_new;

    if (all_before != all_after)
      onChangeSelectAll();

    else if (current != checked)
      this.setState({ perspectiveSelectionList });
  }

  render()
  {
    const {
      treePathList,
      perspective,
      textFieldsOptions,
      index,
      perspectiveSelectionList,
      transcriptionFieldIdStrList,
      translationFieldIdStrList } =

      this.props;

    return (
      <List key={'perspective' + index}>
        <List.Item key='check'>
        <Breadcrumb
          style={perspectiveSelectionList[index] ? {} : {opacity: 0.5}}
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
          checked={perspectiveSelectionList[index]}
          onChange={(e, { checked }) => this.onChangeSelect(checked)}
        />
        </List.Item>
        {perspectiveSelectionList[index] && (
          <List.Item key='selection'>
          <List>
          <List.Item key='selection_xcript'>
            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
              Source transcription field:
            </span>
            <Select
              disabled={!perspectiveSelectionList[index]}
              defaultValue={transcriptionFieldIdStrList[index]}
              placeholder="Source transcription field selection"
              options={textFieldsOptions}
              onChange={(e, { value }) => {
                transcriptionFieldIdStrList[index] = value;
                this.setState({ transcriptionFieldIdStrList });}}
            />
          </List.Item>
          <List.Item key='selection_xlat'>
            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
              Source translation field:
            </span>
            <Select
              disabled={!perspectiveSelectionList[index]}
              defaultValue={translationFieldIdStrList[index]}
              placeholder="Source translation field selection"
              options={textFieldsOptions}
              onChange={(e, { value }) => {
                translationFieldIdStrList[index] = value;
                this.setState({ translationFieldIdStrList });}}
            />
          </List.Item>
          </List>
          </List.Item>
        )}
      </List>
    );
  }
}

class SLSelection extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      perspectiveSelectionCountMap: props.perspectiveSelectionCountMap,
    };
  }

  render()
  {
    const {
      perspective_list,
      perspectiveSelectionList,
      transcriptionFieldIdStrList,
      translationFieldIdStrList,
      perspectiveSelectionCountMap } =

      this.props;

    const p_select_count = perspectiveSelectionCountMap[''];
    const p_max_count = perspectiveSelectionCountMap['_max'];

    return (
      <div>
        <List>
        <List.Item>
          <span style={p_max_count <= 0 ? {opacity: 0.5} : {}}>
            {getTranslation('Select/deselect all dictionaries')}
          </span>
          <Checkbox
            style={{marginLeft: '0.5em', verticalAlign: 'middle'}}
            checked={p_select_count >= p_max_count}
            indeterminate={p_select_count > 0 && p_select_count < p_max_count || p_max_count <= 0}
            disabled={p_max_count <= 0}
            onChange={(e, { checked }) =>
            {
              if (p_select_count < p_max_count)
              {
                perspectiveSelectionList.fill(true);
                perspectiveSelectionCountMap[''] = p_max_count;
              }
              else
              {
                perspectiveSelectionList.fill(false);
                perspectiveSelectionCountMap[''] = 0;
              }

              this.setState({ perspectiveSelectionCountMap });
            }}
          />
        </List.Item>
        </List>

        {map(perspective_list,
          ({treePathList, perspective, textFieldsOptions}, index) => (

            // Not so good hack in the name of performance,
            // we just give our state to be modified in the child compoment.

            <SLPerspectiveSelection
              key={'perspective' + index}
              treePathList={treePathList}
              perspective={perspective}
              textFieldsOptions={textFieldsOptions}
              index={index}
              perspectiveSelectionList={perspectiveSelectionList}
              transcriptionFieldIdStrList={transcriptionFieldIdStrList}
              translationFieldIdStrList={translationFieldIdStrList}
              perspectiveSelectionCountMap={perspectiveSelectionCountMap}
              onChangeSelectAll={() => this.setState({ perspectiveSelectionCountMap })}
            />
        ))}
      </div>
    );
  }
}

class MLPerspectiveSelection extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      perspectiveSelectionMap: props.perspectiveSelectionMap,
      transcriptionFieldIdStrMap: props.transcriptionFieldIdStrMap,
      translationFieldIdStrMap: props.translationFieldIdStrMap,
    };

    this.onChangeSelect = this.onChangeSelect.bind(this);
  }

  onChangeSelect(checked)
  {
    const {
      p_key,
      perspectiveSelectionMap,
      perspectiveSelectionCountMap,
      language_id_str,
      onChangeSelectAll } = this.props;

    const p_select_count = perspectiveSelectionCountMap[''];
    const p_max_count = perspectiveSelectionCountMap['_max'];

    let p_select_count_new = p_select_count;

    const p_language_select_count = perspectiveSelectionCountMap[language_id_str];
    const p_language_max_count = perspectiveSelectionCountMap[language_id_str + '_max'];

    let p_language_select_count_new = p_language_select_count;

    const current = perspectiveSelectionMap[p_key];

    if (current && !checked)
    {
      p_select_count_new--;
      p_language_select_count_new--;
    }
    else if (!current && checked)
    {
      p_select_count_new++;
      p_language_select_count_new++;
    }

    const all_before =
      p_select_count <= 0 ? 0 :
      p_select_count >= p_max_count ? 1 :
      2;

    const all_after =
      p_select_count_new <= 0 ? 0 :
      p_select_count_new >= p_max_count ? 1 :
      2;

    const language_all_before =
      p_language_select_count <= 0 ? 0 :
      p_language_select_count >= p_language_max_count ? 1 :
      2;

    const language_all_after =
      p_language_select_count_new <= 0 ? 0 :
      p_language_select_count_new >= p_language_max_count ? 1 :
      2;

    perspectiveSelectionMap[p_key] = checked;

    perspectiveSelectionCountMap[''] = p_select_count_new;
    perspectiveSelectionCountMap[language_id_str] = p_language_select_count_new;

    if (
      all_before != all_after ||
      language_all_before != language_all_after)

      onChangeSelectAll();

    else if (current != checked)
      this.setState({ perspectiveSelectionMap });
  }

  render()
  {
    const {
      treePathList,
      perspective,
      textFieldsOptions,
      p_key,
      perspectiveSelectionMap,
      transcriptionFieldIdStrMap,
      translationFieldIdStrMap,
      language_id_str,
      onChangeSelectAll } = this.props;

    return (
      <List key={'perspective' + p_key}>
        <List.Item>
        <Breadcrumb
          style={perspectiveSelectionMap[p_key] ? {} : {opacity: 0.5}}
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
          checked={perspectiveSelectionMap[p_key]}
          onChange={(e, { checked }) => this.onChangeSelect(checked)}
        />
        </List.Item>
        {perspectiveSelectionMap[p_key] && (
          <List.Item>
          <List>
          <List.Item>
            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
              Source transcription field:
            </span>
            <Select
              disabled={!perspectiveSelectionMap[p_key]}
              defaultValue={transcriptionFieldIdStrMap[p_key]}
              placeholder="Source transcription field selection"
              options={textFieldsOptions}
              onChange={(e, { value }) => {
                transcriptionFieldIdStrMap[p_key] = value;
                this.setState({ transcriptionFieldIdStrMap });}}
            />
          </List.Item>
          <List.Item>
            <span style={{marginLeft: '1em', marginRight: '0.5em'}}>
              Source translation field:
            </span>
            <Select
              disabled={!perspectiveSelectionMap[p_key]}
              defaultValue={translationFieldIdStrMap[p_key]}
              placeholder="Source translation field selection"
              options={textFieldsOptions}
              onChange={(e, { value }) => {
                translationFieldIdStrMap[p_key] = value;
                this.setState({ translationFieldIdStrMap });}}
            />
          </List.Item>
          </List>
          </List.Item>
        )}
      </List>
    );
  }
}

class MLSelection extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      perspectiveSelectionCountMap: props.perspectiveSelectionCountMap,
      language_list: props.language_list,
      language_id_set: props.language_id_set,
    };
  }

  render()
  {
    const {
      language_list,
      perspectiveSelectionMap,
      transcriptionFieldIdStrMap,
      translationFieldIdStrMap,
      perspectiveSelectionCountMap,
      language_id_set,
      available_language_list,
      onAddLanguage } =

      this.props;

    const p_select_count = perspectiveSelectionCountMap[''];
    const p_max_count = perspectiveSelectionCountMap['_max'];

    return (
      <List>

        <List.Item>
          <span style={p_max_count <= 0 ? {opacity: 0.5} : {}}>
            {getTranslation('Select/deselect all dictionaries')}
          </span>
          <Checkbox
            style={{marginLeft: '0.5em', verticalAlign: 'middle'}}
            checked={p_select_count >= p_max_count}
            indeterminate={p_select_count > 0 && p_select_count < p_max_count || p_max_count <= 0}
            disabled={p_max_count <= 0}
            onChange={(e, { checked }) =>
            {
              if (p_select_count < p_max_count)
              {
                for (const language of language_list)
                {
                  for (const { perspective } of language.perspective_list)
                    perspectiveSelectionMap[id2str(perspective.id)] = true;

                  perspectiveSelectionCountMap[id2str(language.id)] = language.perspective_list.length;
                }

                perspectiveSelectionCountMap[''] = p_max_count;
              }
              else
              {
                for (const language of language_list)
                {
                  for (const { perspective } of language.perspective_list)
                    perspectiveSelectionMap[id2str(perspective.id)] = false;

                  perspectiveSelectionCountMap[id2str(language.id)] = 0;
                }

                perspectiveSelectionCountMap[''] = 0;
              }

              this.setState({ perspectiveSelectionCountMap });
            }}
          />
        </List.Item>

        {map(language_list, (language_info, l_index) => {

          const language_id_str = id2str(language_info.id);

          const p_language_select_count = perspectiveSelectionCountMap[language_id_str];
          const p_language_max_count = perspectiveSelectionCountMap[language_id_str + '_max'];

          return (
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
                      language_list.splice(l_index, 1);
                      language_id_set.delete(language_id_str);

                      let p_select_count_new = p_select_count;

                      for (const { perspective } of language_info.perspective_list)
                      {
                        if (perspectiveSelectionMap[id2str(perspective.id)])
                          p_select_count_new--;
                      }

                      perspectiveSelectionCountMap[''] = p_select_count_new;
                      perspectiveSelectionCountMap['_max'] = p_max_count - language_info.perspective_list.length;

                      this.setState({
                        language_list,
                        language_id_set,
                        perspectiveSelectionCountMap
                      });
                    }}
                  />
                </span>
              </Header>

              {language_info.loading ?

                <List>
                <List.Item>
                <span>{getTranslation('Loading perspective data...')} <Icon name="spinner" loading /></span>
                </List.Item>
                </List> :

                <div>
                  <List>
                  <List.Item>
                    <span>{getTranslation('Select/deselect all language\'s dictionaries')}</span>
                    <Checkbox
                      style={
                        {marginLeft: '0.5em', verticalAlign: 'middle'}}
                      checked={
                        p_language_select_count >= p_language_max_count}
                      indeterminate={
                        p_language_select_count > 0 && p_language_select_count < p_language_max_count}
                      onChange={(e, { checked }) =>
                      {
                        let p_select_count_new = p_select_count;

                        if (p_language_select_count < p_language_max_count)
                        {
                          for (const { perspective } of language_info.perspective_list)
                          {
                            const perspective_id_str = id2str(perspective.id);

                            if (!perspectiveSelectionMap[perspective_id_str])
                              p_select_count_new++;

                            perspectiveSelectionMap[id2str(perspective.id)] = true;
                          }

                          perspectiveSelectionCountMap[language_id_str] = p_language_max_count;
                        }
                        else
                        {
                          for (const { perspective } of language_info.perspective_list)
                          {
                            const perspective_id_str = id2str(perspective.id);

                            if (perspectiveSelectionMap[perspective_id_str])
                              p_select_count_new--;

                            perspectiveSelectionMap[id2str(perspective.id)] = false;
                          }

                          perspectiveSelectionCountMap[language_id_str] = 0;
                        }

                        perspectiveSelectionCountMap[''] = p_select_count_new;
                        this.setState({ perspectiveSelectionCountMap });
                      }}
                    />
                  </List.Item>
                  </List>

                  {map(language_info.perspective_list,
                    ({treePathList, perspective, textFieldsOptions}, p_index) => {

                      const p_key = id2str(perspective.id);

                      // Not so good hack in the name of performance,
                      // we just give our state to be modified in the child compoment.

                      return (
                        <MLPerspectiveSelection
                          key={'perspective' + p_key}
                          treePathList={treePathList}
                          perspective={perspective}
                          textFieldsOptions={textFieldsOptions}
                          p_index={p_index}
                          p_key={p_key}
                          perspectiveSelectionMap={perspectiveSelectionMap}
                          transcriptionFieldIdStrMap={transcriptionFieldIdStrMap}
                          translationFieldIdStrMap={translationFieldIdStrMap}
                          perspectiveSelectionCountMap={perspectiveSelectionCountMap}
                          language_id_str={language_id_str}
                          onChangeSelectAll={() => this.setState({ perspectiveSelectionCountMap })}
                        />
                      );
                  })}
                </div>
              }
            </List.Item>
          );
        })}

        <List.Item>
          <Dropdown
            fluid
            placeholder='Add language'
            search
            selection
            options={

              available_language_list

                .filter(language =>
                  !language_id_set.has(id2str(language.id)))

                .map(language => ({
                  key: language.id,
                  value: id2str(language.id),
                  text: language.translation}))

            }
            value={''}
            onChange={onAddLanguage}
          />
        </List.Item>
      </List>
    );
  }
}

class SuggestionSelection extends React.Component
{
  constructor(props)
  {
    super(props);

    this.state =
    {
      perspective_name_list: props.perspective_name_list,
      sg_select_list: props.sg_select_list,
      sg_state_list: props.sg_state_list,
    };
  }

  render()
  {
    const {
      perspective_index,
      word,
      word_entry_id,
      word_group,
      single_list,
      group_list,
      index,
      sg_select_list,
      sg_state_list,
      sg_connect } =

      this.props;

    const connected_flag =
      sg_state_list[index] == 'connected';

    const error_flag =
      sg_state_list[index] == 'error';

    const invalidated_flag =
      sg_state_list[index] == 'invalidated';

    const disabled_flag =
      connected_flag || error_flag || invalidated_flag;

    const opacity_style =
      disabled_flag ? {opacity: 0.5} : {};

    return (
      <Segment
        key={'suggestion' + index}>

        <List>

          <List.Item>
            <span style={opacity_style}>
              {getTranslation('Source perspective word:')}
            </span>

            {/* List and List.Item for uniform appearance. */}

            <List>
              <List.Item>
                <Checkbox

                  label={

                    word_group
                    
                    ?

                    (<label>
                      <div>
                        {word} ({this.state.perspective_name_list[perspective_index]})
                      </div>

                      <div style={{marginTop: '0.5em', marginBottom: '0.5em'}}>
                        {getTranslation('Belongs to a group:')}
                      </div>

                      <div>

                        {map(word_group[0],

                          ([perspective_index, [transcription_str, translation_str]],
                            word_index) => (

                          <div
                            key={'sg' + index + 'gr_self_word' + word_index}>
                            {`${transcription_str} ${translation_str}
                              (${this.state.perspective_name_list[perspective_index]})`}
                          </div>

                        ))}
                      </div>
                      </label>)
                    
                    :

                    (`${word} (${this.state.perspective_name_list[perspective_index]})`)}

                  checked={
                    sg_select_list[index].hasOwnProperty(id2str(word_entry_id))}

                  disabled={disabled_flag}

                  onChange={(e, { checked }) => {

                    if (checked)
                      sg_select_list[index][id2str(word_entry_id)] = null;
                    else
                      delete sg_select_list[index][id2str(word_entry_id)];

                    this.setState({ sg_select_list });}}
                />
              </List.Item>
            </List>
          </List.Item>

        {single_list.length > 0 && (
          <List.Item>
            <span style={opacity_style}>
              {getTranslation('Suggested cognates:')}
            </span>

            <List>
              {map(
                single_list,
                
                ([perspective_index, [transcription_str, translation_str], entry_id],
                  single_index) => (

                <List.Item key={'sg' + index + 'single' + single_index}>
                  <Checkbox

                    label={
                      `${transcription_str} ${translation_str}
                        (${this.state.perspective_name_list[perspective_index]})`}

                    checked={
                      sg_select_list[index].hasOwnProperty(id2str(entry_id))}

                    disabled={disabled_flag}

                    onChange={(e, { checked }) => {

                      if (checked)
                        sg_select_list[index][id2str(entry_id)] = null;
                      else
                        delete sg_select_list[index][id2str(entry_id)];

                      this.setState({ sg_select_list });}}
                  />
                </List.Item>

              ))}
            </List>
          </List.Item>
        )}

        {group_list.length > 0 && (
          <List.Item>
            <span style={opacity_style}>
              {getTranslation('Suggested cognate groups:')}
            </span>

            <List>
              {map(
                group_list,
                
                ([word_list, entry_id],
                  group_index) => (

                <List.Item
                  key={'sg' + index + 'group' + group_index}>

                  <Checkbox

                    checked={
                      sg_select_list[index].hasOwnProperty(id2str(entry_id))}

                    disabled={disabled_flag}

                    onChange={(e, { checked }) => {

                      if (checked)
                        sg_select_list[index][id2str(entry_id)] = null;
                      else
                        delete sg_select_list[index][id2str(entry_id)];

                      this.setState({ sg_select_list });}}

                    label={
                      <label>
                      <div>

                        {map(word_list,

                          ([perspective_index, [transcription_str, translation_str]],
                            word_index) => (

                          <div
                            key={'sg' + index + 'gr' + group_index + 'word' + word_index}>
                            {`${transcription_str} ${translation_str}
                              (${this.state.perspective_name_list[perspective_index]})`}
                          </div>

                        ))}
                      </div>
                      </label>}
                  />

                </List.Item>

              ))}
            </List>
          </List.Item>
        )}

        </List>

        {
          connected_flag ?

          <Message positive>
            <Message.Header>
              {getTranslation('Connected')}
            </Message.Header>
          </Message> :

          error_flag ?

          <Message negative>
            <Message.Header>
              {getTranslation('Query error')}
            </Message.Header>
            <p>
              {getTranslation('Failed to connect selected lexical entries, please contact developers.')}
            </p>
          </Message> :

          invalidated_flag ?

          <Message>
            <Message.Header>
              {getTranslation('Invalidated')}
            </Message.Header>
            <p>
              {getTranslation(
                'Another suggestion was accepted, source perspective word and/or one of suggested ' +
                'cognate words or cognate groups have been connected.')}
            </p>
          </Message> :

          <Button
            basic
            positive

            content={
              sg_state_list[index] == 'connecting' ?
              getTranslation('Connecting...') :
              getTranslation('Connect')}

            disabled={
              Object.keys(sg_select_list[index]).length <= 1 ||
              sg_state_list[index] == 'connecting'}

            size='mini'
            onClick={() => sg_connect(index)}
          />
        }

      </Segment>
    );
  }
}

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

      suggestion_list: null,
      suggestion_field_id: null,

      intermediate_url_list: null,

      plotly_data: [],
      plotly_legend_data: [],
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
      matchTranslationsValue: 'first_three',

      onlyOrphansFlag: true,

      debugFlag: false,
      intermediateFlag: false,

      computing: false,

      /* Related to multi-language cognate analysis. */

      language_list: [],
      language_id_set: new Set(),

      transcriptionFieldIdStrMap: {},
      translationFieldIdStrMap: {},
      perspectiveSelectionMap: {},

      perspectiveSelectionCountMap: new Map(),

      sg_select_list: null,
      sg_state_list: null,
      sg_count: null,
      sg_entry_map: null,

      sg_current_page: 1,
    };

    this.initialize_single = this.initialize_single.bind(this);
    this.initialize_multi = this.initialize_multi.bind(this);
    this.initPerspectiveData = this.initPerspectiveData.bind(this);
    this.initPerspectiveList = this.initPerspectiveList.bind(this);

    this.handleCreate = this.handleCreate.bind(this);

    this.language_render = this.language_render.bind(this);
    this.single_language_render = this.single_language_render.bind(this);
    this.multi_language_render = this.multi_language_render.bind(this);

    this.match_translations_render = this.match_translations_render.bind(this);
    this.admin_section_render = this.admin_section_render.bind(this);

    this.suggestions_render = this.suggestions_render.bind(this);

    this.sg_connect = this.sg_connect.bind(this);
  }

  componentDidMount()
  {
    const multi =
      this.props.mode == 'multi_analysis' ||
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

    this.treePath = tree.slice(tree.length - 1, tree.length).reverse();
    this.baseLanguageId = tree[tree.length - 1].id;

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
    const {
      client,
      perspectiveId,
      mode,
      data: {
        all_fields: allFields,
        perspective: {
          columns, tree, english_status }}} = this.props;

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

    let p_select_count = 0;

    for (const value of this.state.perspectiveSelectionList)
      if (value)
        p_select_count++;

    this.state.perspectiveSelectionCountMap[''] = p_select_count;
    this.state.perspectiveSelectionCountMap['_max'] = this.perspective_list.length;

    this.setState({ initialized: true });
  }

  /*
   * Initializes data for multi-language cognate analysis.
   */
  async initialize_multi()
  {
    const {
      client,
      perspectiveId,
      mode,
      data: {
        all_fields: allFields,
        perspective: {
          columns, tree, english_status }}} = this.props;

    const language_id_list = languageIdList.slice();

    if (!checkLanguageId(tree[tree.length - 1].id))
      language_id_list.push(tree[tree.length - 1].id);

    const { data: {
      languages }} =
        
      await client.query({
        query: cognateAnalysisMultiDataQuery,
        variables: {
          languageIdList: language_id_list },
      });

    this.initialize_common(
      allFields, columns, tree, english_status);

    this.available_list = [];
    this.perspective_list = [];

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

    await this.initPerspectiveData(this.baseLanguageId, []);

    this.initialize_state();

    const base_language = this.language_dict[id2str(this.baseLanguageId)];

    base_language.loading = false;
    base_language.treePath = this.treePath;
    base_language.available_list = this.available_list;
    base_language.perspective_list = this.perspective_list;

    /* Preparing info of perspective and transcription/translation field selections. */

    let p_select_count = 0;

    for (const [index, {perspective}] of this.perspective_list.entries())
    {
      const p_key = id2str(perspective.id);

      this.state.transcriptionFieldIdStrMap[p_key] = this.state.transcriptionFieldIdStrList[index];
      this.state.translationFieldIdStrMap[p_key] = this.state.translationFieldIdStrList[index];
      this.state.perspectiveSelectionMap[p_key] = this.state.perspectiveSelectionList[index];

      if (this.state.perspectiveSelectionList[index])
        p_select_count++;
    }

    const language_id_str = id2str(this.baseLanguageId);

    this.state.language_id_set.add(language_id_str);

    this.state.perspectiveSelectionCountMap[''] = p_select_count;
    this.state.perspectiveSelectionCountMap['_max'] = this.perspective_list.length;

    this.state.perspectiveSelectionCountMap[language_id_str] = p_select_count;
    this.state.perspectiveSelectionCountMap[language_id_str + '_max'] = this.perspective_list.length;

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

    const {
      perspectiveSelectionList,
      transcriptionFieldIdStrList,
      translationFieldIdStrList,
      perspectiveSelectionMap,
      transcriptionFieldIdStrMap,
      translationFieldIdStrMap,
      perspectiveSelectionCountMap } = this.state;

    const p_select_count = perspectiveSelectionCountMap[''];
    const p_max_count = perspectiveSelectionCountMap['_max'];

    let p_language_select_count = 0;

    for (const [index, {perspective}] of this.perspective_list.entries())
    {
      const p_key = id2str(perspective.id);

      if (!transcriptionFieldIdStrMap.hasOwnProperty(p_key))
        transcriptionFieldIdStrMap[p_key] = transcriptionFieldIdStrList[index];

      if (!translationFieldIdStrMap.hasOwnProperty(p_key))
        translationFieldIdStrMap[p_key] = translationFieldIdStrList[index];

      if (!perspectiveSelectionMap.hasOwnProperty(p_key))
        perspectiveSelectionMap[p_key] = perspectiveSelectionList[index];

      if (perspectiveSelectionMap[p_key])
        p_language_select_count++;
    }

    const language_id_str = id2str(language.id);

    perspectiveSelectionCountMap[language_id_str] = p_language_select_count;
    perspectiveSelectionCountMap[language_id_str + '_max'] = language.perspective_list.length;

    perspectiveSelectionCountMap[''] = p_select_count + p_language_select_count;
    perspectiveSelectionCountMap['_max'] = p_max_count + language.perspective_list.length;

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
      this.props.mode == 'multi_analysis' ||
      this.props.mode == 'multi_reconstruction' ||
      this.props.mode == 'multi_suggestions')
    {
      this.state.groupFieldIdStr = value;

      const {
        perspectiveSelectionMap,
        perspectiveSelectionCountMap } = this.state;

      let p_select_count = 0;
      let p_max_count = 0;

      for (const language of this.state.language_list)
      {
        this.available_list = language.available_list;
        this.initialize_state();

        language.perspective_list = this.perspective_list;

        /* Re-initializing selection counts for partial selection. */

        let p_language_select_count = 0;

        for (const { perspective } of language.perspective_list)
        {
          if (perspectiveSelectionMap[id2str(perspective.id)])
            p_language_select_count++;        
        }

        p_select_count += p_language_select_count;
        p_max_count += language.perspective_list.length;

        const language_id_str = id2str(language.id);

        perspectiveSelectionCountMap[language_id_str] = p_language_select_count;
        perspectiveSelectionCountMap[language_id_str + '_max'] = language.perspective_list.length;
      }

      perspectiveSelectionCountMap[''] = p_select_count;
      perspectiveSelectionCountMap['_max'] = p_max_count;

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
        suggestion_list,
        suggestion_field_id,
        intermediate_url_list }}})
  {
    if (
      result.length > 1048576 &&
      (this.props.mode == 'suggestions' || this.props.mode == 'multi_suggestions'))

      result = getTranslation('Skipping text output, too long.');

    /* Data of the 2d cognate distance plots. */

    var plotly_data = [];
    var plotly_legend_data = [];

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

      if (embedding_2d.length > 25)

        for (var i = 0; i < embedding_2d.length; i++)

          plotly_legend_data.push({
            x: [0.0],
            y: [0.0],
            type: 'scatter',
            mode: 'none',
            name: (i + 1) + ') ' + perspective_name_list[i]});
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

    /* Initializing suggestions data, if required. */

    const sg_select_list = [];
    const sg_state_list = [];

    const sg_count = {
      left: 0,
      connecting: 0,
      connected: 0,
      error: 0,
      invalidated: 0}

    const sg_entry_map = {};

    if (suggestion_list)
    {
      for (var i = 0; i < suggestion_list.length; i++)
      {
        const [
          perspective_index,
          word,
          word_entry_id,
          word_group,
          single_list,
          group_list] =
          
          suggestion_list[i];

        const sg_select_item = {};

        function f(entry_id)
        {
          const id_str = id2str(entry_id);

          sg_select_item[id_str] = null;

          if (!sg_entry_map.hasOwnProperty(id_str))
            sg_entry_map[id_str] = {};

          sg_entry_map[id_str][i] = null;
        };

        f(word_entry_id);

        for (const [
          perspective_index, [translation_str, transcription_str], entry_id] of single_list)

          f(entry_id);

        for (const [
          word_list, entry_id] of group_list)

          f(entry_id);

        sg_select_list.push(sg_select_item);
        sg_state_list.push('left');
      }

      sg_count.left = suggestion_list.length;
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
      suggestion_list,
      suggestion_field_id,
      intermediate_url_list,
      plotly_data,
      plotly_legend_data,
      plotly_3d_data,
      x_range,
      y_range,
      z_range,
      x_span,
      y_span,
      z_span,
      computing: false,
      sg_select_list,
      sg_state_list,
      sg_count,
      sg_entry_map,
    });
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
      this.props.mode == 'multi_analysis' ||
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

    /* Match translations parameter for suggestions. */

    const matchTranslationsValue =

      this.state.matchTranslationsFlag ?
        (this.state.matchTranslationsValue == 'first_three' ? 1 : 2) :
        0;

    /* If we are to perform acoustic analysis, we will try to launch it in the background. */

    if (this.props.mode == 'acoustic')

      computeCognateAnalysis({
        variables: {
          sourcePerspectiveId: perspectiveId,
          baseLanguageId: this.baseLanguageId,
          groupFieldId: groupField.id,
          perspectiveInfoList: perspectiveInfoList,
          mode: 'acoustic',
          matchTranslationsValue,
          onlyOrphansFlag: this.state.onlyOrphansFlag,
          figureFlag: true,
          debugFlag: this.state.debugFlag,
          intermediateFlag: this.state.intermediateFlag,
        },
      }).then(
        () => {

          window.logger.suc(
            getTranslation('Cognate acoustic analysis is launched. Please check out tasks for details.'));

          this.props.closeModal();
        },
        () => {

          window.logger.err(
            getTranslation('Failed to launch cognate acoustic analysis!'));
        }
      );

    /* Otherwise we will launch it as usual and then will wait for results to display them. */

    else
    {
      this.setState({
        computing: true });

      const backend_mode =
        this.props.mode == 'multi_analysis' ? '' :
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
          matchTranslationsValue,
          onlyOrphansFlag: this.state.onlyOrphansFlag,
          figureFlag: backend_mode == '',
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
   * Match translations options used in cognate suggestions.
   */
  match_translations_render()
  {
    return (
      <List>
        <List.Item>
          <Checkbox
            label={getTranslation('Match translations')}
            style={{marginTop: '1em', verticalAlign: 'middle'}}
            checked={this.state.matchTranslationsFlag}
            onChange={(e, { checked }) => {
              this.setState({ matchTranslationsFlag: checked });}}
          />
        </List.Item>

        <List.Item>
          <List relaxed>
            <List.Item>
              <Checkbox
                radio
                disabled={!this.state.matchTranslationsFlag}
                label={getTranslation('Any three consecutive characters.')}
                name='matchTranslationsRadioGroup'
                value='first_three'
                checked={this.state.matchTranslationsValue == 'first_three'}
                onChange={(e, { value }) => {
                  this.setState({ matchTranslationsValue: value });}}
              />
            </List.Item>
            <List.Item>
              <Checkbox
                radio
                disabled={!this.state.matchTranslationsFlag}
                label={getTranslation('All characters.')}
                name='matchTranslationsRadioGroup'
                value='all'
                checked={this.state.matchTranslationsValue == 'all'}
                onChange={(e, { value }) => {
                  this.setState({ matchTranslationsValue: value });}}
              />
            </List.Item>
          </List>
        </List.Item>

        <List.Item>
          <Checkbox
            label={getTranslation('Only for orphans (words not included in existing etymology groups)')}
            style={{marginTop: '0.75em', verticalAlign: 'middle'}}
            checked={this.state.onlyOrphansFlag}
            onChange={(e, { checked }) => {
              this.setState({ onlyOrphansFlag: checked });}}
          />
        </List.Item>

        {
          !this.state.suggestion_list &&
          this.props.user.id === undefined && (

          <Message negative>
            <Message.Header>
              {getTranslation('Unauthorized user')}
            </Message.Header>
            <p>
              {getTranslation(
                'Only authorized users can create new cognate connections based on cognate suggestions.')}
            </p>
          </Message>

        )}
      </List>
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

  language_render(multi_flag)
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
              {getTranslation('Perspective is not published')}
            </Message.Header>
            <p>
              {getTranslation('Cognate suggestions are available only for perspectives in the "Published" or "Limited access" state.')}
            </p>
          </Message>
        </Modal.Content>
      );

    return multi_flag ?
      this.multi_language_render() :
      this.single_language_render();
  }

  /*
   * Perspective selection for a single language, e.g. for simple cognate analysis.
   */
  single_language_render()
  {
    const error_flag =
      this.perspective_list.length <= 1 ||
      !this.state.library_present;

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

        {this.perspective_list.length > 1 && (
          <SLSelection
            perspective_list={this.perspective_list}
            perspectiveSelectionList={this.state.perspectiveSelectionList}
            transcriptionFieldIdStrList={this.state.transcriptionFieldIdStrList}
            translationFieldIdStrList={this.state.translationFieldIdStrList}
            perspectiveSelectionCountMap={this.state.perspectiveSelectionCountMap}
          />
        )}

        {this.perspective_list.length <= 1 && (
          <span>
            {getTranslation(
              'Selected dictionary group doesn\'t have multiple dictionaries with selected ' +
              'cognate grouping field present, cognate analysis is impossible.')}
          </span>
        )}

        </div>

        {!this.state.library_present && (
          <List>
            <div style={{color: 'red'}}>
              {getTranslation('Analysis library is absent, please contact system administrator.')}
            </div>
          </List>
        )}

        {!error_flag &&
          this.props.mode == 'suggestions' &&
          this.match_translations_render()}

        {!error_flag &&
          this.props.user.id == 1 &&
          this.admin_section_render()}

      </Modal.Content>
    );
  }

  /*
   * Perspective selection for multiple languages, e.g. for multi-language cognate analysis.
   */
  multi_language_render()
  {
    const error_flag =
      !this.state.library_present;

    return (
      <Modal.Content>

        {this.grouping_field_render()}

        <MLSelection
          language_list={this.state.language_list}
          perspectiveSelectionMap={this.state.perspectiveSelectionMap}
          transcriptionFieldIdStrMap={this.state.transcriptionFieldIdStrMap}
          translationFieldIdStrMap={this.state.translationFieldIdStrMap}
          perspectiveSelectionCountMap={this.state.perspectiveSelectionCountMap}
          language_id_set={this.state.language_id_set}
          available_language_list={this.language_list}
          onAddLanguage={(event, data) =>
          {
            const language = this.language_dict[data.value];

            language.treePath = language.tree.slice().reverse();
            language.perspective_list = [];

            language.loading = true;
            this.initialize_language(language);

            const {
              language_list,
              language_id_set,
              perspectiveSelectionMap,
              perspectiveSelectionCountMap } = this.state;

            language_list.push(language);
            language_id_set.add(data.value);

            this.setState({
              language_list,
              language_id_set,
            });
          }}
        />

        {!this.state.library_present && (
          <List>
            <div style={{color: 'red'}}>
              {getTranslation('Analysis library is absent, please contact system administrator.')}
            </div>
          </List>
        )}

        {!error_flag &&
          this.props.mode == 'multi_suggestions' &&
          this.match_translations_render()}

        {!error_flag &&
          this.props.user.id == 1 &&
          this.admin_section_render()}

        {!error_flag &&
          this.props.mode == 'multi_reconstruction' &&
          this.state.language_list.length <= 1 && (

          <Message>
            <Message.Header>
              {getTranslation('Multiple languages required')}
            </Message.Header>
            <p>
              {getTranslation(
                'Cognate multi-language reconstruction requires dictionaries from at least 2 languages.')}
            </p>
          </Message>
        )}

      </Modal.Content>
    )
  }

  /* Launches connection of suggestion specified by index. */

  sg_connect(
    index,
    window_log_flag = true)
  {
    const {
      suggestion_field_id,
      sg_select_list,
      sg_state_list,
      sg_count,
      sg_entry_map } = this.state;

    const entry_id_str_list = 
      Object.keys(sg_select_list[index]);

    const entry_id_list =

      entry_id_str_list.map(id_str =>
        id_str.split('/').map(str => parseInt(str)));

    sg_state_list[index] = 'connecting';

    sg_count.connecting++;
    sg_count.left--;

    this.setState({
      sg_state_list,
      sg_count, });

    this.props.connectGroup({
      variables: {
        fieldId: suggestion_field_id,
        connections: entry_id_list },
    }).then(

      () => {

        if (window_log_flag)
          window.logger.suc(`${getTranslation('Connected')}.`);

        sg_state_list[index] = 'connected';

        sg_count.connected++;
        sg_count.connecting--;

        for (const entry_id_str of entry_id_str_list)
        {
          for (const sg_index of
            Object.keys(sg_entry_map[entry_id_str]))
          {
            if (sg_state_list[sg_index] == 'left')
            {
              sg_state_list[sg_index] = 'invalidated';

              sg_count.invalidated++;
              sg_count.left--;
            }
          }
        }

        this.setState({
          sg_state_list,
          sg_count, });

      },
    
      () => {

        sg_state_list[index] = 'error';

        sg_count.error++;
        sg_count.connecting--;

        this.setState({
          sg_state_list,
          sg_count, });

      });
  }

  suggestions_render()
  {
    const {
      suggestion_list,
      suggestion_field_id,
      sg_select_list,
      sg_state_list,
      sg_count,
      sg_entry_map,
      sg_current_page } = this.state;

    /* Shows current suggestion state counts. */

    function f_count()
    {
      return (
        <List>

          <List.Item>
            {sg_count.left} {getTranslation('left')}
          </List.Item>

          {sg_count.connecting > 0 && (
            <List.Item>
              {sg_count.connecting} {getTranslation('connecting...')}
            </List.Item>
          )}

          {sg_count.connected > 0 && (
            <List.Item>
              {sg_count.connected} {getTranslation('connected')}
            </List.Item>
          )}

          {sg_count.invalidated > 0 && (
            <List.Item>
              {sg_count.invalidated} {getTranslation('invalidated')}
            </List.Item>
          )}

          {sg_count.error > 0 && (
            <List.Item>
              {sg_count.error} {getTranslation('errors')}
            </List.Item>
          )}

        </List>
      );
    }

    const total_pages =

      Math.floor(
        (suggestion_list.length + SUGGESTIONS_PER_PAGE - 1) /
        SUGGESTIONS_PER_PAGE);

    const start_index =
      (sg_current_page - 1) * SUGGESTIONS_PER_PAGE;

    return (
      <div>

      {sg_count.left < suggestion_list.length &&
        f_count()}

      <Pagination
        activePage={sg_current_page}
        totalPages={total_pages}
        onPageChange={(e, { activePage }) => this.setState({ sg_current_page: activePage })}
      />
      
      {map(

        suggestion_list.slice(
          start_index,
          start_index + SUGGESTIONS_PER_PAGE),

        ([perspective_index,
          word,
          word_entry_id,
          word_group,
          single_list,
          group_list],
          
          in_page_index) => (

          // Not so good hack in the name of performance,
          // we just give our state to be modified in the child compoment.

          <SuggestionSelection
            key={'suggestion' + (start_index + in_page_index)}
            perspective_index={perspective_index}
            word={word}
            word_entry_id={word_entry_id}
            word_group={word_group}
            single_list={single_list}
            group_list={group_list}
            index={start_index + in_page_index}
            perspective_name_list={this.state.perspective_name_list}
            sg_select_list={this.state.sg_select_list}
            sg_state_list={this.state.sg_state_list}
            sg_connect={this.sg_connect}
          />

        ))}

      <Pagination
        activePage={sg_current_page}
        totalPages={total_pages}
        onPageChange={(e, { activePage }) => this.setState({ sg_current_page: activePage })}
      />

      {sg_count.left < suggestion_list.length &&
        f_count()}

      <div
        style={{'marginTop': '1em'}}>

        <Button
          basic
          positive

          content={
            getTranslation('Connect all selected')}

          disabled={
            sg_count.left <= 0 ||
            sg_count.connecting > 0}

          size='mini'

          onClick={() => {

            /* Launching connections of all suggestions with enough selected lexical entries, skipping
             * suggestions which would be invalidated if launched connections are successful. */

            const invalid_set = {};

            for (var i = 0; i < suggestion_list.length; i++)
            {
              if (
                sg_state_list[i] != 'left' ||
                invalid_set.hasOwnProperty(i))

                continue;

              const entry_id_str_list = 
                Object.keys(sg_select_list[i]);

              if (entry_id_str_list.length <= 1)
                continue;

              for (const entry_id_str of entry_id_str_list)
              {
                Object.assign(
                  invalid_set,
                  sg_entry_map[entry_id_str]);
              }

              this.sg_connect(i, false);
            }

          }}
        />

      </div>

      </div>
    );
  }

  render()
  {
    if (!this.state.initialized)
    {
      return (
        <Dimmer active={true} inverted>
          <Loader>{getTranslation('Loading...')}</Loader>
        </Dimmer>
      );
    }

    const { mode } = this.props;

    const multi =
      mode == 'multi_analysis' ||
      mode == 'multi_reconstruction' ||
      mode == 'multi_suggestions';

    return (
      <div>
        <Modal
          closeIcon
          onClose={this.props.closeModal}
          dimmer
          open
          size="fullscreen"
          className="lingvo-modal2">

          <Modal.Header>{
            mode == 'acoustic' ?
              getTranslation('Cognate acoustic analysis') :
            mode == 'multi_analysis' ?
              getTranslation('Cognate multi-language analysis') :
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

          {this.language_render(multi)}

          <Modal.Actions>
            <Button
              content={this.state.computing ?
                <span>Computing... <Icon name="spinner" loading /></span> :
                "Compute"}
              onClick={this.handleCreate}
              disabled={
                (!multi && (
                  this.perspective_list.length <= 1 ||
                  !this.state.perspectiveSelectionList.some(enabled => enabled))) ||
                (multi && (
                  this.state.language_list.length <= 0 ||
                  mode == 'multi_reconstruction' && this.state.language_list.length <= 1)) ||
                this.state.computing}
              className="lingvo-button-violet"
            />
            <Button content="Close" onClick={this.props.closeModal} className="lingvo-button-basic-black" />
          </Modal.Actions>

          {this.state.library_present && this.state.result !== null && (
            <Modal.Content scrolling style={{maxHeight: '95vh'}}>

              <h3>Analysis results
                ({this.state.dictionary_count} dictionaries, {this.state.group_count} cognate groups and {this.state.transcription_count} transcriptions analysed):</h3>

              <List relaxed>
                <List.Item>
                  {this.state.not_enough_count} cognate groups were excluded from the analysis due to not having lexical entries in at least two selected dictionaries.
                </List.Item>

                {this.state.result.length > 0 &&
                  mode != 'suggestions' &&
                  mode != 'multi_suggestions' && (
                  <List.Item>
                    <a href={this.state.xlsx_url}>
                      {getTranslation('XLSX-exported analysis results')}
                    </a>
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

              {this.state.suggestion_list && (
                <div>

                  <Header style={{marginTop: '1em'}}>
                    {this.state.suggestion_list.length} suggestions
                  </Header>

                  {this.props.user.id === undefined ? (

                    <Message negative>
                      <Message.Header>
                        {getTranslation('Unauthorized user')}
                      </Message.Header>
                      <p>
                        {getTranslation(
                          'Only authorized users can create new cognate connections based on cognate suggestions.')}
                      </p>
                    </Message>

                  ) : (

                    <div>
                      {this.suggestions_render()}
                    </div>

                  )}

                </div>
              )}

              {this.state.plotly_data.length > 0 && (
                <List>
                  <List.Item>
                    Etymological distance tree:
                  </List.Item>

                  {this.state.embedding_2d.length <= 25 ? (

                    <List.Item>
                      <Plot
                        data={this.state.plotly_data}
                        layout={{
                          width: 1200,
                          height: 800 + 28 * this.state.embedding_2d.length,
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
                            xanchor: "left",
                            yanchor: "top",
                            x: 0.0,
                            y: -0.05,
                            font: {size: 14},
                            itemsizing: "constant"},
                          title: 'Minimum spanning tree (2d relative distance embedding)'}}
                      />
                    </List.Item>

                    ) : (

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
                          showlegend: false,
                          title: 'Minimum spanning tree (2d relative distance embedding)'}}
                      />
                      <Plot
                        data={this.state.plotly_legend_data}
                        layout={{
                          width: 1200,
                          height: 24 * this.state.embedding_2d.length,
                          xaxis: {
                            visible: false},
                          yaxis: {
                            visible: false},
                          legend: {
                            xanchor: "left",
                            yanchor: "top",
                            x: 0.0,
                            y: 1.0,
                            font: {size: 14},
                            itemsizing: "constant"},
                          title: 'Legend'}}
                      />
                    </List.Item>

                  )}
                  {this.state.embedding_3d.length <= 25 ? (

                    <List.Item>
                      <Plot
                        data={this.state.plotly_3d_data}
                        layout={{
                          width: 1200,
                          height: 900 + 28 * this.state.embedding_2d.length,
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

                  ) : (

                    <List.Item>
                      <Plot
                        data={this.state.plotly_3d_data}
                        layout={{
                          width: 1200,
                          height: 900,
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
                          showlegend: false,
                          title: 'Minimum spanning tree (3d relative distance embedding)'}}
                      />
                      <Plot
                        data={this.state.plotly_legend_data}
                        layout={{
                          width: 1200,
                          height: 24 * this.state.embedding_2d.length,
                          xaxis: {
                            visible: false},
                          yaxis: {
                            visible: false},
                          legend: {
                            xanchor: "left",
                            yanchor: "top",
                            x: 0.0,
                            y: 1.0,
                            font: {size: 14},
                            itemsizing: "constant"},
                          title: 'Legend'}}
                      />
                    </List.Item>

                  )}
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
  graphql(cognateAnalysisDataQuery),
  graphql(computeCognateAnalysisMutation, { name: 'computeCognateAnalysis' }),
  graphql(connectMutation, { name: 'connectGroup' }),
  withApollo
)(CognateAnalysisModal);
