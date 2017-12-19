import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { compose, onlyUpdateForKeys } from 'recompose';
import { gql, graphql } from 'react-apollo';
import { connect } from 'react-redux';
import { Button, Modal, Input, Container, Segment, Grid } from 'semantic-ui-react';
import { closeDictionaryPropertiesModal } from 'ducks/properties';
import Map from './Map';
import styled from 'styled-components';

const Wrapper = styled.div`
  width: 100%;
  height: 600px;
  border: 1px solid grey;
  border-radius: 2px;

  .leaflet {
    width: 100%;
    height: 100%;

    .point {
      display: flex;
      flex-direction: column;
      height: 2em !important;
      width: 2em !important;
      border-radius: 2px;
      border: 1px solid black;

      span {
        flex: 1 1 auto;

        &:not(:last-child) {
          border-bottom: 1px solid black;
        }
      }
    }
  }
`;

const query = gql`
  query dictionaryProps($id: LingvodocID!) {
    dictionary(id: $id) {
      id
      parent_id
      translation
      additional_metadata {
        authors
        location
      }
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

class Properties extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      authors: '',
      location: null,
    };

    this.onChangeAuthors = this.onChangeAuthors.bind(this);
    this.onSaveAuthors = this.onSaveAuthors.bind(this);
    this.onChangeLocation = this.onChangeLocation.bind(this);
    this.onSaveLocation = this.onSaveLocation.bind(this);
  }

  componentWillReceiveProps(props) {
    const { data: { error, loading, dictionary } } = props;
    if (!(loading && error)) {
      const { additional_metadata: { authors, location } } = dictionary;
      if (authors !== this.state.authors && authors !== null) {
        this.setState({
          authors,
        });
      }
      if (location !== this.state.location) {
        this.setState({
          location,
        });
      }
    }
  }

  onChangeAuthors(e, { value }) {
    this.setState({
      authors: value,
    });
  }

  onSaveAuthors() {
    const { id, update } = this.props;
    update({
      variables: {
        id,
        meta: {
          authors: this.state.authors,
        },
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

  onChangeLocation({ lat, lng }) {
    this.setState({
      location: {
        lat,
        lng,
      },
    });
  }

  onSaveLocation() {
    const { id, update } = this.props;
    update({
      variables: {
        id,
        meta: {
          location: this.state.location,
        },
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

  render() {
    const { data: { error, loading, dictionary } } = this.props;

    if (loading || error) {
      return null;
    }

    const { additional_metadata: { location, authors } } = dictionary;

    return (
      <Container>
        <Segment>
          <Grid>
            <Grid.Column width={12}>
              <Input fluid label="Authors" value={this.state.authors} onChange={this.onChangeAuthors} />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button positive content="Save" onClick={this.onSaveAuthors} />
            </Grid.Column>
          </Grid>
        </Segment>

        <Segment>
          <Grid>
            <Grid.Column width={12}>
              <Input fluid label="Location" value={JSON.stringify(this.state.location)} disabled onChange={() => {}} />
            </Grid.Column>
            <Grid.Column width={4}>
              <Button positive content="Save" onClick={this.onSaveLocation} />
            </Grid.Column>
          </Grid>
        </Segment>
        <Segment>
          <Map location={this.state.location} authors={this.state.authors} onChange={this.onChangeLocation} />
        </Segment>
      </Container>
    );
  }
}

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  update: PropTypes.func.isRequired,
};

const DictionaryProperties = compose(
  onlyUpdateForKeys(['id', 'data']),
  graphql(query),
  graphql(updateMetadataMutation, { name: 'update' })
)(Properties);

const DictionaryPropertiesModal = (props) => {
  const { visible, actions, id } = props;

  return (
    <Modal open={visible} dimmer size="fullscreen">
      <Modal.Content>
        <DictionaryProperties id={id} />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Close" onClick={actions.closeDictionaryPropertiesModal} />
      </Modal.Actions>
    </Modal>
  );
};

DictionaryPropertiesModal.propTypes = {
  visible: PropTypes.bool.isRequired,
  actions: PropTypes.shape({
    closeDictionaryPropertiesModal: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(connect(
  state => state.properties,
  dispatch => ({ actions: bindActionCreators({ closeDictionaryPropertiesModal }, dispatch) })
))(DictionaryPropertiesModal);
