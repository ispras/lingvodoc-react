import { gql } from "@apollo/client";

export const connectedQuery = gql`
  query connectedWords($id: LingvodocID!, $fieldId: LingvodocID!, $entitiesMode: String!) {
    connected_words(id: $id, field_id: $fieldId, mode: $entitiesMode) {
      lexical_entries {
        id
        parent_id
      }
    }
  }
`;

export const connectMutation = gql`
  mutation connectMutation($fieldId: LingvodocID!, $connections: [LingvodocID]!) {
    join_lexical_entry_group(field_id: $fieldId, connections: $connections) {
      triumph
    }
  }
`;

export const disconnectMutation = gql`
  mutation disconnectMutation($lexicalEntryId: LingvodocID!, $fieldId: LingvodocID!) {
    leave_lexical_entry_group(id: $lexicalEntryId, field_id: $fieldId) {
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

export const searchQuery = gql`
  query SearchEtmologyCandidates($searchString: String!, $perspectiveId: LingvodocID) {
    basic_search(
      searchstring: $searchString
      perspective_id: $perspectiveId
      search_in_published: false
      can_add_tags: true
    ) {
      lexical_entries {
        id
        parent_id
      }
    }
  }
`;

export const languageTreeSourceQuery = gql`
  query languageTreeSource {
    languages(in_tree_order: true) {
      id
      parent_id
      translations
      created_at
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
  }
`;

export const perspectiveFieldsQuery = gql`
  query perspectiveFields($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      columns {
        field {
          id
          english_translation: translation(locale_id: 2)
        }
      }
    }
  }
`;
