import React from "react";
import { connect } from "react-redux";
import { Button, Embed, List, Message, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { compose, pure } from "recompose";
import { bindActionCreators } from "redux";

import { chooseTranslation as T } from "api/i18n";
import { closeBlobsModal } from "ducks/blobs";
import { compositeIdToString } from "utils/compositeId";

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
    <Modal closeIcon trigger={<Button basic>{blob.name}</Button>}>
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
    userblob: PropTypes.object
  }).isRequired
};

const BlobWithData = compose(graphql(blobQuery), pure)(Blob);

const BlobsModal = ({ visible, actions, blobs, dictionary }) => {
  if (!visible) {
    return null;
  }
  return (
    <Modal closeIcon onClose={actions.closeBlobsModal} open={visible} dimmer size="small" className="lingvo-modal2">
      <Modal.Header>{T(dictionary.translations)}</Modal.Header>
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
        <Button content="Close" onClick={actions.closeBlobsModal} className="lingvo-button-basic-black" />
      </Modal.Actions>
    </Modal>
  );
};

export default compose(
  connect(
    state => state.blobs,
    dispatch => ({
      actions: bindActionCreators({ closeBlobsModal }, dispatch)
    })
  ),
  pure
)(BlobsModal);
