import React from 'react';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Checkbox, Dimmer, Header, Icon, Input, Label, List, Loader, Message, Pagination, Popup,
  Segment, Select } from 'semantic-ui-react';
import { connect } from 'react-redux';
import { map } from 'lodash';

import { getTranslation } from 'api/i18n';
import { compositeIdToString as id2str } from 'utils/compositeId';

import './style.scss';

const sourcePerspectiveQuery = gql`
  query sourcePersepctiveData {
    perspectives(only_with_parser_result_data: true) {
      id
      tree {
        id
        translation
        marked_for_deletion
      }
      has_valency_data
    }
  }
`;

export const valencyDataQuery = gql`
  query valencyData(
    $perspectiveId: LingvodocID!,
    $offset: Int,
    $limit: Int,
    $verbFlag: Boolean,
    $verbPrefix: String,
    $caseFlag: Boolean)
  {
    valency_data(
      perspective_id: $perspectiveId,
      offset: $offset,
      limit: $limit,
      verb_flag: $verbFlag,
      verb_prefix: $verbPrefix,
      case_flag: $caseFlag)
  }
`;

const createValencyDataMutation = gql`
  mutation createValencyData(
    $perspectiveId: LingvodocID!)
  {
    create_valency_data(
      perspective_id: $perspectiveId)
    {
      triumph
    }
  }
`;

const setValencyAnnotationMutation = gql`
  mutation setValencyAnnotation(
    $annotationList: [ValencyInstanceAnnotation]!)
  {
    set_valency_annotation(
      annotation_list: $annotationList)
    {
      triumph
    }
  }
`;

class Valency extends React.Component
{
  constructor(props)
  {  
    super(props);

    this.state = {

      perspective: null,

      sort_verb: false,
      sort_case: false,

      creating_valency_data: false,
      creating_valency_error: false,
      loading_valency_data: false,
      loading_valency_error: false,

      valency_data: null,

      instance_count: null,
      current_page: 1,
      input_go_to_page: 1,
      items_per_page: 25,
      total_pages: null,

      instance_list: null,
      sentence_map: null,
      annotation_map: null,
      user_map: null,

      prefix_filter: '',
      all_verb_list: [],
      data_verb_list: [],
      data_verb_prefix: '',
      prefix_verb_list: [],
      show_data_verb_list: [],
      show_prefix_verb_list: [],
      show_prefix_str_list: [],

      selection_default: false,
      selection_dict: {},

    };

    this.createValencyData = this.createValencyData.bind(this);
    this.setValencyAnnotation = this.setValencyAnnotation.bind(this);
    this.acceptRejectAllSelected = this.acceptRejectAllSelected.bind(this);

    this.queryValencyData = this.queryValencyData.bind(this);

    this.setPerspective = this.setPerspective.bind(this);
    this.setPage = this.setPage.bind(this);
    this.setItemsPerPage = this.setItemsPerPage.bind(this);
    this.setPrefix = this.setPrefix.bind(this);

    this.render_instance = this.render_instance.bind(this);

    this.valency_data_query_count = 0;
  }

