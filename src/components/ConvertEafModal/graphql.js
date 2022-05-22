import { gql } from "@apollo/client";

export const dictionariesQuery = gql`
  query dictionaries {
    dictionaries {
      id
      parent_id
      translations
      additional_metadata {
        authors
      }
    }
  }
`;
export const convertToNewDictionaryMutation = gql`
  mutation convertEaf1(
    $markupIdList: [LingvodocID]!
    $languageId: LingvodocID!
    $atoms: [ObjectVal]!
    $mergeByMeaning: Boolean
    $mergeByMeaningAll: Boolean
    $additionalEntries: Boolean
    $additionalEntriesAll: Boolean
  ) {
    convert_corpus(
      markup_id_list: $markupIdList
      language_id: $languageId
      translation_atoms: $atoms
      merge_by_meaning: $mergeByMeaning
      merge_by_meaning_all: $mergeByMeaningAll
      additional_entries: $additionalEntries
      additional_entries_all: $additionalEntriesAll
    ) {
      triumph
    }
  }
`;

export const convertToExistingDictionaryMutation = gql`
  mutation convertEaf2(
    $markupIdList: [LingvodocID]!
    $dictionaryId: LingvodocID!
    $mergeByMeaning: Boolean
    $mergeByMeaningAll: Boolean
    $additionalEntries: Boolean
    $additionalEntriesAll: Boolean
  ) {
    convert_corpus(
      markup_id_list: $markupIdList
      dictionary_id: $dictionaryId
      merge_by_meaning: $mergeByMeaning
      merge_by_meaning_all: $mergeByMeaningAll
      additional_entries: $additionalEntries
      additional_entries_all: $additionalEntriesAll
    ) {
      triumph
    }
  }
`;
