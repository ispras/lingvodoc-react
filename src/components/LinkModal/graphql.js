import { gql } from "@apollo/client";

export const createMutation = gql`
  mutation createEntity(
    $parent_id: LingvodocID!
    $field_id: LingvodocID!
    $linkId: LingvodocID!
    $linkPerspectiveId: LingvodocID!
  ) {
    create_entity(
      parent_id: $parent_id
      field_id: $field_id
      link_id: $linkId
      link_perspective_id: $linkPerspectiveId
    ) {
      triumph
    }
  }
`;

export const publishMutation = gql`
  mutation publishEntity($id: LingvodocID!, $published: Boolean!) {
    update_entity(id: $id, published: $published) {
      triumph
    }
  }
`;

export const acceptMutation = gql`
  mutation acceptEntity($id: LingvodocID!, $accepted: Boolean!) {
    update_entity(id: $id, accepted: $accepted) {
      triumph
    }
  }
`;

export const removeMutation = gql`
  mutation removeEntity($id: LingvodocID!) {
    delete_entity(id: $id) {
      triumph
    }
  }
`;

export const languageTreeSourceQuery = gql`
  query linkInfo($perspectiveId: LingvodocID) {
    languages(in_tree_order: true) {
      id
      parent_id
      translations
      created_at
      translation_gist_id
    }
    dictionaries {
      id
      parent_id
      translations
    }
    perspectives {
      id
      parent_id
      translations
    }
    perspective(id: $perspectiveId) {
      id
      parent_id
      translations
      columns {
        id
        parent_id
        self_id
        field_id
        link_id
      }
    }
  }
`;

export const entityQuery = gql`
  query getEntity($id: LingvodocID!) {
    entity(id: $id) {
      id
      marked_for_deletion
    }
  }
`;
