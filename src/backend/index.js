import { gql } from "@apollo/client";

// Queries
export const queryCounter = gql`
  query qcounter($id: LingvodocID!, $mode: String!) {
    perspective(id: $id) {
      id
      counter(mode: $mode)
    }
  }
`;

export const languagesQuery = gql`
  query Languages {
    language_tree {
      id
      parent_id
      translation
      created_at
      translation_gist_id
      additional_metadata {
        toc_mark
      }
    }
    is_authenticated
  }
`;

// Mutations
export const synchronizeMutation = gql`
  mutation {
    synchronize {
      triumph
    }
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

export const updateLanguageMetadataMutation = gql`
  mutation UpdateLanguageMetadata($id: LingvodocID!, $metadata: ObjectVal!) {
    update_language(id: $id, additional_metadata: $metadata) {
      triumph
    }
  }
`;
