import { gql } from "@apollo/client";

// Queries
export const dictionariesInfoQuery = gql`
  query getAllDictionaries {
    dictionaries(mode: 1) {
      parent_id
      category
    }
  }
`;

export const getLanguageMetadataQuery = gql`
  query GetLanguageMetadata($id: LingvodocID!) {
    language(id: $id) {
      additional_metadata {
        speakersAmount
      }
    }
  }
`;

const LanguageDetailsFragment = gql`
  fragment LanguageDetails on LanguageTree {
    tree
    languages {
      id
      parent_id
      translations
      in_toc
      dictionaries(deleted: false, published: $published, category: $category) {
        id
        translations
        english_status: status(locale_id: 2)
        additional_metadata {
          authors
        }
        perspectives {
          id
          translations
        }
      }
    }
  }
`;

export const getLanguageTree = gql`
  query GetLanguageTree(
    $languageId: LingvodocID
    $byGrants: Boolean
    $grantId: Int
    $byOrganizations: Boolean
    $organizationId: Int
    $published: Boolean
    $category: Int
    $proxy: Boolean
  ) {
    language_tree(
      dictionary_category: $category
      dictionary_published: $published
      language_id: $languageId
      by_grants: $byGrants
      grant_id: $grantId
      by_organizations: $byOrganizations
      organization_id: $organizationId
      proxy: $proxy
    ) {
      ...LanguageDetails
    }
  }
  ${LanguageDetailsFragment}
`;

export const getLanguagesForSearch = gql`
  query GetLanguagesForSearch($category: Int, $published: Boolean) {
    languages(
      only_with_dictionaries_recursive: true
      dictionary_category: $category
      dictionary_published: $published
    ) {
      id
      translations
      in_toc
      dictionary_count(recursive: true, category: $category, published: $published)
    }
  }
`;

export const getTocGrants = gql`
  query GetTocGrants($category: Int, $published: Boolean) {
    grants(
      has_participant: true
      participant_category: $category
      participant_deleted: false
      participant_published: $published
    ) {
      id
      translations
      issuer_translations
      grant_number
      additional_metadata {
        participant
      }
    }
  }
`;

export const getTocOrganizations = gql`
  query GetTocOrganizations($category: Int, $published: Boolean) {
    organizations(
      has_participant: true
      participant_category: $category
      participant_deleted: false
      participant_published: $published
    ) {
      id
      translations
      additional_metadata {
        participant
      }
    }
  }
`;

export const languagesQuery = gql`
  query Languages {
    languages(in_tree_order: true) {
      id
      parent_id
      translations
      created_at
      translation_gist_id
      additional_metadata {
        toc_mark
        attached_users
      }
    }
  }
`;

export const localDictionaryInfo = gql`
  query LocalDictionaryInfo {
    permission_lists(proxy: false) {
      edit {
        id
      }
    }
  }
`;

export const proxyDictionaryInfo = gql`
  query ProxyDictionaryInfo($proxy: Boolean!, $category: Int) {
    dictionaries(proxy: false, published: true, category: $category) {
      id
    }
    permission_lists(proxy: $proxy) {
      view {
        id
      }
      edit {
        id
      }
      publish {
        id
      }
      limited {
        id
      }
    }
  }
`;

export const queryCounter = gql`
  query qcounter($id: LingvodocID!, $mode: String!) {
    perspective(id: $id) {
      id
      counter(mode: $mode)
    }
  }
`;

export const getPermissionsBulk = gql`
  query checkPermissionsBulk($category: Int!) {
    check_permissions_bulk(category: $category)
  }
`;

// Mutations
export const createLanguageMutation = gql`
  mutation createLanguage($parent_id: LingvodocID!, $translationAtoms: [ObjectVal]!, $metadata: ObjectVal) {
    create_language(parent_id: $parent_id, translation_atoms: $translationAtoms, additional_metadata: $metadata) {
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

export const downloadDictionariesMutation = gql`
  mutation DownloadDictionaries($ids: [LingvodocID]!) {
    download_dictionaries(ids: $ids) {
      triumph
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

export const synchronizeMutation = gql`
  mutation {
    synchronize {
      triumph
    }
  }
`;

export const applySyncMutation = gql`
  mutation ApplySync(
        $perspectiveId: LingvodocID!
        $syncBetween: [String]!
        $action: String
        $debugFlag: Boolean
) {
    apply_sync(
        perspective_id: $perspectiveId
        sync_between: $syncBetween
        action: $action
        debug_flag: $debugFlag) {
      message
      triumph
    }
  }
`;

export const queryListChanges = gql`
  query listChanges(
    $remote: String!
    $syncBetween: [String]!
    $perspectiveId: LingvodocID!
    $userId: Int
    $syncPoint: Float
    $debugFlag: Boolean)
    {
      list_changes(
        remote: $remote
        sync_between: $syncBetween
        perspective_id: $perspectiveId
        user_id: $userId
        sync_point: $syncPoint
        debug_flag: $debugFlag)
  }
`;

export const updateLanguageAtomMutation = gql`
  mutation updateAtom($id: LingvodocID!, $atom_id: LingvodocID, $locale_id: Int!, $content: String!) {
    update_language_atom(id: $id, atom_id: $atom_id, locale_id: $locale_id, content: $content) {
      triumph
    }
  }
`;

export const updateLanguageMetadataMutation = gql`
  mutation UpdateLanguageMetadata($id: LingvodocID!, $metadata: ObjectVal!, $add_user_id: Int, $del_user_id: Int) {
    update_language(id: $id, additional_metadata: $metadata, add_user_id: $add_user_id, del_user_id: $del_user_id) {
      triumph
    }
  }
`;
