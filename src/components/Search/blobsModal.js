import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { compose, pure } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Modal, List, Button, Embed, Message } from 'semantic-ui-react';
import { closeBlobsModal } from 'ducks/blobs';
import { compositeIdToString } from 'utils/compositeId';

const blobQuery = gql`
  query Blob($id: LingvodocID!) {
    userblob(id: $id) {
      id
      name
      content
    }
  }
`;

const Blob = ({ data: { loading, error, userblob: blob } }) => {
  if (loading || error) {
    return null;
  }
  return (
    <Modal trigger={<Button basic>{blob.name}</Button>}>
      <Modal.Header>{blob.name}</Modal.Header>
      <Modal.Content>
        <Embed icon="right circle arrow" active url={blob.content} />
      </Modal.Content>
    </Modal>
  );
};

Blob.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    userblob: PropTypes.object,
  }).isRequired,
};

const BlobWithData = compose(graphql(blobQuery), pure)(Blob);

const BlobsModal = ({ visible, actions, blobs, dictionary }) => {
  if (!visible) {
    return null;
  }
  return (
    <Modal open={visible} dimmer size="small">
      <Modal.Header>{dictionary.translation}</Modal.Header>
      <Modal.Content>
        <List>
          {blobs.length === 0 && <Message info>No files</Message>}
          {blobs.map(blobId => (
            <List.Item key={compositeIdToString(blobId)}>
              <BlobWithData id={blobId} />
            </List.Item>
          ))}
        </List>
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content="Close" onClick={actions.closeBlobsModal} />
      </Modal.Actions>
    </Modal>);
};

export default compose(
  connect(
    state => state.blobs,
    dispatch => ({
      actions: bindActionCreators({ closeBlobsModal }, dispatch),
    })
  ),
  pure
)(BlobsModal);
