import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { branch, compose, onlyUpdateForKeys, renderNothing } from 'recompose';
import { graphql, withApollo } from 'react-apollo';
import TranslationGist from 'components/TranslationGist';
import Languages from 'components/Languages';
import EditDictionaryMetadata from 'components/EditDictionaryMetadata';
import gql from 'graphql-tag';
import { connect } from 'react-redux';
import { Button, Modal, Segment, Grid, Label, Form } from 'semantic-ui-react';
import styled from 'styled-components';
import { closeDictionaryPropertiesModal } from 'ducks/dictionaryProperties';
import { isEqual } from 'lodash';
import { compositeIdToString } from 'utils/compositeId';
import Map from './Map';

const query = gql`
  query dictionaryProps($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      parent_id
      translation_gist_id
      additional_metadata {
        kind
        humanSettlement
        speakersAmount
        years
        authors
        location
        blobs
        tag_list
      }
    }
    user_blobs {
      id
      name
      data_type
      content
      created_at
      marked_for_deletion
    }
  }
`;

const getParentLanguageQuery = gql`
  query getParentLanguage($id: LingvodocID!) {
    language(id: $id) {
      id
      translation
    }
  }
`;

const updateParentMutation = gql`
  mutation updateParentLanguage($id: LingvodocID!, $parent_id: LingvodocID!) {
    update_dictionary(id: $id, parent_id: $parent_id) {
      triumph
    }
  }
`;

const updateMetadataMutation = gql`
  mutation UpdateMetadata($id: LingvodocID!, $meta: ObjectVal!) {
    update_dictionary(id: $id, additional_metadata: $meta) {
      triumph
    }
  }
`;

const MarginForm = styled(Form)`
  margin-top: 1em;
  margin-bottom: 1em;
`;

