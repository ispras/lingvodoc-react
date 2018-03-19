import { gql } from 'react-apollo';

export const createDictionaryMutation = gql`
  mutation CreateDictionaryMutation(
    $parentId: LingvodocID!
    $dictionaryTranslations: [ObjectVal]!
    $perspectives: [ObjectVal]!
  ) {
    create_dictionary(parent_id: $parentId, translation_atoms: $dictionaryTranslations, perspectives: $perspectives) {
      triumph
    }
  }
`;

export const allFieldsQuery = gql`
  query allFields {
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
  }
`;
