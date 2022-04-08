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
    language_tree {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
    dictionaries {
      id
      parent_id
      translation
    }
    perspectives {
      id
      parent_id
      translation
    }
    perspective(id: $perspectiveId) {
      id
      parent_id
      translation
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
