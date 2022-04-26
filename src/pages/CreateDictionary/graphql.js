import { gql } from "@apollo/client";

export const createDictionaryMutation = gql`
  mutation CreateDictionaryMutation(
    $category: Int!
    $parentId: LingvodocID!
    $dictionaryTranslations: [ObjectVal]!
    $perspectives: [ObjectVal]!
    $metadata: ObjectVal
  ) {
    create_dictionary(
      category: $category
      parent_id: $parentId
      translation_atoms: $dictionaryTranslations
      perspectives: $perspectives
      additional_metadata: $metadata
    ) {
      triumph
      dictionary {
        id
        perspectives {
          id
        }
      }
    }
  }
`;

export const allFieldsQuery = gql`
  query allFields {
    all_fields {
      id
      translations
      data_type
      data_type_translation_gist_id
    }
  }
`;

export const corpusTemplateFieldsQuery = gql`
  query allFields {
    template_fields(mode: "corpora") {
      id
      translations
      fake_id
      self_fake_id
    }
  }
`;
