import React, { useContext, useState, useEffect } from "react";
import { connect } from "react-redux";
import { Button, Loader, Message, Modal, Icon } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import PropTypes from "prop-types";
import { branch, compose, renderNothing, withProps } from "recompose";
import { bindActionCreators } from "redux";

import { closeUploadModal, updateUploadModal } from "ducks/upload";
import TranslationContext from "Layout/TranslationContext";

const getUploadDate = gql`
  query getUploadDate($id: LingvodocID!) {
    perspective(id: $id) {
      id
      additional_metadata { 
        uploaded_at 
      }
    }
  }
`;

const Upload = props => {

  const getTranslation = useContext(TranslationContext);
  const { id, title, data, actions, user, uploading, uploadPerspective } = props;
  const { loading, error, refetch, perspective } = data;
  useEffect(() => { refetch(); }, [uploading]);
  if (loading) {
    return (
      <Modal open dimmer size="fullscreen" closeOnDimmerClick={false} closeIcon className="lingvo-modal2">
        <Loader>{`${getTranslation("Loading")}...`}</Loader>
      </Modal>
    );
  } else if (error || uploading === null) {
    return (
      <Modal closeIcon onClose={actions.closeUploadModal} open className="lingvo-modal2">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <Message negative compact>
            <Message.Header>{getTranslation("Perspective info loading error")}</Message.Header>
            <div style={{ marginTop: "0.25em" }}>
              {getTranslation("Try reloading the page; if the error persists, please contact administrators.")}
            </div>
          </Message>
        </Modal.Content>
      </Modal>
    );
  }
  
  const { additional_metadata: { uploaded_at }} = perspective;

  return (
    <Modal
      closeIcon
      onClose={actions.closeUploadModal}
      open
      dimmer
      size="50%"
      className="lingvo-modal2"
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>
        <p>
          {getTranslation("Uploaded at")}
          {": "}
          { uploaded_at
            ? new Date(uploaded_at * 1000).toLocaleString()
            : "<never>"
          }
          { user.id == 1 && (
            <Button
              content={uploading ? (
                <span>
                  {getTranslation("Uploading")}... <Icon name="spinner" loading />
                </span>
              ) : (
                getTranslation(uploaded_at ? "Refresh" : "Upload")
              )}
              onClick={() => {
                actions.updateUploadModal(true);
                uploadPerspective();
              }}
              disabled={uploading}
              className="lingvo-button-greenest"
              style={{marginLeft: "1.5em"}}
            />
          )}
        </p>
      </Modal.Content>
      <Modal.Actions>
        { user.id !== undefined && uploaded_at && (
          <Button
            content={getTranslation("Uploaded corpora")}
            className="lingvo-button-violet"
            style={{float: 'left'}}
            onClick={()=> window.open(`http://83.149.198.78/${id[0]}_${id[1]}/search`, "_blank")}
          />
        )}
        <Button
          content={getTranslation("Close")}
          onClick={actions.closeUploadModal}
          className="lingvo-button-basic-black"
        />
      </Modal.Actions>
    </Modal>
  );
};

Upload.propTypes = {
  id: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  uploading: PropTypes.bool.isRequired,
  uploadPerspective: PropTypes.func.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    closeUploadModal: PropTypes.func.isRequired,
    updateUploadModal: PropTypes.func.isRequired
  }).isRequired
};

export default compose(
  connect(
    state => state.user,
  ),
  connect(
    state => state.upload,
    dispatch => ({ actions: bindActionCreators({ closeUploadModal, updateUploadModal }, dispatch) })
  ),
  branch(({ upload }) => !upload, renderNothing),
  withProps(({ upload: { id, title, uploading, uploadPerspective } }) => ({ id, title, uploading, uploadPerspective })),
  graphql(getUploadDate, { options: { fetchPolicy: "network-only" }})
)(Upload);
