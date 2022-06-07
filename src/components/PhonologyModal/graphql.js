import { gql } from "@apollo/client";

export const perspectiveColumnsFieldsQuery = gql`
  query perspectiveColumnsFields($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translations
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
      tree {
        id
        translations
      }
    }
    all_fields {
      id
      translations
      english_translation: translation(locale_id: 2)
      data_type
      data_type_translation_gist_id
    }
  }
`;

export const perspectiveColumnsQuery = gql`
  query perspectiveColumns($perspectiveId: LingvodocID!) {
    perspective(id: $perspectiveId) {
      id
      parent_id
      translations
      tree {
        id
        translations
      }
      columns {
        id
        field_id
        parent_id
        self_id
        position
      }
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

export const phonologyLinkPerspectiveQuery = gql`
  query linkPerspectiveData($perspectiveId: LingvodocID!, $fieldIdList: [LingvodocID]!) {
    phonology_link_perspective_data(perspective_id: $perspectiveId, field_id_list: $fieldIdList) {
      field_data_list
      perspective_id_list
    }
  }
`;

export const phonologyPerspectiveInfoQuery = gql`
  query phonologyPerspectiveInfo {
    perspectives(only_with_phonology_data: true) {
      id
      parent_id
      translations
      status_translations
    }
    dictionaries {
      id
      parent_id
      translations
      status_translations
      perspectives {
        id
        translations
      }
    }
    languages(in_tree_order: true) {
      id
      parent_id
      translations
    }
  }
`;

export const createPhonologyMutation = gql`
  mutation createPhonology(
    $perspectiveId: LingvodocID!
    $groupByDescription: Boolean!
    $translationFieldId: LingvodocID
    $firstTranslation: Boolean!
    $vowelSelection: Boolean!
    $tiers: [String]
    $chartThreshold: Int!
    $keepList: [Int]!
    $joinList: [Int]!
    $generateCsv: Boolean!
    $linkFieldList: [LingvodocID]
    $linkPerspectiveList: [[LingvodocID]]
    $useFastTrack: Boolean!
  ) {
    phonology(
      perspective_id: $perspectiveId
      vowel_selection: $vowelSelection
      group_by_description: $groupByDescription
      only_first_translation: $firstTranslation
      maybe_translation_field: $translationFieldId
      maybe_tier_list: $tiers
      chart_threshold: $chartThreshold
      keep_list: $keepList
      join_list: $joinList
      generate_csv: $generateCsv
      link_field_list: $linkFieldList
      link_perspective_list: $linkPerspectiveList
      use_fast_track: $useFastTrack
    ) {
      triumph
    }
  }
`;

export const computePSDMutation = gql`
  mutation computePSD($idList: [LingvodocID]!, $vowelSelection: Boolean!, $chartThreshold: Int!) {
    phonological_statistical_distance(
      id_list: $idList
      vowel_selection: $vowelSelection
      chart_threshold: $chartThreshold
    ) {
      triumph
    }
  }
`;