  queryValencyData(
    perspective,
    current_page,
    items_per_page,
    sort_verb,
    sort_case,
    verb_prefix)
  {
    const { client } = this.props;

    items_per_page =
      items_per_page || this.state.items_per_page;

    if (sort_verb == null)
      sort_verb = this.state.sort_verb;

    if (sort_case == null)
      sort_case = this.state.sort_case;

    if (verb_prefix == null)
      verb_prefix = (sort_verb ? this.state.prefix_filter : null);

    const query_index =
      ++this.valency_data_query_count;

    client.query({
      query: valencyDataQuery,
      variables: {
        perspectiveId: perspective.id,
        offset: (current_page - 1) * items_per_page,
        limit: items_per_page,
        verbFlag: sort_verb,
        verbPrefix: verb_prefix,
        caseFlag: sort_case},
      fetchPolicy: 'no-cache',
    }).then(

      ({ data }) =>
      {
        if (query_index < this.valency_data_query_count)
          return;

        const {
          instance_count,
          instance_list,
          sentence_list,
          annotation_list,
          user_list} = data.valency_data;

        const sentence_map =
          new Map(sentence_list.map(sentence => [sentence.id, sentence]));

        const annotation_map =

          new Map(
            annotation_list.map(
              ([instance_id, user_annotation_list]) =>
                [instance_id, new Map(user_annotation_list)]));

        const user_map =
          new Map(user_list);

        const state_obj = {
          valency_data: data.valency_data,
          instance_count,
          total_pages: Math.floor((instance_count + items_per_page - 1) / items_per_page),
          instance_list,
          sentence_map,
          annotation_map,
          user_map,
          data_verb_prefix: verb_prefix,
          loading_valency_data: false };

        if (sort_verb)
        {
          const verb_list =
            data.valency_data.verb_list;

          const all_verb_list = [];
          const data_verb_list = [];
          const prefix_verb_list = [];

          for (const [verb, has_prefix] of verb_list)
          {
            all_verb_list.push(verb);

            if (has_prefix)
            {
              data_verb_list.push(verb);
              prefix_verb_list.push(verb);
            }
          }

          state_obj.all_verb_list = all_verb_list;
          state_obj.data_verb_list = data_verb_list;
          state_obj.prefix_verb_list = prefix_verb_list;

          let show_data_verb_list = [];
          let show_prefix_verb_list = [];

          if (data_verb_list.length > 15)
          {
            for (const verb of data_verb_list.slice(0, 10))
              show_data_verb_list.push(verb);

            show_data_verb_list.push('...');

            for (const verb of data_verb_list.slice(-5))
              show_data_verb_list.push(verb);
          }
          else
            show_data_verb_list = data_verb_list;

          if (prefix_verb_list.length > 15)
          {
            for (const verb of prefix_verb_list.slice(0, 10))
              show_prefix_verb_list.push(verb);

            show_prefix_verb_list.push('...');

            for (const verb of prefix_verb_list.slice(-5))
              show_prefix_verb_list.push(verb);
          }
          else
            show_prefix_verb_list = prefix_verb_list;

          state_obj.show_data_verb_list = show_data_verb_list;
          state_obj.show_prefix_verb_list = show_prefix_verb_list;

          const show_prefix_str_set = new Set();
          const show_prefix_str_list = [];

          const prefix_length = verb_prefix.length;

          for (const verb of prefix_verb_list)
          {
            if (verb.length < prefix_length)
              continue;

            const prefix_str =
              verb.slice(0, prefix_length + 1);

            if (
              prefix_str.length > prefix_length &&
              !show_prefix_str_set.has(prefix_str))
            {
              show_prefix_str_set.add(prefix_str);
              show_prefix_str_list.push(prefix_str);
            }
          }

          state_obj.show_prefix_str_list = show_prefix_str_list;
        }

        this.setState(state_obj);
      },

      (error) =>
      {
        this.setState({
          loading_valency_data: false,
          loading_valency_error: true });
      }
    );
  }

  setPerspective(perspective)
  {
    if (!perspective.has_valency_data)
    {
      this.setState({
        perspective,
        valency_data: null,
        prefix_filter: '',
        selection_dict: {},
      });

      return;
    }

    this.setState({
      perspective,
      valency_data: null,
      prefix_filter: '',
      selection_dict: {},
      loading_valency_data: true,
      loading_valency_error: false,
    });

    this.queryValencyData(perspective, 1, null, null, null, '');
  }

  createValencyData()
  {
    this.setState({ creating_valency_data: true });

    this.props.createValencyData({
      variables: {
        perspectiveId: this.state.perspective.id,
      },
    }).then(
      () => {

        window.logger.suc(getTranslation('Created valency data.'));

        this.state.perspective.has_valency_data = true;

        this.setState({
          current_page: 1,
          input_go_to_page: 1,
          creating_valency_data: false,
          loading_valency_data: true,
          loading_valency_error: false,
          valency_data: null,
        });

        this.queryValencyData(this.state.perspective, 1);

      },
      () => {
        this.setState({
          creating_valency_data: false,
          creating_valency_error: true });
      }
    );
  }

  setValencyAnnotation(annotation_list)
  {
    this.props.setValencyAnnotation({
      variables: {
        annotationList: annotation_list,
      },
    }).then(
      () => {
        window.logger.suc(getTranslation('Set valency annotation.'));

        for (const [instance_id, annotation_value] of annotation_list)
        {
          if (!this.state.annotation_map.has(instance_id))
            this.state.annotation_map.set(instance_id, new Map([[this.props.user.id, annotation_value]]));

          else
            this.state.annotation_map.get(instance_id).set(this.props.user.id, annotation_value);

          if (!this.state.user_map.has(this.props.user.id))
            this.state.user_map.set(this.props.user.id, this.props.user.name);
        }

        this.setState({ annotation_map: this.state.annotation_map });
      },
      () => {
      }
    );
  }

