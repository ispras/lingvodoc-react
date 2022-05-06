import React, { useEffect } from "react";
import { connect } from "react-redux";
import { Button, Form, Grid, Header, Label, Loader, Message, Modal, Segment } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql, withApollo } from "@apollo/client/react/hoc";
import { isEqual, sortBy } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing } from "recompose";
import { bindActionCreators } from "redux";
import styled from "styled-components";

import { chooseTranslation as T } from "api/i18n";
import EditCorpusMetadata from "components/EditCorpusMetadata";
import EditDictionaryMetadata from "components/EditDictionaryMetadata";
import Languages from "components/Languages";
import TranslationGist from "components/TranslationGist";
import { closeDictionaryPropertiesModal } from "ducks/dictionaryProperties";
import TranslationContext from "Layout/TranslationContext";
import { compositeIdToString as id2str } from "utils/compositeId";

import Map from "./Map";

const query = gql`
  query dictionaryProps($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      category
      created_at
      created_by {
        id
        name
      }
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
        interrogator
        informant
        processing
        typeOfDiscourse
        typeOfSpeech
        speechGenre
        theThemeOfTheText
        titleOfTheWork
        genre
        timeOfWriting
        quantitativeCharacteristic
        bibliographicDataOfTheSource
        translator
        bibliographicDataOfTheTranslation
      }
      last_modified_at
    }
    user_blobs(data_type: "pdf", is_global: true) {
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
      translations
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

const updateAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $atom_id: LingvodocID, $locale_id: Int!, $content: String!) {
    update_dictionary_atom(id: $id, atom_id: $atom_id, locale_id: $locale_id, content: $content) {
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
      tags: "",
      files: [],
      parent: null,
      selectedParent: null,
      parentQuery: false
    };

    this.initialState = {
      location: null,
      files: []
    };

    this.check_init_flag = false;

    this.check_init = this.check_init.bind(this);

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

  check_init() {
    if (this.check_init_flag) {
      return;
    }

    const { loading, error } = this.props.data;

    if (loading || error) {
      return;
    }

    const {
      data: { dictionary },
      client
    } = this.props;

    const {
      additional_metadata: { location, tag_list: tagList, blobs }
    } = dictionary;

    if (location !== this.state.location) {
      this.initialState.location = location;
      this.setState({
        location
      });
    }

    const tags = tagList.join(", ");
    if (tags !== this.state.tags) {
      this.setState({
        tags
      });
    }

    const blobs_str_list = blobs.map(id2str);

    if (!isEqual(this.state.files, blobs_str_list)) {
      this.initialState.files = blobs_str_list;
      this.setState({
        files: this.initialState.files
      });
    }

    const { parent_id } = dictionary;
    if (!this.state.parentQuery && (this.state.parent == null || !isEqual(this.state.parent.id, parent_id))) {
      this.setState({ parentQuery: true });
      client
        .query({
          query: getParentLanguageQuery,
          variables: { id: parent_id }
        })
        .then(result => {
          this.setState({
            parent: result.data.language,
            selectedParent: result.data.language,
            parentQuery: false
          });
        });
    }

    this.check_init_flag = true;
  }

  componentDidMount() {
    this.check_init();
  }

  componentDidUpdate() {
    this.check_init();
  }

  onChangeLocation({ lat, lng }) {
    this.setState({
      location: {
        lat,
        lng
      }
    });
  }

  onSaveLocation() {
    this.initialState.location = this.state.location;
    this.saveMeta({
      location: this.state.location
    });
  }

  onChangeTags(e, { value }) {
    this.setState({
      tags: value
    });
  }

  onSaveTags() {
    const tagList = this.state.tags.split();
    this.saveMeta({
      tag_list: tagList
    });
  }

  onChangeFiles(e, { value }) {
    this.setState({
      files: value
    });
  }

  onSaveFiles() {
    const {
      data: { user_blobs: allFiles }
    } = this.props;
    const ids = this.state.files
      .map(id => allFiles.find(f => id === id2str(f.id)))
      .filter(f => f != undefined)
      .map(f => f.id);
    this.initialState.files = this.state.files;
    this.saveMeta({
      blobs: ids
    });
  }

  saveMeta(meta) {
    const { id, update } = this.props;
    update({
      variables: {
        id,
        meta
      },
      refetchQueries: [
        {
          query,
          variables: {
            id
          }
        }
      ]
    });
  }

  onSelectParentLanguage(parent) {
    this.setState({ selectedParent: parent });
  }

  onUpdateParentLanguage() {
    const {
      data: { dictionary },
      client
    } = this.props;
    client
      .mutate({
        mutation: updateParentMutation,
        variables: {
          id: dictionary.id,
          parent_id: this.state.selectedParent.id
        }
      })
      .then(() => {
        this.props.data.refetch().then(() => {
          this.setState({ parent: this.state.selectedParent });
        });
      });
  }

  render() {
    const {
      actions,
      title,
      data: { loading, error }
    } = this.props;

    const loader = (
      <Modal open dimmer size="fullscreen" closeOnDimmerClick={false} closeIcon className="lingvo-modal2">
        <Loader>{this.context("Loading")}...</Loader>
      </Modal>
    );

    if (loading) {
      return loader;
    } else if (error) {
      return (
        <Modal
          open
          closeOnDimmerClick={false}
          closeIcon
          onClose={actions.closeDictionaryPropertiesModal}
          className="lingvo-modal2"
        >
          <Modal.Header>{title}</Modal.Header>
          <Modal.Content>
            <Message negative>{this.context("Dictionary info loading error, please contact adiministrators.")}</Message>
          </Modal.Content>
        </Modal>
      );
    }

    if (this.state.parent == null) {
      return loader;
    }

    const {
      data: { dictionary, user_blobs: files },
      updateAtomMutation
    } = this.props;
    const { category, translation_gist_id: gistId } = dictionary;
    const options = sortBy(
      files.map(file => ({ key: file.id, text: file.name, value: id2str(file.id) })),
      file => file.text
    );
    const parentName = this.state.parent == null ? null : T(this.state.parent.translations);
    const selectedParentName = this.state.selectedParent == null ? null : T(this.state.selectedParent.translations);

    return (
      <Modal
        open
        dimmer
        size="fullscreen"
        closeOnDimmerClick={false}
        closeIcon
        onClose={actions.closeDictionaryPropertiesModal}
        className="lingvo-modal2"
      >
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <p>
            {this.context("Created by")}
            {": "}
            {dictionary.created_by.name}
          </p>
          <p>
            {this.context("Created at")}
            {": "}
            {new Date(dictionary.created_at * 1e3).toLocaleString()}
          </p>
          <p>
            {this.context("Last modified at")}
            {": "}
            {new Date(dictionary.last_modified_at * 1e3).toLocaleString()}
          </p>
          <Segment>
            <Header as="h3">{this.context("Translations")}</Header>
            <TranslationGist id={gistId} objectId={dictionary.id} editable updateAtomMutation={updateAtomMutation} />
          </Segment>
          {category === 0 ? (
            <EditDictionaryMetadata mode="edit" metadata={dictionary.additional_metadata} onSave={this.saveMeta} />
          ) : (
            <EditCorpusMetadata mode="edit" metadata={dictionary.additional_metadata} onSave={this.saveMeta} />
          )}
          <MarginForm>
            <Segment>
              <Form.Group widths="equal">
                <Label size="large">{this.context("Files")}</Label>
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
                <Button
                  content={this.context("Save")}
                  disabled={JSON.stringify(this.state.files) == JSON.stringify(this.initialState.files)}
                  onClick={this.onSaveFiles}
                  className="lingvo-button-violet"
                />
              </Form.Group>
            </Segment>
            <Segment>
              <Form.Group widths="equal">
                <Label size="large">{this.context("Location")}</Label>
                <Form.Input
                  fluid
                  value={this.state.location == null ? "" : JSON.stringify(this.state.location)}
                  disabled
                  onChange={() => {}}
                />
                <Button
                  content={this.context("Save")}
                  disabled={this.state.location == this.initialState.location}
                  onClick={this.onSaveLocation}
                  className="lingvo-button-violet"
                />
              </Form.Group>
            </Segment>
          </MarginForm>
          <Grid stackable>
            <Grid.Column width={8}>
              <div style={{ height: "400px" }}>
                <Form>
                  <Form.Group widths="equal">
                    <Label size="large">
                      {this.context("Parent language")}: {selectedParentName || parentName}
                    </Label>
                    <Button
                      size="medium"
                      positive
                      disabled={selectedParentName == parentName}
                      onClick={this.onUpdateParentLanguage}
                    >
                      {this.context("Update")}
                    </Button>
                  </Form.Group>
                </Form>
                <Languages
                  height="95%"
                  expanded={false}
                  inverted={false}
                  selected={this.state.parent}
                  onSelect={this.onSelectParentLanguage}
                />
              </div>
            </Grid.Column>
            <Grid.Column width={8}>
              <Map location={this.state.location} onChange={this.onChangeLocation} />
            </Grid.Column>
          </Grid>
        </Modal.Content>
        <Modal.Actions>
          <Button
            content={this.context("Close")}
            onClick={actions.closeDictionaryPropertiesModal}
            className="lingvo-button-basic-black"
          />
        </Modal.Actions>
      </Modal>
    );
  }
}

Properties.contextType = TranslationContext;

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  update: PropTypes.func.isRequired,
  actions: PropTypes.shape({
    closeDictionaryPropertiesModal: PropTypes.func.isRequired
  }).isRequired
};

export default compose(
  connect(
    state => state.dictionaryProperties,
    dispatch => ({ actions: bindActionCreators({ closeDictionaryPropertiesModal }, dispatch) })
  ),
  branch(({ id }) => !id, renderNothing),
  graphql(query),
  graphql(updateMetadataMutation, { name: "update" }),
  graphql(updateAtomMutation, { name: "updateAtomMutation" }),
  onlyUpdateForKeys(["id", "data"]),
  withApollo
)(Properties);
