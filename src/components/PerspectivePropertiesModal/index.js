import React, { useContext } from "react";
import { connect } from "react-redux";
import { Button, Divider, Header, Loader, Message, Modal } from "semantic-ui-react";
import { gql } from "@apollo/client";
import { graphql } from "@apollo/client/react/hoc";
import { isEqual } from "lodash";
import PropTypes from "prop-types";
import { branch, compose, onlyUpdateForKeys, renderNothing, withProps } from "recompose";
import { bindActionCreators } from "redux";

import Columns from "components/Columns";
import EditPerspectiveMetadata from "components/EditPerspectiveMetadata";
import TranslationGist from "components/TranslationGist";
import { closePerspectivePropertiesModal } from "ducks/perspectiveProperties";
import TranslationContext from "Layout/TranslationContext";

const query = gql`
  query PerspectivePropsQuery($id: LingvodocID!, $parentId: LingvodocID!) {
    dictionary(id: $parentId) {
      id
      perspectives {
        id
        translations
      }
    }
    perspective(id: $id) {
      created_at
      id
      created_by {
        id
        name
      }
      parent_id
      translations
      translation_gist_id
      additional_metadata {
        transcription_rules
        tag_list
      }
      last_modified_at
    }
  }
`;

const updateAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $atom_id: LingvodocID, $locale_id: Int!, $content: String!) {
    update_perspective_atom(id: $id, atom_id: $atom_id, locale_id: $locale_id, content: $content) {
      triumph
    }
  }
`;

const updateMetadataMutation = gql`
  mutation UpdateMetadata($id: LingvodocID!, $meta: ObjectVal!) {
    update_perspective(id: $id, additional_metadata: $meta) {
      triumph
    }
  }
`;

const Properties = props => {
  const getTranslation = useContext(TranslationContext);

  const { id, parentId, title, data, actions, updateAtomMutation, updateMetadataMutation } = props;
  const { loading, error, dictionary, perspective } = data;

  if (loading) {
    return (
      <Modal open dimmer size="fullscreen" closeOnDimmerClick={false} closeIcon className="lingvo-modal2">
        <Loader>{getTranslation("Loading")}...</Loader>
      </Modal>
    );
  } else if (error) {
    return (
      <Modal closeIcon onClose={actions.closePerspectivePropertiesModal} open className="lingvo-modal2">
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

  const { translation_gist_id: gistId } = perspective;
  const perspectives = dictionary.perspectives.filter(p => !isEqual(p.id, id));

  return (
    <Modal
      closeIcon
      onClose={actions.closePerspectivePropertiesModal}
      open
      dimmer
      size="fullscreen"
      className="lingvo-modal2"
    >
      <Modal.Header>{title}</Modal.Header>
      <Modal.Content>
        <p>
          {getTranslation("Created by")}
          {": "}
          {perspective.created_by.name}
        </p>
        <p>
          {getTranslation("Created at")}
          {": "}
          {new Date(perspective.created_at * 1e3).toLocaleString()}
        </p>
        <p>
          {getTranslation("Last modified at")}
          {": "}
          {new Date(perspective.last_modified_at * 1e3).toLocaleString()}
        </p>
        <Divider />
        <Header>{getTranslation("Translations")}</Header>
        <TranslationGist objectId={perspective.id} id={gistId} editable updateAtomMutation={updateAtomMutation} />
        <Divider />
        <Header>{getTranslation("Fields")}</Header>
        <Columns perspectiveId={perspective.id} perspectives={perspectives} />
        <Divider />
        <EditPerspectiveMetadata
          metadata={perspective.additional_metadata}
          onSave={meta => {
            updateMetadataMutation({
              variables: {
                id,
                meta
              },
              refetchQueries: [
                {
                  query,
                  variables: {
                    id,
                    parentId
                  }
                }
              ]
            });
          }}
        />
      </Modal.Content>
      <Modal.Actions>
        <Button
          content={getTranslation("Close")}
          onClick={actions.closePerspectivePropertiesModal}
          className="lingvo-button-basic-black"
        />
      </Modal.Actions>
    </Modal>
  );
};

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  parentId: PropTypes.array.isRequired,
  title: PropTypes.string.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired
  }).isRequired,
  actions: PropTypes.shape({
    closePerspectivePropertiesModal: PropTypes.func.isRequired
  }).isRequired
};

export default compose(
  connect(
    state => state.perspectiveProperties,
    dispatch => ({ actions: bindActionCreators({ closePerspectivePropertiesModal }, dispatch) })
  ),
  branch(({ perspective }) => !perspective, renderNothing),
  withProps(({ perspective: { id, parentId, title } }) => ({ id, parentId, title })),
  graphql(updateAtomMutation, { name: "updateAtomMutation" }),
  graphql(updateMetadataMutation, { name: "updateMetadataMutation" }),
  graphql(query),
  // graphql(updateMetadataMutation, { name: 'update' }),
  onlyUpdateForKeys(["perspective", "data"])
)(Properties);