  acceptRejectAllSelected(accept_value)
  {
    const {
      annotation_map,
      selection_default,
      selection_dict } = this.state;

    const user_id = this.props.user.id;
    const annotation_list = [];

    for (const instance of this.state.instance_list)
    {
      const selected =

        selection_dict.hasOwnProperty(instance.id) ?
          selection_dict[instance.id] :
          selection_default;

      if (!selected)
        continue;

      const user_annotation_map =

        annotation_map.has(instance.id) ?
          annotation_map.get(instance.id) :
          null;

      let annotation_value =

        user_annotation_map &&
        user_annotation_map.has(user_id) &&
        user_annotation_map.get(user_id);

      if (annotation_value != accept_value)
        annotation_list.push([instance.id, accept_value]);
    }

    if (annotation_list.length > 0)
      this.setValencyAnnotation(annotation_list);
  }

  setPage(active_page)
  {
    active_page =
      Math.max(1, Math.min(active_page, this.state.total_pages));

    this.setState({
      current_page: active_page,
      input_go_to_page: active_page,
      loading_valency_data: true,
      loading_valency_error: false,
      valency_data: null,
    });

    this.queryValencyData(this.state.perspective, active_page);
  }

  setItemsPerPage(items_per_page)
  {
    const current_page =
      Math.floor((this.state.current_page - 1) * this.state.items_per_page / items_per_page) + 1;

    this.setState({
      current_page,
      input_go_to_page: current_page,
      items_per_page,
      loading_valency_data: true,
      loading_valency_error: false,
      valency_data: null,
    });

    this.queryValencyData(this.state.perspective, current_page, items_per_page);
  }

  setPrefix(prefix_str)
  {
    let prefix_verb_list = [];

    /* Refinement. */

    if (prefix_str.startsWith(this.state.prefix_filter))

      prefix_verb_list =
        this.state.prefix_verb_list.filter(verb => verb.startsWith(prefix_str));

    /* Not a refinement, have to start from the list of all verbs. */

    else

      prefix_verb_list =
        this.state.all_verb_list.filter(verb => verb.startsWith(prefix_str));

    let show_prefix_verb_list = [];

    if (prefix_verb_list.length > 15)
    {
      for (const verb of prefix_verb_list.slice(0, 10))
        show_prefix_verb_list.push(verb);

      show_prefix_verb_list.push('...');

      for (const verb of prefix_verb_list.slice(-5))
        show_prefix_verb_list.push(verb);
    }
    else
      show_prefix_verb_list = prefix_verb_list;

    const show_prefix_str_set = new Set();
    const show_prefix_str_list = [];

    const prefix_length = prefix_str.length;

    for (const verb of prefix_verb_list)
    {
      if (verb.length < prefix_length)
        continue;

      const new_prefix_str =
        verb.slice(0, prefix_length + 1);

      if (
        new_prefix_str.length > prefix_length &&
        !show_prefix_str_set.has(new_prefix_str))
      {
        show_prefix_str_set.add(new_prefix_str);
        show_prefix_str_list.push(new_prefix_str);
      }
    }

    this.setState({
      prefix_filter: prefix_str,
      prefix_verb_list,
      show_prefix_verb_list,
      show_prefix_str_list,
    });
  }

