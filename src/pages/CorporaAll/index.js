import React from 'react';
import { getTranslation } from 'api/i18n';
import gql from 'graphql-tag';
import { graphql } from 'react-apollo';
import { compose } from 'recompose';


const dictionariesCopora = gql`
query dictionariesAll{
    dictionaries(category:1){
      parent_id
    }
}`;


const entity = gql`
    query entityAll($id:LingvodocID!){
      entity(id:$id){
      content 
    }
}`;

const test1 = (props) => {
  const { data: { error, loading } } = props
  console.log(props, 'props tes1')
}


const test4 = (props) => {
  const { data: { dictionaries: dictionariesAll } } = props;
  console.log(dictionariesAll, 'dictionary');
  if (dictionariesAll !== undefined) {
    console.log(dictionariesAll.length, 'length')
    for (let i = 0; i < dictionariesAll.length - 1; i++) {
      let id = dictionariesAll[i].parent_id;
      console.log(id, 'id')
    }
  }
return(
  <div>
    tgftergeh
  </div>
)
}


const qwe = (props) => {

  console.log(props, 'props tes1')
//  compose(graphql(dictionariesCopora)(test4));
  return (
    <div>
      fsfsfsw
    </div>
  )
}



export default compose(graphql(dictionariesCopora)(test4));