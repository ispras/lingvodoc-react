import gql from 'graphql-tag';

/*
 *  Additional not really used fields, such as created_at in lexical_entires and additional_metadata in
 *  entities, are needed to be present in the query because otherwise, it seems, results of this query
 *  invalidate data of queryLexicalEntries from PerspectiveView/index.js while not forcing it to reload,
 *  breaking perspective view.
 */
export const connectedQuery = gql`
  query connectedWords($id: LingvodocID!, $fieldId: LingvodocID!, $entitiesMode: String!) {
    connected_words(id: $id, field_id: $fieldId, mode: $entitiesMode) {
      lexical_entries {
        id
        parent_id
        created_at
        entities(mode: $entitiesMode) {
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
    basic_search(searchstring: $searchString, perspective_id: $perspectiveId, search_in_published: false, can_add_tags: true) {
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
