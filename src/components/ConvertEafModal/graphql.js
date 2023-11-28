import { gql } from "@apollo/client";

export const dictionariesQuery = gql`
  query dictionaries {
    dictionaries {
      id
      translations
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
    $morphology: Boolean
    $custom_eaf_tiers: ObjectVal
  ) {
    convert_corpus(
      markup_id_list: $markupIdList
      language_id: $languageId
      translation_atoms: $atoms
      merge_by_meaning: $mergeByMeaning
      merge_by_meaning_all: $mergeByMeaningAll
      additional_entries: $additionalEntries
      additional_entries_all: $additionalEntriesAll
      morphology: $morphology
      custom_eaf_tiers: $custom_eaf_tiers
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
    $morphology: Boolean
    $custom_eaf_tiers: ObjectVal
  ) {
    convert_corpus(
      markup_id_list: $markupIdList
      dictionary_id: $dictionaryId
      merge_by_meaning: $mergeByMeaning
      merge_by_meaning_all: $mergeByMeaningAll
      additional_entries: $additionalEntries
      additional_entries_all: $additionalEntriesAll
      morphology: $morphology
      custom_eaf_tiers: $custom_eaf_tiers
    ) {
      triumph
    }
  }
`;
