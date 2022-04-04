import gql from "graphql-tag";

export const languagesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translation
      created_at
      translation_gist_id
    }
    is_authenticated
  }
`;

export const createLanguageMutation = gql`
  mutation ($parent_id: LingvodocID!, $translation_atoms: [ObjectVal]!) {
    create_language(parent_id: $parent_id, translation_atoms: $translation_atoms) {
      language {
        id
        translation_gist_id
      }
    }
  }
`;

export const moveLanguageMutation = gql`
  mutation MoveLanguage($id: LingvodocID!, $parent_id: LingvodocID, $previous_sibling_id: LingvodocID) {
    move_language(id: $id, parent_id: $parent_id, previous_sibling: $previous_sibling_id) {
      triumph
    }
  }
`;

export const deleteLanguageMutation = gql`
  mutation DeleteLanguage($id: LingvodocID!) {
    delete_language(id: $id) {
      triumph
    }
  }
`;
