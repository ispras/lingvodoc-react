import { gql } from 'react-apollo';

export const languagesQuery = gql`
  query Languages {
    languages {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
  }
`;

export const createLanguageMutation = gql`
  mutation ($parent_id: [Int]!, $translation_atoms: [ObjectVal]!) {
    create_language(parent_id: $parent_id, translation_atoms: $translation_atoms) {
      language {
        id
        translation_gist_id
      }
    }
}`;
