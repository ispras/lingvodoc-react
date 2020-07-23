
import React, { useState } from 'react';
import { graphql, withApollo } from 'react-apollo';
import gql from 'graphql-tag';
import { Label, Checkbox } from 'semantic-ui-react';
import { compose, branch, renderNothing } from 'recompose';

const dictName = gql`query dictName($id:LingvodocID) {
  dictionary(id:$id){
    id
    translation
  }
  }
   `

function Limiter({ mainGroup, dictionaries, mainDictionary, client, languagesGroup }) {
  const parent_id = mainDictionary.toJS()[0].parent_id;
  const [labelDict, setLabelDict] = useState(null)

  client.query({
    query: dictName,
    variables: { id: parent_id },
  }).then(
    result => setLabelDict(result.data.dictionary.translation)
  );
  console.log(mainDictionary.toJS())
  console.log('*********************************')
  console.log(languagesGroup)

  return (
    <div>
      <Label size={'massive'} >{labelDict}</Label>
      fsdfsfs
    </div>
  )
}










export default compose(withApollo)(Limiter)