import { gql } from 'react-apollo';

export const grantsQuery = gql`
  query publicGrants {
    grants {
      id
      translation
      grant_url
      grant_number
      issuer
      issuer_url
      created_at
      owners {
        id
        name
        login
        intl_name
        email
      }
    }
    user {
      id
    }
  }
`;

export const createGrantPermissionMutation = gql`
  mutation getGrantPermission($grantId: Int!) {
    create_grant_permission(grant_id: $grantId) {
      triumph
    }
  }
`;
