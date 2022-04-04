import gql from "graphql-tag";

export const allFieldQuery = gql`
  query {
    all_fields {
      id
      translation
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
      translation
      category
      additional_metadata {
        authors
        location
      }
      perspectives {
        id
        translation
        columns {
          field_id
        }
      }
    }
    perspectives {
      id
      parent_id
      translation
    }
    language_tree {
      id
      parent_id
      translation
      created_at
      dictionaries(deleted: false, published: true) {
        id
        parent_id
        translation
        category
        additional_metadata {
          authors
          location
        }
        perspectives {
          id
          translation
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
      translation
      parent_id
      additional_metadata {
        authors
        location
      }
      perspectives {
        id
        translation
        columns {
          field_id
        }
      }
    }
  }
`;