  render_instance(instance)
  {
    const sentence =
      this.state.sentence_map.get(instance.sentence_id);

    const instance_data = sentence.instances[instance.index];

    const instance_case = instance_data['case'];
    const [instance_from, instance_to] = instance_data['location'];

    const annotation_map = this.state.annotation_map;
    const user_id = this.props.user.id;

    const user_annotation_map =
      annotation_map.has(instance.id) ? annotation_map.get(instance.id) : null;

    let annotation_value =
      user_annotation_map &&
      user_annotation_map.has(user_id) &&
      user_annotation_map.get(user_id);

    const {
      selection_default,
      selection_dict } =

      this.state;

    return (
      <Segment key={instance.id}>

        <Checkbox
          style={{marginRight: '0.5em', verticalAlign: 'middle'}}
          checked={
            selection_dict.hasOwnProperty(instance.id) ?
              selection_dict[instance.id] :
              selection_default}
          onChange={(e, { checked }) => {
            selection_dict[instance.id] = checked;
            this.setState({ selection_dict });
          }}
        />

        {sentence.tokens.map((token, index) => {

          const item_list = 

            Object.entries(token)
              .filter(item => item[0] != 'token')
              .sort();

          const token_content = 

            index == instance_from ?

              (
                <span>
                  <span className='token_from'>{token.token}</span>
                  <span> </span>
                </span>
              ) :

            index == instance_to ?

              (
                <span>
                  <span className='token_to'>{token.token}</span>
                  <span> </span>
                  <span className='token_case'>{instance_case.toUpperCase()}</span>
                  <span> </span>
                </span>
              ) :

              <span key={index}>{token.token} </span>;

          return (

            item_list.length > 0 ?

              <Popup
                key={`${index}${token}`}
                trigger={token_content}
                basic
                flowing>
                {item_list.map(item => (
                  <div key={item[0]}>{item[0]}: {item[1]}</div>))}
              </Popup> :

              <span
                key={`${index}${token}`}>
                {token_content}
              </span>
          );
        })}

        <br/>

        <div style={{'marginTop': '0.5em'}}>
          <Button.Group>

            <Button
              basic
              compact
              positive
              content={getTranslation('Accept')}
              disabled={annotation_value}
              onClick={() => this.setValencyAnnotation([[instance.id, true]])}/>

            <Button
              basic
              compact
              color='blue'
              content={getTranslation('Reject')}
              disabled={!annotation_value}
              onClick={() => this.setValencyAnnotation([[instance.id, false]])}/>

          </Button.Group>

          {annotation_value && (
            <span style={{'marginLeft': '0.5em'}}>{getTranslation('Accepted')}</span>)}
        </div>

        {user_annotation_map && user_annotation_map.size > 0 && (
          <div style={{'marginTop': '0.5em'}}>
            {Array.from(user_annotation_map.entries())
              .filter(([annotation_user_id, annotation_value]) => annotation_value)
              .map(
                ([annotation_user_id, annotation_value]) =>
                  [this.state.user_map.get(annotation_user_id), annotation_user_id])
              .sort()
              .map(([user_name, user_id]) => (
                <div
                  key={user_id}
                  style={{'marginTop': '0.25em'}}>
                  {`${getTranslation('Accepted by')} ${user_name}`}
                </div>))}
          </div>
        )}
      </Segment>);
  }