class Properties extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      location: null,
      tags: '',
      files: [],
      parent: null,
      selectedParent: null,
    };
    this.initialState = {
      location: null,
      files: []
    };

    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onSaveLocation = this.onSaveLocation.bind(this);
    this.onChangeTags = this.onChangeTags.bind(this);
    this.onSaveTags = this.onSaveTags.bind(this);
    this.onChangeFiles = this.onChangeFiles.bind(this);
    this.onSaveFiles = this.onSaveFiles.bind(this);
    this.saveMeta = this.saveMeta.bind(this);
    this.onSelectParentLanguage = this.onSelectParentLanguage.bind(this);
    this.onUpdateParentLanguage = this.onUpdateParentLanguage.bind(this);
  }

  componentDidMount() {
    const { data: { error, loading, dictionary }, client } = this.props;
    if (loading || error) {
      return;
    }

    const {
      additional_metadata: {
        location, tag_list: tagList, blobs,
      },
    } = dictionary;

    if (location !== this.state.location) {
      this.initialState.location = location;
      this.setState({
        location,
      });
    }

    const tags = tagList.join(', ');
    if (tags !== this.state.tags) {
      this.setState({
        tags,
      });
    }

    if (!isEqual(this.state.files, blobs)) {
      this.initialState.files = blobs.map(compositeIdToString);
      this.setState({
        files: this.initialState.files
      });
    }

    const { parent_id } = dictionary;
    if (this.state.parent == null || this.state.parent.id != parent_id) {
      client.query({
        query: getParentLanguageQuery,
        variables: { id: parent_id }
      }).then(result => {
        this.setState({
          parent: result.data.language,
          selectedParent: result.data.language
        });
      });
    }
  }

  onChangeLocation({ lat, lng }) {
    this.setState({
      location: {
        lat,
        lng,
      },
    });
  }

  onSaveLocation() {
    this.initialState.location = this.state.location;
    this.saveMeta({
      location: this.state.location,
    });
  }

  onChangeTags(e, { value }) {
    this.setState({
      tags: value,
    });
  }

  onSaveTags() {
    const tagList = this.state.tags.split();
    this.saveMeta({
      tag_list: tagList,
    });
  }

  onChangeFiles(e, { value }) {
    this.setState({
      files: value,
    });
  }

  onSaveFiles() {
    const { data: { user_blobs: allFiles } } = this.props;
    const ids = this.state.files.map(id => allFiles.find(f => id === compositeIdToString(f.id))).map(f => f.id);
    this.initialState.files = this.state.files;
    this.saveMeta({
      blobs: ids,
    });
  }

  saveMeta(meta) {
    const { id, update } = this.props;
    update({
      variables: {
        id,
        meta,
      },
      refetchQueries: [
        {
          query,
          variables: {
            id,
          },
        },
      ],
    });
  }

  onSelectParentLanguage(parent) {
    this.setState({ selectedParent: parent });
  }

  onUpdateParentLanguage() {
    const { data: { dictionary }, client } = this.props;
    client.mutate({
      mutation: updateParentMutation,
      variables: {
        id: dictionary.id,
        parent_id: this.state.selectedParent.id
      }
    }).then(() => {
      this.props.data.refetch().then(() => {
        this.setState({ parent: this.state.selectedParent });
      });
    });
  }

  render() {
    if (this.state.parent == null) {
      return null;
    }
    
    const { data: { dictionary, user_blobs: files }, actions } = this.props;
    const { translation_gist_id: gistId } = dictionary;
    const options = files.map(file => ({ key: file.id, text: file.name, value: compositeIdToString(file.id) }));
    const parentName = this.state.parent == null ? null : this.state.parent.translation;
    const selectedParentName = this.state.selectedParent == null ? null : this.state.selectedParent.translation;

    return (
      <Modal open dimmer size="fullscreen" closeOnDimmerClick={false} onClose={actions.closeDictionaryPropertiesModal}>
        <Modal.Content>
          <Segment>
            <TranslationGist id={gistId} editable />
          </Segment>
          <EditDictionaryMetadata mode='edit' metadata={dictionary.additional_metadata} onSave={this.saveMeta} />

          {/*<Segment>
            <Grid>
              <Grid.Column width={12}>
                <Input fluid label="Tags" value={this.state.tags} onChange={this.onChangeTags} />
              </Grid.Column>
              <Grid.Column width={4}>
                <Button positive content="Save" onClick={this.onSaveTags} />
              </Grid.Column>
            </Grid>
          </Segment>*/}

          <MarginForm>
            <Segment>
              <Form.Group widths='equal'>
                <Label size='large'>Files</Label>
                <Form.Dropdown
                  labeled
                  fluid
                  multiple
                  selection
                  search
                  options={options}
                  onChange={this.onChangeFiles}
                  value={this.state.files}
                />
                <Button positive content="Save" disabled={JSON.stringify(this.state.files) == JSON.stringify(this.initialState.files)} onClick={this.onSaveFiles} />
              </Form.Group>
            </Segment>
            <Segment>
              <Form.Group widths='equal'>
                <Label size='large'>Location</Label>
                <Form.Input
                  fluid
                  value={this.state.location == null ? '' : JSON.stringify(this.state.location)}
                  disabled
                  onChange={() => {}}
                />
                <Button positive content="Save" disabled={this.state.location == this.initialState.location} onClick={this.onSaveLocation} />
                </Form.Group>
            </Segment>
          </MarginForm>
          <Grid>
            <Grid.Column width={8}>
              <div style={{ height: '400px' }}>
                <Form>
                  <Form.Group widths='equal'>
                    <Label size="large">Parent language: {selectedParentName || parentName}</Label>
                    <Button size="medium" positive disabled={selectedParentName == parentName} onClick={this.onUpdateParentLanguage}>Update</Button>
                  </Form.Group>
                </Form>
                <Languages height='95%' expanded={false} selected={this.state.parent} onSelect={this.onSelectParentLanguage}/>
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
              <Map location={this.state.location} onChange={this.onChangeLocation} />
            </Grid.Column>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button icon="minus" content="Close" onClick={actions.closeDictionaryPropertiesModal} />
        </Modal.Actions>
      </Modal>
    );
  }
}

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  update: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    closeDictionaryPropertiesModal: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  connect(
    state => state.dictionaryProperties,
    dispatch => ({ actions: bindActionCreators({ closeDictionaryPropertiesModal }, dispatch) })
  ),
  branch(({ id }) => !id, renderNothing),
  graphql(query),
  graphql(updateMetadataMutation, { name: 'update' }),
  branch(({ data: { loading, error } }) => loading || !!error, renderNothing),
  onlyUpdateForKeys(['id', 'data']),
  withApollo,
)(Properties);
