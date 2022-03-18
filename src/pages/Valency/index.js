import React from 'react';
import { compose } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Button, Checkbox, Dimmer, Icon, Input, Label, List, Loader, Message, Pagination, Popup, Segment,
  Select } from 'semantic-ui-react';
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
      }
      has_valency_data
    }
  }
`;

export const valencyDataQuery = gql`
  query valencyData(
    $perspectiveId: LingvodocID!,
    $offset: Int!)
  {
    valency_data(
      perspective_id: $perspectiveId,
      offset: $offset)
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
    $instanceId: Int!,
    $annotationValue: Boolean!)
  {
    set_valency_annotation(
      instance_id: $instanceId,
      annotation_value: $annotationValue)
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

      creating_valency_data: false,
      creating_valency_error: false,
      loading_valency_data: false,
      loading_valency_error: false,

      valency_data: null,

      instance_count: null,
      current_page: 1,
      total_pages: null,

      instance_list: null,
      sentence_map: null,
      annotation_map: null,
      user_map: null,

      selection_dict: {},

    };

    this.createValencyData = this.createValencyData.bind(this);
    this.setValencyAnnotation = this.setValencyAnnotation.bind(this);
    this.acceptAllSelected = this.acceptAllSelected.bind(this);

    this.queryValencyData = this.queryValencyData.bind(this);

    this.setPerspective = this.setPerspective.bind(this);
    this.setPage = this.setPage.bind(this);

    this.render_instance = this.render_instance.bind(this);
  }

  queryValencyData(perspective, current_page)
  {
    const { client } = this.props;

    client.query({
      query: valencyDataQuery,
      variables: {
        perspectiveId: perspective.id,
        offset: (current_page - 1) * 25},
      fetchPolicy: 'no-cache',
    }).then(

      ({ data }) =>
      {
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

        /* __DEBUG__ */

        /*
        console.log('instance_list', instance_list);
        console.log('sentence_map', sentence_map);
        console.log('annotation_map', annotation_map);
        console.log('user_map', user_map);
        */

        this.setState({
          valency_data: data.valency_data,
          instance_count,
          total_pages: Math.floor((instance_count + 25 - 1) / 25),
          instance_list,
          sentence_map,
          annotation_map,
          user_map,
          loading_valency_data: false });
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
      this.setState({ perspective });
      return;
    }

    this.setState({
      perspective,
      selection_dict: {},
      loading_valency_data: true,
      loading_valency_error: false });

    this.queryValencyData(perspective, 1);
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
          creating_valency_data: false,
          loading_valency_data: true,
          loading_valency_error: false });

        this.queryValencyData(this.state.perspective, 1);

      },
      () => {
        this.setState({
          creating_valency_data: false,
          creating_valency_error: true });
      }
    );
  }

  setValencyAnnotation(instance_id, annotation_value)
  {
    console.log('setValencyAnnotation', instance_id, annotation_value);

    this.props.setValencyAnnotation({
      variables: {
        instanceId: instance_id,
        annotationValue: annotation_value,
      },
    }).then(
      () => {
        window.logger.suc(getTranslation('Set valency annotation.'));
        
        if (!this.state.annotation_map.has(instance_id))
          this.state.annotation_map.set(instance_id, new Map([[this.props.user.id, annotation_value]]));

        else
          this.state.annotation_map.get(instance_id).set(this.props.user.id, annotation_value);

        if (!this.state.user_map.has(this.props.user.id))
          this.state.user_map.set(this.props.user.id, this.props.user.name);

        this.setState({ annotation_map: this.state.annotation_map });
      },
      () => {
      }
    );
  }

  acceptAllSelected()
  {
    const {
      annotation_map,
      selection_dict } = this.state;

    const user_id = this.props.user.id;

    for (const instance of this.state.instance_list)
    {
      const selected =
        !selection_dict.hasOwnProperty(instance.id) || 
        selection_dict[instance.id];

      if (!selected)
        continue;

      const user_annotation_map =
        annotation_map.has(instance.id) ? annotation_map.get(instance.id) : null;

      let annotation_value =
        user_annotation_map &&
        user_annotation_map.has(user_id) &&
        user_annotation_map.get(user_id);

      if (!annotation_value)
        this.setValencyAnnotation(instance.id, true);
    }
  }

  setPage(active_page)
  {
    console.log('active_page', active_page);

    this.setState({
      current_page: active_page,
      loading_valency_data: true,
      loading_valency_error: false });

    this.queryValencyData(this.state.perspective, active_page);
  }

  render_instance(instance)
  {
    /* __DEBUG__ */

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

    const selection_dict =
      this.state.selection_dict;

    return (
      <Segment key={instance.id}>

        <Checkbox
          style={{marginRight: '0.5em', verticalAlign: 'middle'}}
          checked={!selection_dict.hasOwnProperty(instance.id) || selection_dict[instance.id]}
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
                <span key={index}>
                  <span className='token_from'>{token.token}</span>
                  <span> </span>
                </span>
              ) :

            index == instance_to ?

              (
                <span key={index}>
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
                trigger={token_content}
                basic
                flowing>
                {item_list.map(item => (<div>{item[0]}: {item[1]}</div>))}
              </Popup> :

              <span>{token_content}</span>
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
              onClick={() => this.setValencyAnnotation(instance.id, true)}/>

            <Button
              basic
              compact
              color='blue'
              content={getTranslation('Reject')}
              disabled={!annotation_value}
              onClick={() => this.setValencyAnnotation(instance.id, false)}/>

          </Button.Group>

          {annotation_value && (
            <span style={{'marginLeft': '0.5em'}}>{getTranslation('Accepted')}</span>)}
        </div>

        {user_annotation_map && user_annotation_map.size > 0 && (
          <div style={{'marginTop': '0.5em'}}>
            {Array.from(user_annotation_map.entries())
              .filter(([user_id, annotation_value]) => annotation_value)
              .map(([user_id, annotation_value]) => this.state.user_map.get(user_id))
              .sort()
              .map(user_name => (
                <div style={{'marginTop': '0.25em'}}>{`${getTranslation('Accepted by')} ${user_name}`}</div>))}
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
              {getTranslation('Only registered users can convert work with valency data.')}
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
            {getTranslation('User sign-in error.')}
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

    /* __DEBUG__ */

    //console.log('perspectives', perspectives);

    const perspective_option_list = [];
    const perspective_id_map = new Map();

    for (let i = 0; i < perspectives.length; i++)
    {
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

    const { valency_data } = this.state;

    return (
      <div className="background-content">
        <Segment>

          <p>{getTranslation('Perspective')}:</p>

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

          {this.state.loading_valency_data && (
            <div style={{'marginTop': '1em'}}>
              <span>{getTranslation('Loading valency data...') + ' '}<Icon name="spinner" loading /></span>
            </div>
          )}

          {!this.state.loading_valency_data && valency_data && (

            <div style={{'marginTop': '1em'}}>

              <p>{getTranslation('Instances')} ({this.state.current_page * 25 - 24}-{this.state.current_page * 25}/{this.state.instance_count}):</p>

              <Pagination
                activePage={this.state.current_page}
                totalPages={this.state.total_pages}
                onPageChange={(e, { activePage }) => this.setPage(activePage)}
              />

              {map(this.state.instance_list, this.render_instance)}

              <Button
                style={{'marginBottom': '1em'}}
                basic
                compact
                positive
                content={getTranslation('Accept all selected')}
                onClick={() => this.acceptAllSelected()}
              />

              <br/>

              <Pagination
                activePage={this.state.current_page}
                totalPages={this.state.total_pages}
                onPageChange={(e, { activePage }) => this.setPage(activePage)}
              />

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
