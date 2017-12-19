import { gql } from 'react-apollo';

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

export const searchQuery = gql`
  query SearchEtmologyCandidates($searchString: String!, $fieldId: LingvodocID!) {
    basic_search(searchstring: $searchString, search_in_published: true, field_id: $fieldId, can_add_tags: true) {
      lexical_entries {
        id
        parent_id
      }
      entities {
        id
        parent_id
        field_id
        link_id
        self_id
        created_at
        locale_id
        content
        published
        accepted
        additional_metadata {
          link_perspective_id
        }
      }
    }
  }
`;

export const languageTreeSourceQuery = gql`
  query languageTreeSource {
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
  }
`;
