import { gql } from 'react-apollo';

export const perspectiveColumnsQuery = gql`
  query perspectiveColumns($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      translation
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
    }
    all_fields {
      id
      translation
      data_type
      data_type_translation_gist_id
    }
  }
`;

export const phonologyTierListQuery = gql`
  query perspectiveTierList($perspectiveId: LingvodocID!) {
    phonology_tier_list(perspective_id: $perspectiveId) {
      tier_count
      total_count
    }
  }
`;

export const phonologySkipListQuery = gql`
  query perspectiveSkipList($perspectiveId: LingvodocID!) {
    phonology_skip_list(perspective_id: $perspectiveId) {
      markup_count
      neighbour_list
      skip_list
      total_neighbour_count
      total_skip_count
    }
  }
`;

export const createPhonologyMutation = gql`
  mutation createPhonology(
    $perspectiveId: LingvodocID!,
    $groupByDescription: Boolean!,
    $translationFieldId: LingvodocID,
    $firstTranslation: Boolean!,
    $vowelSelection: Boolean!,
    $tiers: [String]!,
    $chartThreshold: Int!,
    $keepList: [Int]!,
    $joinList: [Int]!,
    $generateCsv: Boolean!) {
      phonology(perspective_id: $perspectiveId,
        vowel_selection: $vowelSelection,
        group_by_description: $groupByDescription,
        only_first_translation: $firstTranslation,
        maybe_translation_field: $translationFieldId,
        maybe_tier_list: $tiers,
        chart_threshold: $chartThreshold,
        keep_list: $keepList,
        join_list: $joinList,
        generate_csv: $generateCsv) {
        triumph
      }
  }
`;
