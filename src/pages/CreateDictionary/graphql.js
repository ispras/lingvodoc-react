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
