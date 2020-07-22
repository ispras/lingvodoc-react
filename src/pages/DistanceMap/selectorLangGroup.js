
import React from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { compose, branch, renderNothing } from 'recompose';


function Limiter({mainGroup,dictionaries,mainDictionary,client}){

  console.log(client)
  return(
    <div>
      fsdfsfs
    </div>
  )
}










export default compose(withApollo)(Limiter)