import gql from 'graphql-tag';


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