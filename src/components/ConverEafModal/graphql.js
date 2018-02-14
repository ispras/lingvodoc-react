import { gql } from 'react-apollo';

export const dictionariesQuery = gql`
  query dictionaries {
    dictionaries {
      id
      parent_id
      translation
      additional_metadata {
        authors
      }
    }
  }
`;
export const convertToNewDictionaryMutation = gql`
  mutation convertEaf1($markupId: LingvodocID!, $languageId: LingvodocID!, $atoms: [ObjectVal]!) {
    convert_corpus(markup_id: $markupId, language_id: $languageId, translation_atoms: $atoms) {
      triumph
    }
  }
`;

export const convertToExistingDictionaryMutation = gql`
  mutation convertEaf2($markupId: LingvodocID!, $dictionaryId: LingvodocID!) {
    convert_corpus(markup_id: $markupId, dictionary_id: $dictionaryId) {
      triumph
    }
  }
`;
