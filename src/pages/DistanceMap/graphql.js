import { gql } from "@apollo/client";

export const allFieldQuery = gql`
  query {
    all_fields {
      id
      translations
      english_translation: translation(locale_id: 2)
      data_type
    }
  }
`;

export const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    dictionaries(proxy: false, published: true) {
      id
      parent_id
      translations
      category
      additional_metadata {
        authors
        location
      }
      perspectives {
        id
        translations
        columns {
          field_id
        }
      }
    }
    perspectives {
      id
      parent_id
      translations
    }
    languages(in_tree_order: true) {
      id
      parent_id
      translations
      created_at
      dictionaries(deleted: false, published: true) {
        id
        parent_id
        translations
        category
        additional_metadata {
          authors
          location
        }
        perspectives {
          id
          translations
          columns {
            field_id
          }
        }
      }
      additional_metadata {
        speakersAmount
      }
    }
    is_authenticated
  }
`;

export const dictionaryName = gql`
  query dictionaryName($id: LingvodocID) {
    dictionary(id: $id) {
      id
      translations
      parent_id
      additional_metadata {
        authors
        location
      }
      perspectives {
        id
        translations
        columns {
          field_id
        }
      }
    }
  }
`;
