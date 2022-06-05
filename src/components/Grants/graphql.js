import { gql } from "@apollo/client";

export const grantsQuery = gql`
  query publicGrants {
    grants {
      id
      translations
      grant_url
      grant_number
      issuer_translations
      issuer_url
      created_at
      owners {
        id
        name
        login
        intl_name
        email
      }
      begin
      end
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

export const getUserRequestsQuery = gql`
  query userRequests {
    userrequests {
      id
      created_at
      type
      sender_id
      recipient_id
      broadcast_uuid
      message
      subject {
        grant_id
        user_id
        org_id
        dictionary_id
      }
    }
    users {
      id
      intl_name
    }
    grants {
      id
      translations
      grant_url
      grant_number
      issuer_translations
      issuer_url
      created_at
    }
    dictionaries {
      id
      translations
    }
    organizations {
      id
      translations
      about
    }
  }
`;

export const acceptMutation = gql`
  mutation AcceptUserRequest($id: Int!, $accept: Boolean!) {
    accept_userrequest(id: $id, accept: $accept) {
      triumph
    }
  }
`;