  render()
  {
    if (this.props.user.id === undefined && !this.props.loading)

      return (
        <div className="background-content">
          <Message>
            <Message.Header>
              {getTranslation('Please sign in')}
            </Message.Header>
            <p>
              {getTranslation('Only registered users can work with valency data.')}
            </p>
          </Message>
        </div>);

    else if (
      this.props.loading && !this.props.error ||
      this.props.data.loading && !this.props.data.error)

      return (
        <div className="background-content">
          <Segment>
            <Loader active inline='centered' indeterminate>{getTranslation('Loading...')}</Loader>
          </Segment>
        </div>);

    else if (this.props.error)

      return (
        <div className="background-content">
          <Message
            compact
            negative>
            {getTranslation('User sign-in error, please sign in; if not successful, please contact administrators.')}
          </Message>
        </div>);

    else if (this.props.data.error)

      return (
        <div className="background-content">
          <Message
            compact
            negative>
            {getTranslation('General error, please contact administrators.')}
          </Message>
        </div>);

    const {
      perspectives } = this.props.data;

    const perspective_option_list = [];
    const perspective_id_map = new Map();

    for (let i = 0; i < perspectives.length; i++)
    {
      if (perspectives[i].tree.some(value => value.marked_for_deletion))
        continue;

      const id_str =
        id2str(perspectives[i].id);

      const text_str =
        perspectives[i].tree
          .map(value => value.translation)
          .reverse()
          .join(' \u203a ')

      perspectives[i].text_str = text_str;

      perspective_option_list.push({
          key: i,
          value: id_str,
          text: text_str });

      perspective_id_map.set(id_str, perspectives[i]);
    }

    const {
      current_page,
      items_per_page,
      data_verb_list,
      show_data_verb_list,
      show_prefix_verb_list,
      show_prefix_str_list,

      annotation_map,
      selection_default,
      selection_dict } =

      this.state;

    const user_id =
      this.props.user.id;

    const render_instance_list = [];

    let has_selected_to_accept = false;
    let has_selected_to_reject = false;

    if (
      !this.state.loading_valency_data &&
      this.state.valency_data &&
      this.state.instance_list.length > 0)
    {
      let prev_verb = null;
      let prev_case = null;

      if (this.state.sort_verb)
      {
        const verb_lex =
          this.state.instance_list[0].verb_lex;

        render_instance_list.push(
          <Header key={`${render_instance_list.length}${verb_lex}`}>
            {verb_lex}
          </Header>);

        prev_verb = verb_lex;
      }

      if (this.state.sort_case)
      {
        const case_str =
          this.state.instance_list[0].case_str;

        render_instance_list.push(
          <Header key={`${render_instance_list.length}${case_str}`}>
            {case_str.toUpperCase()}
          </Header>);

        prev_case = case_str;
      }

      for (let i = 0; i < this.state.instance_list.length; i++)
      {
        const instance = this.state.instance_list[i];

        if (
          this.state.sort_verb &&
          instance.verb_lex != prev_verb)
        {
          render_instance_list.push(
            <Header key={`${render_instance_list.length}${instance.verb_lex}`}>
              {instance.verb_lex}
            </Header>);

          prev_verb = instance.verb_lex;
          prev_case = null;
        }

        if (
          this.state.sort_case &&
          instance.case_str != prev_case)
        {
          render_instance_list.push(
            <Header key={`${render_instance_list.length}${instance.case_str}`}>
              {instance.case_str.toUpperCase()}
            </Header>);

          prev_case = instance.case_str;
        }

        render_instance_list.push(
          this.render_instance(instance));

        /* Checking if we have selected instances we can accept/reject. */

        if (has_selected_to_accept && has_selected_to_reject)  
          continue;

        const selected =

          selection_dict.hasOwnProperty(instance.id) ?
            selection_dict[instance.id] :
            selection_default;

        if (!selected)
          continue;

        const user_annotation_map =

          annotation_map.has(instance.id) ?
            annotation_map.get(instance.id) :
            null;

        let annotation_value =

          user_annotation_map &&
          user_annotation_map.has(user_id) &&
          user_annotation_map.get(user_id);

        if (annotation_value)
          has_selected_to_reject = true;
        else
          has_selected_to_accept = true;
      }
    }

    return (
      <div className="background-content">
        <Segment>

          <div style={{'marginBottom': '0.5em'}}>{getTranslation('Perspective')}:</div>

          <Select
            fluid
            placeholder={getTranslation('Please select perspective.')}
            search
            options={perspective_option_list}
            onChange={(e, { value }) => this.setPerspective(perspective_id_map.get(value))}
          />

          {this.state.perspective && !this.state.perspective.has_valency_data && (
            <Button
              style={{'marginTop': '0.5em'}}
              basic
              positive
              content={
                this.state.creating_valency_data ?
                <span>{getTranslation('Creating valency data...') + ' '}<Icon name="spinner" loading /></span> :
                getTranslation('Create valency data')}
              disabled={!this.state.perspective || this.state.creating_valency_data}
              onClick={() => this.createValencyData()}
            />)}

          {(this.state.valency_data || this.state.loading_valency_data) && (
            <div style={{'marginTop': '0.5em'}}>
              <Checkbox
                toggle
                label={
                  getTranslation('Selected by default') + ': ' +
                    (this.state.selection_default ? getTranslation('on') : getTranslation('off'))}
                checked={this.state.selection_default}
                onChange={(e, data) => this.setState({ selection_default: data.checked })}
              />
            </div>
          )}

          {(this.state.valency_data || this.state.loading_valency_data) && (
            <div style={{'marginTop': '0.5em'}}>
              <Checkbox
                label={getTranslation('Sort by verbs')}
                checked={this.state.sort_verb}
                onChange={(e, { checked }) => {

                  this.setState({
                    sort_verb: checked,
                    current_page: 1,
                    input_go_to_page: 1,
                    loading_valency_data: true,
                    loading_valency_error: false,
                    valency_data: null,
                    prefix_filter: '',
                    all_verb_list: [],
                    data_verb_list: [],
                    prefix_verb_list: [],
                    show_data_verb_list: [],
                    show_prefix_verb_list: [],
                    show_prefix_str_list: [],
                  });

                  this.queryValencyData(
                    this.state.perspective, 1, null, checked, null, '');

                }}
              />
            </div>
          )}

          {(this.state.valency_data || this.state.loading_valency_data) &&
            this.state.sort_verb && (

            <Segment
              disabled={this.state.loading_valency_data}
              style={{'marginTop': '0.5em', 'marginBottom': '0.5em', 'padding': '0.5em'}}>

              <div>

                {show_data_verb_list.length > 0 ?
                  (this.state.data_verb_prefix ? 
                    `${getTranslation('Verbs')} (${getTranslation('prefix')} "${this.state.data_verb_prefix}"): ` :
                    `${getTranslation('Verbs')}: `) :
                  (this.state.data_verb_prefix ? 
                    `${getTranslation('No verbs')} (${getTranslation('prefix')} "${this.state.data_verb_prefix}").` :
                    `${getTranslation('No verbs')}.`)}

                {show_data_verb_list.map((verb, index) => (

                  show_data_verb_list.length > 15 && verb == '...' ?

                    '..., ' :

                    <span
                      key={index}
                      className='clickable'
                      onClick={() => this.setPrefix(verb)}>
                      {verb}{index < show_data_verb_list.length - 1 ? ', ' : ''}
                    </span>

                ))}

                {show_data_verb_list.length > 0 &&
                  ` (${this.state.data_verb_list.length} ${getTranslation('verbs')})`}

              </div>

              <Input
                style={{'marginTop': '0.5em'}}
                placeholder={`${getTranslation('Verb prefix filter')}...`}
                value={this.state.prefix_filter}
                onKeyPress={e => { if (e.key === 'Enter') this.setPage(1); }}
                onChange={e => this.setPrefix(e.target.value)}
                icon={
                  this.state.prefix_filter ?
                    <Icon
                      name='delete'
                      link
                      onClick={() => this.setPrefix('')}
                    /> :
                    <Icon name='delete' disabled/>}
              />

              {show_prefix_str_list.length > 0 && (

                <div
                  style={{'marginTop': '0.5em'}}>

                  {show_prefix_str_list.map((prefix, index) => (
                    <span
                      key={index}
                      className='clickable'
                      onClick={() => this.setPrefix(prefix)}>
                      {prefix.charAt(0).toUpperCase() + prefix.substring(1)}
                      {index < show_prefix_str_list.length - 1 ? ' ' : ''}
                    </span>
                  ))}

                </div>
              )}

              <div
                style={{'marginTop': '0.5em'}}>

                {show_prefix_verb_list.length > 0 ?
                  (this.state.prefix_filter ? 
                    `${getTranslation('Filtered verbs')} (${getTranslation('prefix')} "${this.state.prefix_filter}"): ` :
                    `${getTranslation('Filtered verbs')}: `) :
                  (this.state.prefix_filter ? 
                    `${getTranslation('No filtered verbs')} (${getTranslation('prefix')} "${this.state.prefix_filter}").` :
                    `${getTranslation('No filtered verbs')}.`)}

                {show_prefix_verb_list.map((verb, index) => (

                  show_prefix_verb_list.length > 15 && verb == '...' ?

                    '..., ' :

                    <span
                      key={index}
                      className='clickable'
                      onClick={() => this.setPrefix(verb)}>
                      {verb}{index < show_prefix_verb_list.length - 1 ? ', ' : ''}
                    </span>

                ))}

                {show_prefix_verb_list.length > 0 &&
                  ` (${this.state.prefix_verb_list.length} ${getTranslation('verbs')})`}

              </div>

              <Button
                style={{'marginTop': '0.5em'}}
                basic
                compact
                disabled={this.state.prefix_filter == this.state.data_verb_prefix}
                onClick={() => this.setPage(1)}>
                {this.state.prefix_filter ?
                  `${getTranslation('Apply filter')} (${getTranslation('prefix')} "${this.state.prefix_filter}")` :
                  `${getTranslation('Apply filter')} (${getTranslation('no prefix')})`}
              </Button>

            </Segment>
          )}

          {(this.state.valency_data || this.state.loading_valency_data) && (
            <div style={{'marginTop': '0.5em'}}>
              <Checkbox
                label={getTranslation('Sort by cases')}
                checked={this.state.sort_case}
                onChange={(e, { checked }) => {

                  this.setState({
                    sort_case: checked,
                    current_page: 1,
                    input_go_to_page: 1,
                    loading_valency_data: true,
                    loading_valency_error: false,
                    valency_data: null,
                  });

                  this.queryValencyData(
                    this.state.perspective, 1, null, null, checked);

                }}
              />
            </div>
          )}

          {this.state.loading_valency_data && (
            <div style={{'marginTop': '1em'}}>
              <span>{getTranslation('Loading valency data...') + ' '}<Icon name="spinner" loading /></span>
            </div>
          )}

          {!this.state.loading_valency_data && this.state.valency_data && (

            <div style={{'marginTop': '1em'}}>

              {this.state.instance_list.length <= 0 ?

                <p>{getTranslation('No instances') + '.'}</p> :

                <div>
                  <p>
                    {getTranslation('Instances') + ' '}
                    ({(current_page - 1) * items_per_page + 1}-{
                      Math.min(current_page * items_per_page, this.state.instance_count)}/{
                      this.state.instance_count}):
                  </p>

                  <Pagination
                    activePage={this.state.current_page}
                    totalPages={this.state.total_pages}
                    siblingRange={2}
                    onPageChange={(e, { activePage }) => this.setPage(activePage)}
                  />

                  <span style={{'marginLeft': '1em'}}>
                    {getTranslation('Go to page') + ':'}
                  </span>

                  <Input
                    style={{'marginLeft': '0.5em', 'maxWidth': '7.5em'}}
                    min={1}
                    max={this.state.total_pages}
                    type='number'
                    defaultValue={this.state.input_go_to_page}
                    onChange={(e, { value }) => {this.state.input_go_to_page = value;}}
                    onKeyPress={e => { if (e.key === 'Enter') this.setPage(this.state.input_go_to_page); }}
                  />

                  <Button
                    style={{'paddingLeft': '0.75em', 'paddingRight': '0.75em'}}
                    basic
                    content={getTranslation('Go')}
                    onClick={() => this.setPage(this.state.input_go_to_page)}
                    attached='right'
                  />

                  <span style={{'marginLeft': '1em'}}>
                    {getTranslation('Items per page') + ':'}
                  </span>

                  <Select
                    style={{'marginLeft': '0.5em', 'minWidth': '7.5em'}}
                    value={items_per_page.toString()}
                    options={[
                      { value: '25', text: '25' },
                      { value: '50', text: '50' },
                      { value: '100', text: '100' },
                    ]}
                    onChange={(e, { value }) => this.setItemsPerPage(parseInt(value))}
                  />
                </div>}

              {render_instance_list}

              {this.state.instance_list.length > 0 && (

                <div>
                  <Button.Group>
                    <Button
                      style={{'marginBottom': '1em'}}
                      basic
                      compact
                      positive
                      disabled={!has_selected_to_accept}
                      content={getTranslation('Accept all selected')}
                      onClick={() => this.acceptRejectAllSelected(true)}
                    />
                    <Button
                      style={{'marginBottom': '1em'}}
                      basic
                      compact
                      color='blue'
                      disabled={!has_selected_to_reject}
                      content={getTranslation('Reject all selected')}
                      onClick={() => this.acceptRejectAllSelected(false)}
                    />
                  </Button.Group>

                  <br/>

                  <Pagination
                    activePage={this.state.current_page}
                    totalPages={this.state.total_pages}
                    siblingRange={2}
                    onPageChange={(e, { activePage }) => this.setPage(activePage)}
                  />

                  <span style={{'marginLeft': '1em'}}>
                    {getTranslation('Go to page') + ':'}
                  </span>

                  <Input
                    style={{'marginLeft': '0.5em', 'maxWidth': '7.5em'}}
                    min={1}
                    max={this.state.total_pages}
                    type='number'
                    defaultValue={this.state.input_go_to_page}
                    onChange={(e, { value }) => {this.state.input_go_to_page = value;}}
                    onKeyPress={e => { if (e.key === 'Enter') this.setPage(this.state.input_go_to_page); }}
                  />

                  <Button
                    style={{'paddingLeft': '0.75em', 'paddingRight': '0.75em'}}
                    basic
                    content={getTranslation('Go')}
                    onClick={() => this.setPage(this.state.input_go_to_page)}
                    attached='right'
                  />
                </div>
              )}

            </div>

          )}

        </Segment>
      </div>
    );
  }
}

export default compose(
  connect(state => state.user),
  graphql(sourcePerspectiveQuery),
  graphql(createValencyDataMutation, { name: 'createValencyData' }),
  graphql(setValencyAnnotationMutation, { name: 'setValencyAnnotation' }),
  withApollo
)(Valency);
