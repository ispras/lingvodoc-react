import React from 'react';
import PropTypes from 'prop-types';
import { bindActionCreators } from 'redux';
import { branch, compose, onlyUpdateForKeys, renderNothing, withProps } from 'recompose';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { isEqual } from 'lodash';
import { connect } from 'react-redux';
import { Button, Modal, Divider, Header } from 'semantic-ui-react';
import TranslationGist from 'components/TranslationGist';
import { closePerspectivePropertiesModal } from 'ducks/perspectiveProperties';
import Columns from 'components/Columns';
import { getTranslation } from 'api/i18n';

const query = gql`
  query PerspectivePropsQuery($id: LingvodocID!, $parentId: LingvodocID!) {
    dictionary(id: $parentId) {
      perspectives {
        id
        translation
      }
    }
    perspective(id: $id) {
      id
      parent_id
      translation
      translation_gist_id
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

// const updateMetadataMutation = gql`
//   mutation UpdateMetadata($id: LingvodocID!, $meta: ObjectVal!) {
//     update_dictionary(id: $id, additional_metadata: $meta) {
//       triumph
//     }
//   }
// `;

const Properties = (props) => {
  const { id, data, actions, updateAtomMutation } = props;
  const {
    loading, error, dictionary, perspective,
  } = data;

  if (loading || error) {
    return null;
  }

  const { translation_gist_id: gistId } = perspective;
  const perspectives = dictionary.perspectives.filter(p => !isEqual(p.id, id));

  return (
    <Modal open dimmer size="fullscreen">
      <Modal.Content>
        <Header>{getTranslation("Translations")}</Header>
        <TranslationGist objectId={perspective.id} id={gistId} editable updateAtomMutation={updateAtomMutation} />
        <Divider />
        <Header>{getTranslation("Fields")}</Header>
        <Columns perspectiveId={perspective.id} perspectives={perspectives} />
      </Modal.Content>
      <Modal.Actions>
        <Button icon="minus" content={getTranslation("Close")} onClick={actions.closePerspectivePropertiesModal} />
      </Modal.Actions>
    </Modal>
  );
};

Properties.propTypes = {
  id: PropTypes.array.isRequired,
  // parentId: PropTypes.array.isRequired,
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
  }).isRequired,
  actions: PropTypes.shape({
    closePerspectivePropertiesModal: PropTypes.func.isRequired,
  }).isRequired,
};

export default compose(
  connect(
    state => state.perspectiveProperties,
    dispatch => ({ actions: bindActionCreators({ closePerspectivePropertiesModal }, dispatch) })
  ),
  branch(({ perspective }) => !perspective, renderNothing),
  withProps(({ perspective: { id, parentId } }) => ({ id, parentId })),
  graphql(updateAtomMutation, { name: 'updateAtomMutation' }),
  graphql(query),
  // graphql(updateMetadataMutation, { name: 'update' }),
  onlyUpdateForKeys(['perspective', 'data'])
)(Properties);

