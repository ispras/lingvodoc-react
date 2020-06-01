import React from 'react';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
const grantsQuery = gql`
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
      
      }
      begin
      end
    }
    user {
      id
    }
   
  }
`;
const dictionaryWithPerspectivesQuery = gql`
  query DictionaryWithPerspectives {
    perspectives {
      id
      parent_id
      translation
    }
    grants {
      id
      translation
      issuer
      grant_number
      additional_metadata {
        participant
      }
    }
    language_tree {
      id
      parent_id
      translation
      created_at
    }
    is_authenticated
  }
`;
class NoGrants extends React.Component {
  constructor(props) {
    super(props);
  console.log(props,'werwpe!!!!!!!!!!!!!!!!!!!!!!!!!!')
  }
  
  render(){
    return(
      <div>

      </div>
    )
  }
}

export default  graphql(dictionaryWithPerspectivesQuery)(NoGrants) ;